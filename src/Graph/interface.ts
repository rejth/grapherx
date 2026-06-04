export type VertexId = string | number

export interface IGraph<T> {
  get vertexCount(): number
  get edgeCount(): number
  addVertex(id: VertexId, value: T): void
  updateVertex(id: VertexId, value: T): void
  getVertex(id: VertexId): VertexSnapshot<T> | undefined
  getAdjacent(id: VertexId): VertexId[]
  addEdge(sourceId: VertexId, targetId: VertexId): void
  removeEdge(sourceId: VertexId, targetId: VertexId): void
  breadthFirstSearch(startId: VertexId): VertexId[]
  depthFirstSearch(startId: VertexId): VertexId[]
  depthFirstTraversal(startId: VertexId): IterableIterator<VertexSnapshot<T>>
  detectCycle(): boolean
  findShortestPath(sourceId: VertexId, targetId: VertexId): VertexId[] | undefined
  findMotherVertex(): VertexSnapshot<T> | undefined
  removeVertex(id: VertexId): void
  checkPath(sourceId: VertexId, targetId: VertexId): boolean
  mapGraphOver(): GraphSnapshot
  sortTopologically(): VertexId[]
  printGraph(): void
}

export type VertexSnapshot<T> = Readonly<{
  id: VertexId
  value: T
}>

export type GraphSnapshot = Map<VertexId, VertexId[]>
