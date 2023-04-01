import { IListNode } from './interface';

export class ListNode<T = unknown> implements IListNode<T> {
  value: T;
  next: IListNode<T> | null = null;
  prev: IListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}
