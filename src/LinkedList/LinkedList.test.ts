import { LinkedList } from './LinkedList'

describe('LinkedList', () => {
  it('inserts values at the tail and exposes ordered values', () => {
    const list = new LinkedList<number>()

    list.insertLast(1)
    list.insertLast(2)
    list.insertLast(3)

    expect(list.length).toBe(3)
    expect(list.first?.value).toBe(1)
    expect(list.last?.value).toBe(3)
    expect([...list.values]).toEqual([1, 2, 3])
  })

  it('links nodes in both directions', () => {
    const list = new LinkedList<number>()

    list.insertLast(1)
    list.insertLast(2)
    list.insertLast(3)

    expect(list.last?.prev?.next?.value).toBe(3)
    expect(list.last?.prev?.prev?.value).toBe(1)
    expect(list.first?.next?.value).toBe(2)
    expect(list.first?.next?.next?.value).toBe(3)
    expect(list.first?.next?.prev?.value).toBe(1)
  })

  it('inserts at the head and deletes from both ends', () => {
    const list = new LinkedList<number>()

    list.insertLast(1)
    list.insertLast(2)
    list.insertLast(3)
    list.insertFirst(4)

    expect([...list.values]).toEqual([4, 1, 2, 3])
    expect(list.deleteLast()?.value).toBe(3)
    expect(list.deleteFirst()?.value).toBe(4)
    expect([...list.values]).toEqual([1, 2])
    expect(list.length).toBe(2)
  })

  it('searches and iterates nodes through the public interface', () => {
    const list = new LinkedList<number>()

    list.insertLast(1)
    list.insertLast(2)
    list.insertLast(3)

    expect(list.searchByValue(2)?.value).toBe(2)
    expect([...list.nodes].map((node) => node.value)).toEqual([1, 2, 3])
  })
})
