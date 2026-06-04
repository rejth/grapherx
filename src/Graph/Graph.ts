import {
  CycleError,
  EdgeAlreadyExistsError,
  EdgeNotFoundError,
  SelfLoopError,
  VertexAlreadyExistsError,
  VertexNotFoundError,
} from './errors'
import type { GraphSnapshot, IGraph, VertexId, VertexSnapshot } from './interface'
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

  #toSnapshot(vertex: TVertex<T>): VertexSnapshot<T> {
    return {
      id: vertex.id,
      value: vertex.value,
    }
  }

  #getAdjacentVertices(id: VertexId): TVertex<T>[] {
    const innerMap = this.#adjacencyMap.get(id)
    if (!innerMap)
      throw new Error(`Invariant violation: no adjacency entry for vertex "${String(id)}"`)
    return Array.from(innerMap.keys()).flatMap((adjId) => {
      const v = this.#vertices.get(adjId)
      return v ? [v] : []
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

  get vertexCount(): number {
    return this.#vertices.size
  }

  get edgeCount(): number {
    return this.#edgeCount
  }

  addVertex(id: VertexId, value: T): void {
    if (this.#vertices.has(id)) throw new VertexAlreadyExistsError(id)
    this.#vertices.set(id, new Vertex<T>(id, value))
    this.#adjacencyMap.set(id, new Map())
  }

  updateVertex(id: VertexId, value: T): void {
    const vertex = this.#vertices.get(id)
    if (!vertex) throw new VertexNotFoundError(id)
    vertex.value = value
  }

  getVertex(id: VertexId): VertexSnapshot<T> | undefined {
    const vertex = this.#vertices.get(id)
    if (!vertex) return undefined
    return this.#toSnapshot(vertex)
  }

  getAdjacent(id: VertexId): VertexId[] {
    if (!this.#vertices.has(id)) throw new VertexNotFoundError(id)
    return [...this.#adjacencyMap.get(id)!.keys()]
  }

  addEdge(sourceId: VertexId, targetId: VertexId): void {
    if (sourceId === targetId) throw new SelfLoopError(sourceId)
    if (!this.#vertices.has(sourceId)) throw new VertexNotFoundError(sourceId)
    if (!this.#vertices.has(targetId)) throw new VertexNotFoundError(targetId)
    const innerMap = this.#adjacencyMap.get(sourceId)!
    if (innerMap.has(targetId)) throw new EdgeAlreadyExistsError(sourceId, targetId)
    innerMap.set(targetId, {})
    this.#edgeCount++
  }

  breadthFirstSearch(startId: VertexId): VertexId[] {
    return this.#breadthFirstSteps(startId).map((step) => step.vertex.id)
  }

  depthFirstSearch(startId: VertexId): VertexId[] {
    const startVertex = this.#vertices.get(startId)
    if (!startVertex) return []
    return this.#depthFirstVertices([startVertex]).map((vertex) => vertex.id)
  }

  detectCycle(): boolean {
    const visited = new Set<VertexId>()
    const recNodes = new Set<VertexId>()

    const detect = (id: VertexId): boolean => {
      if (!visited.has(id)) {
        const node = this.#vertices.get(id)
        if (!node) return false
        visited.add(id)
        recNodes.add(id)

        for (const adjacent of this.#getAdjacentVertices(id)) {
          const adjId = adjacent.id
          if (visited.has(adjId) && recNodes.has(adjId)) return true
          if (!visited.has(adjId) && detect(adjId)) return true
        }
      }

      recNodes.delete(id)
      return false
    }

    for (const id of this.#vertices.keys()) {
      if (detect(id)) return true
    }

    return false
  }

  *depthFirstTraversal(startId: VertexId): IterableIterator<VertexSnapshot<T>> {
    const startVertex = this.#vertices.get(startId)
    if (!startVertex) return

    for (const vertex of this.#depthFirstVertices([startVertex])) {
      yield this.#toSnapshot(vertex)
    }
  }

  findShortestPath(sourceId: VertexId, targetId: VertexId): VertexId[] | undefined {
    if (!this.#vertices.has(sourceId)) return undefined
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
          let curr: VertexId = targetId
          while (curr !== sourceId) {
            path.unshift(curr)
            curr = predecessor.get(curr)!
          }
          path.unshift(sourceId)
          return path
        }

        queue.push(adjId)
      }
    }

    return undefined
  }

  // The mother vertex is one from which all other vertices are reachable.
  // There can be multiple mother vertices, but we need to return the first one.
  findMotherVertex(): VertexSnapshot<T> | undefined {
    for (const vertex of this.#vertices.values()) {
      if (this.#depthFirstVertices([vertex]).length === this.#vertices.size)
        return this.#toSnapshot(vertex)
    }
    return undefined
  }

  // If there is no repeated sequence of edges and vertices between the source and the destination vertex then the path exists between these two vertices.
  checkPath(sourceId: VertexId, targetId: VertexId): boolean {
    const sourceVertex = this.#vertices.get(sourceId)
    if (!sourceVertex) return false
    return this.#depthFirstVertices([sourceVertex]).some((vertex) => vertex.id === targetId)
  }

  removeVertex(id: VertexId): void {
    if (!this.#vertices.has(id)) throw new VertexNotFoundError(id)
    const outgoing = this.#adjacencyMap.get(id)
    if (outgoing) this.#edgeCount -= outgoing.size
    this.#vertices.delete(id)
    this.#adjacencyMap.delete(id)
    for (const innerSet of this.#adjacencyMap.values()) {
      if (innerSet.delete(id)) this.#edgeCount--
    }
  }

  removeEdge(sourceId: VertexId, targetId: VertexId): void {
    if (!this.#vertices.has(sourceId)) throw new VertexNotFoundError(sourceId)
    if (!this.#vertices.has(targetId)) throw new VertexNotFoundError(targetId)
    const innerMap = this.#adjacencyMap.get(sourceId)!
    if (!innerMap.has(targetId)) throw new EdgeNotFoundError(sourceId, targetId)
    innerMap.delete(targetId)
    this.#edgeCount--
  }

  mapGraphOver(): GraphSnapshot {
    const snapshot: GraphSnapshot = new Map()
    for (const id of this.#vertices.keys()) {
      snapshot.set(id, this.getAdjacent(id))
    }
    return snapshot
  }

  topologicalSort(): VertexId[] {
    const WHITE = 0,
      GRAY = 1,
      BLACK = 2
    const color = new Map<VertexId, 0 | 1 | 2>()
    const result: VertexId[] = []

    const visit = (id: VertexId): void => {
      color.set(id, GRAY)
      for (const adjacent of this.#getAdjacentVertices(id)) {
        const adjId = adjacent.id
        const c = color.get(adjId) ?? WHITE
        if (c === GRAY) throw new CycleError()
        if (c === WHITE) visit(adjId)
      }
      color.set(id, BLACK)
      result.push(id)
    }

    for (const id of this.#vertices.keys()) {
      if ((color.get(id) ?? WHITE) === WHITE) visit(id)
    }

    return result.reverse()
  }

  printGraph(): void {
    console.log('>>Adjacency List of the Graph<<')

    this.#vertices.forEach((node, id) => {
      process.stdout.write(`|id: ${String(id)}, value: ${String(node.value)}| => `)

      for (const adjId of this.#adjacencyMap.get(id)?.keys() ?? []) {
        const adj = this.#vertices.get(adjId)
        if (adj) process.stdout.write(`[${String(adj.value)}] -> `)
      }

      console.log('null')
    })
  }
}
