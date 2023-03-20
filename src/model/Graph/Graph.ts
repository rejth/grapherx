import { IGraph, TVertex, TAdjacentVertex } from "./interface";
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

    const { edges: targetEdges, ...targetRest } = this.vertices[targetIndex];
    const { edges: sourceEdges, ...sourceRest } = this.vertices[sourceIndex];
    this.vertices[sourceIndex].edges.insertFirst(targetRest);
    this.vertices[targetIndex].edges.insertFirst(sourceRest);
  }

  updateVertex(index: number, newValue: T): Iterable<TAdjacentVertex<T>> {
    this.vertices[index].value = newValue;
    const vertex = this.vertices[index];

    for (const adjacentVertex of vertex.edges.values) {
      const currentVertex = this.vertices[adjacentVertex.index];

      let currentNode = currentVertex.edges.first;
      while (currentNode) {
        if (currentNode?.value.index == index) {
          currentNode.value = {...currentNode.value, value: newValue };
          break;
        }
        currentNode = currentNode.next;
      }
    }

    return vertex.edges.values;
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
