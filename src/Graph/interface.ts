import { ILinkedList } from '../LinkedList';

export interface IGraph<T> {
  get vertices(): TVertex<T>[];
  addVertex(index: number, value: T): void;
  addEdge(sourceIndex: number, targetIndex: number): void;
  updateVertex(index: number, newValue: T): Iterable<TVertex<T>>;
  breadthFirstSearch(): number[];
  depthFirstSearch(): number[];
  depthFirstTraversal(startIndex: number): IterableIterator<TVertex<T>>;
  detectCycle(): boolean;
  findShortestPath(sourceIndex: number, targetIndex: number): number;
  findMotherVertex(): TVertex<T> | undefined;
  removeVertex(index: number): TVertex<T> | undefined;
  removeEdge(sourceNodeIndex: number, targetNodeIndex: number): TVertex<T> | undefined;
  mapGraphOver(): Map<string, TVertex<T>[]>;
  printGraph(): void;
}

export type TVertex<T> = {
  uuid: string;
  index: number;
  value: T | null;
  edges: ILinkedList<TVertex<T>>;
  visited: boolean;
};
