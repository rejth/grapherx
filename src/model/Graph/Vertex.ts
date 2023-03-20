import { v4 as uuid } from "uuid";

import type { TVertex, TAdjacentVertex } from "./interface";
import { LinkedList, ILinkedList  } from "../LinkedList";

export class Vertex<T = unknown> implements TVertex<T> {
  uuid: string;
  index: number;
  value: T | null = null;
  edges: ILinkedList<TAdjacentVertex<T>>;

  constructor(index: number) {
    this.uuid = uuid();
    this.index = index;
    this.value = null;
    this.edges = new LinkedList<TAdjacentVertex<T>>();
  }
}
