import { ILinkedList } from '../LinkedList';

export interface IGraph<T> {
  get vertices(): TVertex<T>[];
  addVertex(nodeIndex: number, value: T): void;
  addEdge(sourceNodeIndex: number, targetNodeIndex: number): void;
  updateVertex(index: number, newValue: T): Iterable<TVertex<T>>;
  breadthFirstSearch(): number[];
  depthFirstSearch(): number[];
  depthFirstTraversal(startNodeIndex: number): IterableIterator<TVertex<T>>;
  detectCycle(): boolean;
  findShortestPath(sourceNodeIndex: number, targetNodeIndex: number): number;
  findMotherVertex(): TVertex<T> | undefined;
  removeVertex(index: number): TVertex<T> | undefined;
  removeEdge(sourceNodeIndex: number, targetNodeIndex: number): TVertex<T> | undefined;
  checkPath(sourceNodeIndex: number, targetNodeIndex: number): boolean;
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
