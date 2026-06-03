import type { VertexId } from './interface'

export type TVertex<T> = {
  id: VertexId
  value: T
}

export class Vertex<T = unknown> implements TVertex<T> {
  id: VertexId
  value: T

  constructor(id: VertexId, value: T) {
    this.id = id
    this.value = value
  }
}
