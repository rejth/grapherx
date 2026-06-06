import {
  CycleError,
  EdgeAlreadyExistsError,
  EdgeNotFoundError,
  SelfLoopError,
  VertexAlreadyExistsError,
  VertexNotFoundError,
} from './errors'
import type { IGraph, VertexId, VertexSnapshot } from './interface'
import { type TVertex, Vertex } from './Vertex'

type EdgeRecord = Record<string, never>

type TraversalStep<T> = {
  vertex: TVertex<T>
  distance: number
}

class TraversalQueue<T> {
  #items: T[] = []
  #nextIndex = 0

  get length(): number {
    return this.#items.length - this.#nextIndex
  }

  push(value: T): void {
    this.#items.push(value)
  }

  shift(): T | undefined {
    if (!this.length) return undefined
    const value = this.#items[this.#nextIndex]
    this.#nextIndex++
    return value
  }
}

export class Graph<T = unknown> implements IGraph<T> {
  #vertices: Map<VertexId, TVertex<T>>
  #adjacencyMap: Map<VertexId, Map<VertexId, EdgeRecord>>
  #edgeCount = 0

  constructor() {
    this.#vertices = new Map()
    this.#adjacencyMap = new Map()
  }

  /** Returns the number of vertices in the graph. */
  get vertexCount(): number {
    return this.#vertices.size
  }

  /** Returns the number of directed edges in the graph. */
  get edgeCount(): number {
    return this.#edgeCount
  }

