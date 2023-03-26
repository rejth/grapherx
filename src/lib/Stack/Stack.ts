import { IStack } from "./interface";

export class Stack<T> implements IStack<T> {
  stack: T[];

  constructor() {
    this.stack = [];
  }

  get length(): number {
    return this.stack.length;
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }

  push(value: T): void {
    this.stack.push(value);
  }

  pop(): T | undefined {
    if (this.isEmpty()) throw new Error('Stack is empty');
    return this.stack.pop();
  }
}
