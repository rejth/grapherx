export interface ISimpleQueue<T> {
  get first(): T | null;
  get last(): T | null;
  isEmpty(): boolean;
  push(value: T): void;
  shift(): T | undefined;
}

export interface IDeque<T> extends ISimpleQueue<T>{
  unshift(value: T): void;
  pop(): T | undefined;
}
