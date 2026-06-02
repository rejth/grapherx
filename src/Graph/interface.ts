export type VertexId = string | number

export interface IGraph<T> {
  get size(): number
  get vertexCount(): number
  addVertex(id: VertexId, value: T): void
  updateVertex(id: VertexId, value: T): void
  getVertex(id: VertexId): VertexSnapshot<T> | undefined
  getAdjacent(id: VertexId): VertexSnapshot<T>[]
  addEdge(sourceId: VertexId, targetId: VertexId): boolean
  breadthFirstSearch(): VertexId[]
  depthFirstSearch(): VertexId[]
  depthFirstTraversal(startId: VertexId): IterableIterator<VertexSnapshot<T>>
  detectCycle(): boolean
  findShortestPath(sourceId: VertexId, targetId: VertexId): number
  findMotherVertex(): VertexSnapshot<T> | undefined
  removeVertex(id: VertexId): void
  removeEdge(sourceId: VertexId, targetId: VertexId): boolean
  checkPath(sourceId: VertexId, targetId: VertexId): boolean
  mapGraphOver(): GraphSnapshot<T>
  printGraph(): void
}

export type VertexSnapshot<T> = Readonly<{
  id: VertexId
  value: T | null
}>

export type GraphSnapshot<T> = Map<VertexId, VertexSnapshot<T>[]>
