import { ILinkedList } from "../../lib";

export interface IGraph<T> {
  get vertices(): TVertex<T>[];
  addVertex(index: number, value: T): void;
  addEdge(sourceIndex: number, targetIndex: number): void;
  updateVertex(index: number, newValue: T): Iterable<TVertex<T>>;
  breadthFirstSearch(): number[];
  depthFirstSearch(): number[];
  depthFirstTraversal(): IterableIterator<T | null>;
  searchCycles(): void;
  findShortestPath(): void;
  printGraph(): void;
}

export type TVertex<T> = {
  uuid: string;
  index: number;
  value: T | null;
  edges: ILinkedList<TVertex<T>>;
  visited: boolean;
}
