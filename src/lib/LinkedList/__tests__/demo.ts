import { LinkedList } from '../LinkedList';

const list = new LinkedList();

list.insertLast(1);
list.insertLast(2);
list.insertLast(3);

console.log('list:', list);

console.log(list.first?.value); // 1
console.log(list.last?.value); // 3

console.log(list.last?.prev?.next?.value); // 3
console.log(list.last?.prev?.prev?.value); // 1

console.log(list.first?.next?.value); // 2
console.log(list.first?.next?.next?.value); // 3
console.log(list.first?.next?.prev?.value); // 1

for (const value of list.nodes) {
  console.log('Value of Iterable Linked list: ', value);
}

list.insertFirst(4);

const last = list.deleteLast();
console.log('last: ', last);

const first = list.deleteFirst();
console.log('first', first);
