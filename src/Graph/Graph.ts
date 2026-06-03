import { AdjacencyList } from './AdjacencyList'
import { VertexAlreadyExistsError, VertexNotFoundError } from './errors'
import type { GraphSnapshot, IGraph, VertexId, VertexSnapshot } from './interface'
import { type TVertex, Vertex } from './Vertex'

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

class TraversalStack<T> {
  #items: T[] = []

  get length(): number {
    return this.#items.length
  }

  push(value: T): void {
    this.#items.push(value)
  }

  pop(): T | undefined {
    return this.#items.pop()
  }
}

export class Graph<T = unknown> implements IGraph<T> {
  #vertices: Map<VertexId, TVertex<T>>
  #adjacencyList: AdjacencyList<T>

  constructor() {
    this.#vertices = new Map()
    this.#adjacencyList = new AdjacencyList<T>()
  }

  #toSnapshot(vertex: TVertex<T>): VertexSnapshot<T> {
    return {
      id: vertex.id,
      value: vertex.value,
    }
  }

  #getAdjacentVertices(id: VertexId): TVertex<T>[] {
    const vertex = this.#vertices.get(id)
    if (!vertex) return []
    return this.#adjacencyList.adjacentTo(vertex)
  }

  #breadthFirstSteps(startId: VertexId): TraversalStep<T>[] {
    const startVertex = this.#vertices.get(startId)
    if (!startVertex) return []

    const queue = new TraversalQueue<TraversalStep<T>>()
    const visited = new Set<string>()
    const traversal: TraversalStep<T>[] = []

    visited.add(startVertex.uuid)
    queue.push({ vertex: startVertex, distance: 0 })

    while (queue.length) {
      const step = queue.shift()
      if (!step) return traversal

      traversal.push(step)

      for (const adjacent of this.#adjacencyList.adjacentTo(step.vertex)) {
        if (visited.has(adjacent.uuid)) continue
        visited.add(adjacent.uuid)
        queue.push({ vertex: adjacent, distance: step.distance + 1 })
      }
    }

    return traversal
  }

  #depthFirstVertices(startVertices: Iterable<TVertex<T>>): TVertex<T>[] {
    const stack = new TraversalStack<IterableIterator<TVertex<T>>>()
    const visited = new Set<string>()
    const traversal: TVertex<T>[] = []

    stack.push(Array.from(startVertices).values())

    while (stack.length) {
      const iterator = stack.pop()
      if (!iterator) return traversal

      for (const vertex of iterator) {
        if (visited.has(vertex.uuid)) continue

        visited.add(vertex.uuid)
        traversal.push(vertex)
        stack.push(iterator)
        stack.push(this.#adjacencyList.adjacentTo(vertex).values())
        break
      }
    }

    return traversal
  }

  get vertexCount(): number {
    return this.#vertices.size
  }

  addVertex(id: VertexId, value: T): void {
    if (this.#vertices.has(id)) throw new VertexAlreadyExistsError(id)
    this.#vertices.set(id, new Vertex<T>(id, value))
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

  getAdjacent(id: VertexId): VertexSnapshot<T>[] {
    return this.#getAdjacentVertices(id).map((vertex) => this.#toSnapshot(vertex))
  }

  addEdge(sourceId: VertexId, targetId: VertexId): boolean {
    const source = this.#vertices.get(sourceId)
    const target = this.#vertices.get(targetId)
    if (!source || !target) return false
    this.#adjacencyList.connect(source, target)
    return true
  }

  breadthFirstSearch(): VertexId[] {
    const visited = new Set<VertexId>()
    const result: VertexId[] = []

    for (const id of this.#vertices.keys()) {
      if (visited.has(id)) continue
      for (const step of this.#breadthFirstSteps(id)) {
        if (visited.has(step.vertex.id)) continue
        visited.add(step.vertex.id)
        result.push(step.vertex.id)
      }
    }

    return result
  }

  depthFirstSearch(): VertexId[] {
    return this.#depthFirstVertices(this.#vertices.values()).map((vertex) => vertex.id)
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

        for (const adjacent of this.#adjacencyList.adjacentTo(node)) {
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

  /*
    Breadth first search comes to rescue.
    The idea is to use a simple queue to traverse a graph and a depth level counter to store a number of edges we've passed.
    So we traverse the graph in a loop until the queue is empty. On each iteration a node gets pulled off from the queue. Then we iterate over all adjacent nodes of that node.
    Once we have passed all adjacent nodes of the node, we increase the depth level counter.
    On each iteration we check if an adjacent node is equal to the target node.
    If it is, we return the number the depth level, and it is going to be a minimal number of edges from the source node to the target.
    If it is not, we add a new adjacent node gets put on to the queue.
   */
  findShortestPath(sourceId: VertexId, targetId: VertexId): number {
    const targetStep = this.#breadthFirstSteps(sourceId).find((step) => step.vertex.id === targetId)
    return targetStep?.distance ?? -1
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
    const deletedVertex = this.#vertices.get(id)
    if (!deletedVertex) throw new VertexNotFoundError(id)
    this.#vertices.delete(id)
    this.#adjacencyList.removeReferences(Array.from(this.#vertices.values()), deletedVertex)
  }

  removeEdge(sourceId: VertexId, targetId: VertexId): boolean {
    const source = this.#vertices.get(sourceId)
    if (!source) return false
    return this.#adjacencyList.disconnect(source, targetId)
  }

  mapGraphOver(): GraphSnapshot<T> {
    return Array.from(this.#vertices.keys()).reduce((acc: GraphSnapshot<T>, id) => {
      return acc.set(id, this.getAdjacent(id))
    }, new Map())
  }

  // Topological Sort is used to find a linear ordering of elements that have dependencies on each other.
  // A topological ordering is possible only when the graph has no directed cycles, i.e. if the graph is a Directed Acyclic Graph (DAG).
  // If the graph has a cycle, some vertices will have cyclic dependencies which makes it impossible to find a linear ordering among vertices.
  sortTopologically(): VertexId[] {
    if (this.detectCycle()) return []
    return this.breadthFirstSearch()
  }

  printGraph(): void {
    console.log('>>Adjacency List of the Graph<<')

    this.#vertices.forEach((node, id) => {
      process.stdout.write(`|id: ${String(id)}, value: ${String(node.value)}| => `)

      this.#adjacencyList.adjacentTo(node).forEach((adjacent) => {
        process.stdout.write(`[${String(adjacent.value)}] -> `)
      })

      console.log('null')
    })
  }
}
