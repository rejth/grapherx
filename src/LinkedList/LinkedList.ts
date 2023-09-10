import { ILinkedList, IListNode } from './interface';
import { ListNode } from './ListNode';

export class LinkedList<T = unknown> implements ILinkedList<T> {
  #first: IListNode<T> | null;
  #last: IListNode<T> | null;
  length: number;

  constructor() {
    this.#first = null;
    this.#last = null;
    this.length = 0;
  }

  get first(): IListNode<T> | null {
    return this.#first;
  }

  set first(node: IListNode<T> | null) {
    this.#first = node;
  }

  get last(): IListNode<T> | null {
    return this.#last;
  }

  set last(node: IListNode<T> | null) {
    this.#last = node;
  }

  insertLast(value: T): void {
    const node = new ListNode<T>(value);

    if (this.length === 0) {
      this.first = node;
      this.last = node;
    } else {
      let current = this.first;
      const currentLast = this.last;

      this.last = node;
      this.last.prev = currentLast;

      while (current?.next) {
        current = current.next;
      }

      if (current) {
        current.next = node;
        current.next.prev = currentLast;
      }
    }

    this.length++;
  }

  insertFirst(value: T): void {
    const node = new ListNode<T>(value);

    if (this.length === 0) {
      this.first = node;
      this.last = node;
    } else {
      const currentFirst = this.first;
      this.first = node;
      this.first.next = currentFirst;

      if (this.first.next?.prev) {
        this.first.next.prev = this.first;
      }
    }

    this.length++;
  }

  deleteLast(): IListNode<T> | undefined {
    if (!this.last) return undefined;
    const currentLast = this.last;

    if (this.length > 1) {
      this.last = currentLast.prev;

      if (this.last?.next) {
        this.last.next = null;
      }
    }

    this.length--;

    if (this.length === 0) {
      this.first = null;
      this.last = null;
    }

    return currentLast;
  }

  deleteFirst(): IListNode<T> | undefined {
    if (!this.first) return undefined;
    const currentFirst = this.first;

    if (this.length > 1) {
      this.first = currentFirst.next;

      if (this.first?.prev) {
        this.first.prev = null;
      }
    }

    this.length--;

    if (this.length === 0) {
      this.first = null;
      this.last = null;
    }

    return currentFirst;
  }

  searchByValue(value: T): IListNode<T> | undefined {
    if (!this.first) return undefined;
    let current = this.first;

    while (current) {
      if (JSON.stringify(current.value) === JSON.stringify(value)) return current;
      current = current.next!;
    }

    return undefined;
  }

  deleteByIndex(index: number): IListNode<T> | undefined {
    if (!this.first) return undefined;
    let current = this.first;
    let counter = 0;

    while (current) {
      counter++;
      if (index === counter) {
        const deleted = current;
        if (current?.next && current?.prev) {
          current.next.prev = deleted.prev;
          current.prev.next = deleted.next;
        }
        return deleted;
      }
      current = current.next!;
    }

    return undefined;
  }

  get nodes(): Iterable<IListNode<T>> {
    let currentNode = this.first;
    return {
      *[Symbol.iterator](): Iterator<IListNode<T>> {
        while (currentNode) {
          yield currentNode;
          currentNode = currentNode.next;
        }
      },
    };
  }

  get values(): Iterable<T> {
    let currentNode = this.first;
    return {
      *[Symbol.iterator](): Iterator<T> {
        while (currentNode?.value) {
          yield currentNode.value;
          currentNode = currentNode.next;
        }
      },
    };
  }
}
