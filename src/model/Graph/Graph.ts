import { IGraph, TVertex } from './interface';
import { Vertex } from './Vertex';
import { Stack, IStack, SimpleQueue, ISimpleQueue } from '../../lib';

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
    const queue: ISimpleQueue<TVertex<T>> = new SimpleQueue();
    const visited: Set<string> = new Set();
    const traversal: number[] = [];

    const visitNode = (index: number): void => {
      visited.add(this.vertices[index].uuid);
      queue.push(this.vertices[index]);
      traversal.push(index);
    };

    visitNode(0);

    while (queue.length) {
      const vertex = queue.shift();
      if (!vertex) return traversal;

      for (const adjacent of vertex.edges.values) {
        if (adjacent && !visited.has(adjacent.uuid)) {
          visitNode(adjacent.index);
        }
      }
    }

    return traversal;
  }

  depthFirstSearch(): number[] {
    const stack: IStack<IterableIterator<TVertex<T>>> = new Stack();
    const visited: Set<string> = new Set();
    const traversal: number[] = [];

    stack.push(this.#getIterator(this.vertices));

    while (stack.length) {
      const iterator = stack.pop();
      if (!iterator) return traversal;

      for (const vertex of iterator) {
        if (vertex && !visited.has(vertex.uuid)) {
          visited.add(vertex.uuid);

          const adjacentVertices = Array.from(vertex.edges.values);

          stack.push(iterator);
          stack.push(this.#getIterator(adjacentVertices));
          traversal.push(vertex.index);
          break;
        }
      }
    }

    return traversal;
  }

  detectCycle(): boolean {
    const visited: Array<boolean> = new Array(this.vertices.length).fill(false);
    const recNodes: Array<boolean> = new Array(this.vertices.length).fill(false);

    const detect = (i: number, visited: Array<boolean>, recNodes: Array<boolean>): boolean => {
      if (!visited[i]) {
        const node = this.vertices[i];
        visited[i] = true;
        recNodes[i] = true;

        for (const adjacent of node.edges.values) {
          const j = adjacent.index;
          if (visited[j] && recNodes[j]) return true;
          if (!visited[j] && detect(j, visited, recNodes)) return true;
        }
      }

      recNodes[i] = false;
      return false;
    };

    this.vertices.forEach((_, index) => {
      if (detect(index, visited, recNodes)) return true;
    });

    return false;
  }

  *#depthFirstTraversalGenerator(vertex: TVertex<T>): Generator<TVertex<T>> {
    const id = vertex.index;
    this.vertices[id].visited = true;
    yield vertex;

    if (!vertex.edges.length) return;

    for (const node of vertex.edges.values) {
      if (!node.visited) yield* this.#depthFirstTraversalGenerator(node);
    }
  }

  depthFirstTraversal(): IterableIterator<TVertex<T>> {
    const firstNode = this.vertices[0];
    const generator = this.#depthFirstTraversalGenerator(firstNode);

    return {
      [Symbol.iterator](): IterableIterator<TVertex<T>> {
        return this;
      },
      next(): IteratorResult<TVertex<T>> {
        return generator.next();
      },
    };
  }

  findShortestPath(sourceIndex: number, targetIndex: number): number {
    const queue: ISimpleQueue<TVertex<T>> = new SimpleQueue();
    const visited: Set<string> = new Set();
    const sourceNode = this.vertices[sourceIndex];

    let depthLevel = 0;

    visited.add(sourceNode.uuid);
    queue.push(sourceNode);

    while (queue.length) {
      const vertex = queue.shift();
      if (!vertex) return depthLevel;

      for (const adjacent of vertex.edges.values) {
        if (adjacent && !visited.has(adjacent.uuid)) {
          visited.add(adjacent.uuid);
          if (adjacent.index === targetIndex) return depthLevel;
          queue.push(adjacent);
        }
      }

      if (vertex.edges.length > 0) depthLevel++;
    }

    return depthLevel;
  }

  mapGraphOver(): Map<string, TVertex<T>[]> {
    return this.vertices.reduce((acc: Map<string, TVertex<T>[]>, vertex) => {
      return acc.set(vertex.uuid, [...vertex.edges.values]);
    }, new Map());
  }

  printGraph(): void {
    console.log('>>Adjacency List of the Graph<<');

    this.vertices.forEach((node, index) => {
      process.stdout.write(`|id: ${String(index)}, value: ${String(node.value)}| => `);

      [...node.edges.values].forEach((adjacent) => {
        process.stdout.write(`[${String(adjacent.value)}] -> `);
      });

      console.log('null');
    });
  }
}
