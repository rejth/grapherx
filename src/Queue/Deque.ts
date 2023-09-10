import { IDeque } from './interface';
import { SimpleQueue } from './SimpleQueue';

export class Deque<T = unknown> extends SimpleQueue<T> implements IDeque<T> {
  constructor() {
    super();
  }

  pop(): T | undefined {
    if (this.isEmpty()) throw new Error('Queue is empty');
    return this.queue.deleteLast()?.value;
  }

  unshift(value: T): void {
    this.queue.insertFirst(value);
  }
}
