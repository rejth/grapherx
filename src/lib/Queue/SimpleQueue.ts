import { ILinkedList, LinkedList } from "../LinkedList";
import { ISimpleQueue } from "./interface";

export class SimpleQueue<T = unknown> implements ISimpleQueue<T> {
  protected queue: ILinkedList<T>;

  constructor() {
    this.queue = new LinkedList<T>();
  }

  get first(): T | null {
    return this.queue.first?.value || null
  }

  get last(): T | null {
    return this.queue.last?.value || null
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  push(value: T): void {
    this.queue.insertLast(value);
  }

  shift(): T | undefined {
    if (this.isEmpty()) throw new Error('Queue is empty');
    return this.queue.deleteFirst()?.value;
  }
}
