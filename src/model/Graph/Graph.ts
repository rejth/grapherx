import { IGraph, TVertex } from "./interface";
import { Vertex } from "./Vertex";

export class Graph<T = unknown> implements IGraph<T> {
  #vertices: TVertex<T>[];
  readonly #verticesCount: number;

  constructor(verticesCount: number) {
    this.#vertices = new Array(verticesCount);
    this.#verticesCount = verticesCount;

    for (let i = 0; i < verticesCount; i++) {
      this.#vertices[i] = new Vertex<T>(i);
    }
  }

  get vertices(): TVertex<T>[] {
    return this.#vertices;
  }

  set vertices(data: TVertex<T>[]) {
    this.#vertices = data;
  }

  addVertex(index: number, value: T): void {
    this.vertices[index].value = value;
  }

  addEdge(sourceIndex: number, targetIndex: number): void {
    if (sourceIndex > this.#verticesCount || targetIndex > this.#verticesCount) return;
    this.vertices[sourceIndex].edges.insertFirst(this.vertices[targetIndex]);
    this.vertices[targetIndex].edges.insertFirst(this.vertices[sourceIndex]);
  }

  updateVertex(index: number, newValue: T): Iterable<TVertex<T>> {
    this.vertices[index].value = newValue;
    return this.vertices[index].edges.values;
  }

  printGraph(): void {
    console.log(">>Adjacency List of the Graph<<");

    for (let i = 0; i < this.#verticesCount; i++) {
      const vertex = this.vertices[i];

      if (vertex.value) {
        process.stdout.write("|" + `id: ${String(i)}, value: ${String(vertex.value)}` + "| => ");
        for (const value of vertex.edges.values) {
          process.stdout.write("[" + String(value.value) + "] -> ");
        }

      }
      console.log("null");
    }
  }
}
