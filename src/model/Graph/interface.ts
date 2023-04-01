import { ILinkedList } from '../../lib';

export interface IGraph<T> {
  get vertices(): TVertex<T>[];
  addVertex(index: number, value: T): void;
  addEdge(sourceIndex: number, targetIndex: number): void;
  updateVertex(index: number, newValue: T): Iterable<TVertex<T>>;
  breadthFirstSearch(): number[];
  depthFirstSearch(): number[];
  detectCycles(): TGraphCycleInfo<T> | boolean;
  findShortestPath(sourceIndex: number, targetIndex: number): number;
  printGraph(): void;
}

export type TGraphCycleInfo<T> = {
  cycleIsDetected: boolean;
  errorMessage: string;
  subGraph: TVertex<T>[];
};

export type TVertex<T> = {
  uuid: string;
  index: number;
  value: T | null;
  edges: ILinkedList<TVertex<T>>;
  visited: boolean;
  traversalColor: TraversalColors;
};

export const enum TraversalColors {
  WHITE = 'WHITE',
  GREY = 'GREY',
  BLACK = 'BLACK',
}
