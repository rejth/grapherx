import { v4 as uuid } from 'uuid'

import { type ILinkedList, LinkedList } from '../LinkedList'

import type { VertexId } from './interface'

export type TVertex<T> = {
  uuid: string
  id: VertexId
  value: T
  edges: ILinkedList<TVertex<T>>
}

export class Vertex<T = unknown> implements TVertex<T> {
  uuid: string
  id: VertexId
  value: T
  edges: ILinkedList<TVertex<T>>

  constructor(id: VertexId, value: T) {
    this.uuid = uuid()
    this.id = id
    this.value = value
    this.edges = new LinkedList<TVertex<T>>()
  }
}
