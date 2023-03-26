import {v4 as uuid} from "uuid";

import { TraversalColors, TVertex } from "./interface";
import { ILinkedList, LinkedList } from "../../lib";

export class Vertex<T = unknown> implements TVertex<T> {
  uuid: string;
  index: number;
  value: T | null = null;
  edges: ILinkedList<TVertex<T>>;
  visited: boolean;
  traversalColor: TraversalColors;

  constructor(index: number) {
    this.uuid = uuid();
    this.index = index;
    this.value = null;
    this.visited = false;
    this.traversalColor = TraversalColors.WHITE;
    this.edges = new LinkedList<TVertex<T>>();
  }
}
