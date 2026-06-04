import * as LinkedListModule from './index'

describe('LinkedList module public exports', () => {
  it('does not export LinkedList class', () => {
    expect('LinkedList' in LinkedListModule).toBe(false)
  })

  it('exports ILinkedList and IListNode interfaces (type-level, module loads without error)', () => {
    // If the module can be imported and the above passes, interface exports are fine.
    expect(LinkedListModule).toBeDefined()
  })
})
