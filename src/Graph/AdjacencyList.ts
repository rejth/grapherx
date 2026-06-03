import { LinkedList } from '../LinkedList'

import type { VertexId } from './interface'
import type { TVertex } from './Vertex'

export class AdjacencyList<T> {
  adjacentTo(vertex: TVertex<T>): TVertex<T>[] {
    return [...vertex.edges.values]
  }

  connect(source: TVertex<T>, target: TVertex<T>): void {
    source.edges.insertFirst(target)
  }

  disconnect(source: TVertex<T>, targetId: VertexId): boolean {
    const adjacentVertices = this.adjacentTo(source)
    const nextAdjacentVertices = adjacentVertices.filter((adjacent) => adjacent.id !== targetId)

    if (nextAdjacentVertices.length === adjacentVertices.length) {
      return false
    }

    this.replace(source, nextAdjacentVertices)
    return true
  }

  removeReferences(vertices: TVertex<T>[], deletedVertex: TVertex<T>): void {
    vertices.forEach((vertex) => {
      const adjacent = this.adjacentTo(vertex)
      const filtered = adjacent.filter((v) => v.id !== deletedVertex.id)
      if (filtered.length !== adjacent.length) {
        this.replace(vertex, filtered)
      }
    })
  }

  replace(source: TVertex<T>, adjacentVertices: TVertex<T>[]): void {
    source.edges = new LinkedList<TVertex<T>>()
    adjacentVertices.forEach((adjacent) => {
      source.edges.insertLast(adjacent)
    })
  }
}
