export interface ILinkedList<T> {
  length: number;
  insertFirst(value: T): void;
  insertLast(value: T): void;
  deleteFirst(): IListNode<T> | undefined;
  deleteLast(): IListNode<T> | undefined;
  get first(): IListNode<T> | null;
  get last(): IListNode<T> | null;
  get nodes(): Iterable<IListNode<T>>;
  get values(): Iterable<T>;
}

export interface IListNode<T> {
  value: T;
  next: IListNode<T> | null;
  prev: IListNode<T> | null;
}
