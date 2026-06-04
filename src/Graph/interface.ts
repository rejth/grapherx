export type VertexId = string | number

export interface IGraph<T> {
  get vertexCount(): number
  get edgeCount(): number
  addVertex(id: VertexId, value: T): void
  updateVertex(id: VertexId, value: T): void
  getVertex(id: VertexId): VertexSnapshot<T> | undefined
  getAdjacent(id: VertexId): VertexId[]
  removeVertex(id: VertexId): void
  addEdge(sourceId: VertexId, targetId: VertexId): void
  removeEdge(sourceId: VertexId, targetId: VertexId): void
  breadthFirstSearch(startId: VertexId): VertexId[]
  depthFirstSearch(startId: VertexId): VertexId[]
  findShortestPath(sourceId: VertexId, targetId: VertexId): VertexId[] | undefined
  detectCycle(): boolean
  topologicalSort(): VertexId[]
}

export type VertexSnapshot<T> = Readonly<{
  id: VertexId
  value: T
}>
