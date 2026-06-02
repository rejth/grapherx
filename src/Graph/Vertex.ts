import { v4 as uuid } from 'uuid'

import { type ILinkedList, LinkedList } from '../LinkedList'

import type { VertexId } from './interface'

export type TVertex<T> = {
  uuid: string
  id: VertexId
  value: T | null
  edges: ILinkedList<TVertex<T>>
  visited: boolean
}

export class Vertex<T = unknown> implements TVertex<T> {
  uuid: string
  id: VertexId
  value: T | null = null
  edges: ILinkedList<TVertex<T>>
  visited: boolean

  constructor(id: VertexId) {
    this.uuid = uuid()
    this.id = id
    this.value = null
    this.visited = false
    this.edges = new LinkedList<TVertex<T>>()
  }
}
