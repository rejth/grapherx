import { IGraph, TVertex } from "./interface";
import { Vertex } from "./Vertex";
import { Deque, IDeque } from "../../lib";

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

  #getIterator(array: TVertex<T>[] = []): IterableIterator<TVertex<T>> {
    return array.values();
  }

  addVertex(index: number, value: T): void {
    this.vertices[index].value = value;
  }

  addEdge(sourceIndex: number, targetIndex: number): void {
    if (sourceIndex > this.#verticesCount || targetIndex > this.#verticesCount) return;
    this.vertices[sourceIndex].edges.insertFirst(this.vertices[targetIndex]);
  }

  updateVertex(index: number, newValue: T): Iterable<TVertex<T>> {
    this.vertices[index].value = newValue;
    return this.vertices[index].edges.values;
  }

  breadthFirstSearch(): number[] {
    const queue: IDeque<TVertex<T>> = new Deque();
    const traversal: number[] = [];

    this.vertices[0].visited = true;
    queue.push(this.vertices[0])
    traversal.push(this.vertices[0].index);

    while (queue.length) {
      const vertex = queue.shift();
      if (!vertex) return traversal;

      for (const adjacent of vertex.edges.nodes) {
        if (adjacent && !adjacent.value.visited) {
          const id = adjacent.value.index;
          this.vertices[id].visited = true;

          queue.push(this.vertices[id]);
          traversal.push(id);
        }
      }
    }

    for (const node of this.vertices) {
      node.visited = false;
    }

    return traversal;
  }

  depthFirstSearch(): number[] {
    const stack: IterableIterator<TVertex<T>>[] = [this.#getIterator(this.vertices)];
    const traversal: number[] = [];

    while (stack.length) {
      const iterator = stack.pop();
      if (!iterator) return traversal;

      for (const vertex of iterator) {
        if (vertex && !vertex.visited) {
          const id = vertex.index;
          this.vertices[id].visited = true;

          const adjacentVertices = Array.from(vertex.edges.values);

          stack.push(iterator);
          stack.push(this.#getIterator(adjacentVertices));
          traversal.push(vertex?.index);
          break;
        }
      }
    }

    for (const node of this.vertices) {
      node.visited = false;
    }

    return traversal;
  }

  *#generateGraphValues(vertex: TVertex<T>): Generator<T | null> {
    if (!vertex.visited) yield vertex.value;

    const id = vertex.index;
    this.vertices[id].visited = true;

    const adjacentVertices = Array.from(vertex.edges.values);
    if (!adjacentVertices || adjacentVertices.length === 0) return;

    for (const node of adjacentVertices) {
      yield* this.#generateGraphValues(node);
    }
  }

  depthFirstTraversal(): IterableIterator<T | null> {
    const generator = this.#generateGraphValues(this.vertices[0])
    return {
      [Symbol.iterator](): IterableIterator<T | null>  {
        return this;
      },

      next(): IteratorResult<T | null> {
        return generator.next()
      }
    }
  }

  searchCycles(): void {
    return;
  }

  findShortestPath(): void {
    return;
  }

  printGraph(): void {
    console.log(">>Adjacency List of the Graph<<");

    for (let i = 0; i < this.#verticesCount; i++) {
      const vertex = this.vertices[i];

      if (vertex.value) {
        process.stdout.write(`|id: ${String(i)}, value: ${String(vertex.value)}| => `);
        for (const value of vertex.edges.values) {
          process.stdout.write(`[${String(value.value)}] -> `);
        }

      }
      console.log("null");
    }
  }
}
