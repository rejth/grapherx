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

export class EdgeAlreadyExistsError extends Error {
  constructor(sourceId: VertexId, targetId: VertexId) {
    super(`Edge from "${String(sourceId)}" to "${String(targetId)}" already exists`)
    this.name = 'EdgeAlreadyExistsError'
  }
}

export class EdgeNotFoundError extends Error {
  constructor(sourceId: VertexId, targetId: VertexId) {
    super(`Edge from "${String(sourceId)}" to "${String(targetId)}" not found`)
    this.name = 'EdgeNotFoundError'
  }
}

export class SelfLoopError extends Error {
  constructor(id: VertexId) {
    super(`Self-loops are not allowed: vertex ${String(id)}`)
    this.name = 'SelfLoopError'
  }
}

export class CycleError extends Error {
  constructor() {
    super('Graph contains a cycle — topological sort is not possible')
    this.name = 'CycleError'
  }
}
