export interface IStack<T> {
  get length(): number;
  isEmpty(): boolean;
  push(value: T): void;
  pop(): T | undefined;
}
