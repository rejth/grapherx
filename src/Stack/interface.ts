export interface IStack<T> {
  stack: T[];
  get length(): number;
  isEmpty(): boolean;
  push(value: T): void;
  pop(): T | undefined;
}
