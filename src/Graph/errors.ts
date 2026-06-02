import type { VertexId } from './interface'

export class VertexAlreadyExistsError extends Error {
  constructor(id: VertexId) {
    super(`Vertex with id "${String(id)}" already exists`)
    this.name = 'VertexAlreadyExistsError'
  }
}

export class VertexNotFoundError extends Error {
  constructor(id: VertexId) {
    super(`Vertex with id "${String(id)}" not found`)
    this.name = 'VertexNotFoundError'
  }
}
