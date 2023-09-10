import { v4 as uuid } from 'uuid';

import { TVertex } from './interface';
import { ILinkedList, LinkedList } from '../LinkedList';

export class Vertex<T = unknown> implements TVertex<T> {
  uuid: string;
  index: number;
  value: T | null = null;
  edges: ILinkedList<TVertex<T>>;
  visited: boolean;

  constructor(index: number) {
    this.uuid = uuid();
    this.index = index;
    this.value = null;
    this.visited = false;
    this.edges = new LinkedList<TVertex<T>>();
  }
}
