export interface IGraph<T> {
  get size(): number
  addVertex(nodeIndex: number, value: T): boolean
  setVertex(nodeIndex: number, value: T): boolean
  getVertex(nodeIndex: number): VertexSnapshot<T> | undefined
  getAdjacent(nodeIndex: number): VertexSnapshot<T>[]
  addEdge(sourceNodeIndex: number, targetNodeIndex: number): boolean
  updateVertex(index: number, newValue: T): VertexSnapshot<T>[]
  breadthFirstSearch(): number[]
  depthFirstSearch(): number[]
  depthFirstTraversal(startNodeIndex: number): IterableIterator<VertexSnapshot<T>>
  detectCycle(): boolean
  findShortestPath(sourceNodeIndex: number, targetNodeIndex: number): number
  findMotherVertex(): VertexSnapshot<T> | undefined
  removeVertex(index: number): VertexSnapshot<T> | undefined
  removeEdge(sourceNodeIndex: number, targetNodeIndex: number): boolean
  checkPath(sourceNodeIndex: number, targetNodeIndex: number): boolean
  mapGraphOver(): GraphSnapshot<T>
  printGraph(): void
}

export type VertexSnapshot<T> = Readonly<{
  index: number
  value: T | null
}>

export type GraphSnapshot<T> = Map<number, VertexSnapshot<T>[]>
