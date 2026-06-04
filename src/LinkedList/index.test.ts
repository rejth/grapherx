import * as LinkedListModule from './index'

describe('LinkedList module public exports', () => {
  it('does not export LinkedList class', () => {
    expect('LinkedList' in LinkedListModule).toBe(false)
  })
})