  #toSnapshot(vertex: TVertex<T>): VertexSnapshot<T> {
    return {
      id: vertex.id,
      value: vertex.value,
    }
  }

  #getAdjacentVertices(id: VertexId): TVertex<T>[] {
    const innerMap = this.#adjacencyMap.get(id)
    if (!innerMap) {
      throw new Error(`Invariant violation: no adjacency entry for vertex "${String(id)}"`)
    }

    return Array.from(innerMap.keys()).flatMap((adjId) => {
      const vertex = this.#vertices.get(adjId)
      return vertex ? [vertex] : []
    })
  }

  #breadthFirstSteps(startId: VertexId): TraversalStep<T>[] {
    const startVertex = this.#vertices.get(startId)
    if (!startVertex) return []

    const queue = new TraversalQueue<TraversalStep<T>>()
    const visited = new Set<VertexId>()
    const traversal: TraversalStep<T>[] = []

    visited.add(startVertex.id)
    queue.push({ vertex: startVertex, distance: 0 })

    while (queue.length) {
      const step = queue.shift()
      if (!step) return traversal

      traversal.push(step)

      for (const adjacent of this.#getAdjacentVertices(step.vertex.id)) {
        if (visited.has(adjacent.id)) continue
        visited.add(adjacent.id)
        queue.push({ vertex: adjacent, distance: step.distance + 1 })
      }
    }

    return traversal
  }

  #depthFirstVertices(startVertices: Iterable<TVertex<T>>): TVertex<T>[] {
    const stack: IterableIterator<TVertex<T>>[] = []
    const visited = new Set<VertexId>()
    const traversal: TVertex<T>[] = []

    stack.push(Array.from(startVertices).values())

    while (stack.length) {
      const iterator = stack.pop()
      if (!iterator) return traversal

      for (const vertex of iterator) {
        if (visited.has(vertex.id)) continue

        visited.add(vertex.id)
        traversal.push(vertex)
        stack.push(iterator)
        stack.push(this.#getAdjacentVertices(vertex.id).values())
        break
      }
    }

    return traversal
  }

  /** Adds a vertex with the given id and value. Throws if the id already exists. */
  addVertex(id: VertexId, value: T): void {
    if (this.#vertices.has(id)) throw new VertexAlreadyExistsError(id)
    this.#vertices.set(id, new Vertex<T>(id, value))
    this.#adjacencyMap.set(id, new Map())
  }

  /** Updates the value of an existing vertex. Throws if the id is not found. */
  updateVertex(id: VertexId, value: T): void {
    const vertex = this.#vertices.get(id)
    if (!vertex) throw new VertexNotFoundError(id)
    vertex.value = value
  }

  /** Returns a readonly snapshot of the vertex, or undefined if the id is not found. */
  getVertex(id: VertexId): VertexSnapshot<T> | undefined {
    const vertex = this.#vertices.get(id)
    if (!vertex) return undefined
    return this.#toSnapshot(vertex)
  }

  /** Returns outgoing neighbor ids in edge insertion order. Throws if the id is not found. */
  getAdjacent(id: VertexId): VertexId[] {
    if (!this.#vertices.has(id)) throw new VertexNotFoundError(id)
    return [...this.#adjacencyMap.get(id)!.keys()]
  }

  /** Adds a directed edge from source to target. Throws on missing vertices, duplicates, or self-loops. */
  addEdge(sourceId: VertexId, targetId: VertexId): void {
    if (sourceId === targetId) {
      throw new SelfLoopError(sourceId)
    }
    if (!this.#vertices.has(sourceId)) {
      throw new VertexNotFoundError(sourceId)
    }
    if (!this.#vertices.has(targetId)) {
      throw new VertexNotFoundError(targetId)
    }

    const innerMap = this.#adjacencyMap.get(sourceId)!
    if (innerMap.has(targetId)) {
      throw new EdgeAlreadyExistsError(sourceId, targetId)
    }
    innerMap.set(targetId, {})
    this.#edgeCount++
  }

  /** Returns vertex ids reachable from startId in breadth-first order. */
  breadthFirstSearch(startId: VertexId): VertexId[] {
    return this.#breadthFirstSteps(startId).map((step) => step.vertex.id)
  }

  /** Returns vertex ids reachable from startId in depth-first order. */
  depthFirstSearch(startId: VertexId): VertexId[] {
    const startVertex = this.#vertices.get(startId)
    if (!startVertex) return []
    return this.#depthFirstVertices([startVertex]).map((vertex) => vertex.id)
  }

  /** Returns true if the graph contains a directed cycle. */
  detectCycle(): boolean {
    const visited = new Set<VertexId>()
    const inStack = new Set<VertexId>()

    for (const startId of this.#vertices.keys()) {
      if (visited.has(startId)) continue

      const stack: Array<{ id: VertexId; iter: IterableIterator<TVertex<T>> }> = []
      visited.add(startId)
      inStack.add(startId)
      stack.push({ id: startId, iter: this.#getAdjacentVertices(startId).values() })

      while (stack.length) {
        const frame = stack[stack.length - 1]
        const next = frame.iter.next()

        if (next.done) {
          inStack.delete(frame.id)
          stack.pop()
        } else {
          const adjId = next.value.id
          if (inStack.has(adjId)) return true
          if (!visited.has(adjId)) {
            visited.add(adjId)
            inStack.add(adjId)
            stack.push({ id: adjId, iter: this.#getAdjacentVertices(adjId).values() })
          }
        }
      }
    }

    return false
  }

  /** Returns the shortest unweighted path from source to target, or undefined if unreachable. */
  findShortestPath(sourceId: VertexId, targetId: VertexId): VertexId[] | undefined {
    if (!this.#vertices.has(sourceId)) return undefined
    if (!this.#vertices.has(targetId)) return undefined
    if (sourceId === targetId) return [sourceId]

    const queue = new TraversalQueue<VertexId>()
    const visited = new Set<VertexId>()
    const predecessor = new Map<VertexId, VertexId>()

    visited.add(sourceId)
    queue.push(sourceId)

    while (queue.length) {
      const currentId = queue.shift()
      if (currentId === undefined) break

      for (const adjacent of this.#getAdjacentVertices(currentId)) {
        const adjId = adjacent.id
        if (visited.has(adjId)) continue
        visited.add(adjId)
        predecessor.set(adjId, currentId)

        if (adjId === targetId) {
          const path: VertexId[] = []
          let current: VertexId = targetId
          while (current !== sourceId) {
            path.push(current)
            current = predecessor.get(current)!
          }
          path.push(sourceId)
          return path.reverse()
        }

        queue.push(adjId)
      }
    }

    return undefined
  }

  /** Removes a vertex and all edges connected to it. Throws if the id is not found. */
  removeVertex(id: VertexId): void {
    if (!this.#vertices.has(id)) {
      throw new VertexNotFoundError(id)
    }

    const outgoing = this.#adjacencyMap.get(id)
    if (outgoing) {
      this.#edgeCount -= outgoing.size
    }

    this.#vertices.delete(id)
    this.#adjacencyMap.delete(id)

    for (const innerSet of this.#adjacencyMap.values()) {
      if (innerSet.delete(id)) this.#edgeCount--
    }
  }

  /** Removes a directed edge. Throws if either vertex or the edge is not found. */
  removeEdge(sourceId: VertexId, targetId: VertexId): void {
    if (!this.#vertices.has(sourceId)) {
      throw new VertexNotFoundError(sourceId)
    }
    if (!this.#vertices.has(targetId)) {
      throw new VertexNotFoundError(targetId)
    }

    const innerMap = this.#adjacencyMap.get(sourceId)!
    if (!innerMap.has(targetId)) {
      throw new EdgeNotFoundError(sourceId, targetId)
    }
    innerMap.delete(targetId)
    this.#edgeCount--
  }

  /** Returns a topological ordering of vertex ids. Throws CycleError if the graph has a cycle. */
  topologicalSort(): VertexId[] {
    const inDegree = new Map<VertexId, number>()
    for (const id of this.#vertices.keys()) {
      inDegree.set(id, 0)
    }
    for (const id of this.#vertices.keys()) {
      for (const adjacent of this.#getAdjacentVertices(id)) {
        inDegree.set(adjacent.id, (inDegree.get(adjacent.id) ?? 0) + 1)
      }
    }

    const queue = new TraversalQueue<VertexId>()
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id)
    }

    const result: VertexId[] = []
    while (queue.length > 0) {
      const id = queue.shift()!
      result.push(id)
      for (const adjacent of this.#getAdjacentVertices(id)) {
        const newDegree = (inDegree.get(adjacent.id) ?? 0) - 1
        inDegree.set(adjacent.id, newDegree)
        if (newDegree === 0) queue.push(adjacent.id)
      }
    }

    if (result.length !== this.#vertices.size) {
      throw new CycleError()
    }

    return result
  }
}
