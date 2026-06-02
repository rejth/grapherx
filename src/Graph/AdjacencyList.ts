import { LinkedList } from '../LinkedList'

import type { TVertex } from './Vertex'

export class AdjacencyList<T> {
  adjacentTo(vertex: TVertex<T>): TVertex<T>[] {
    return [...vertex.edges.values]
  }

  connect(source: TVertex<T>, target: TVertex<T>): void {
    source.edges.insertFirst(target)
  }

  disconnect(source: TVertex<T>, targetIndex: number): boolean {
    const adjacentVertices = this.adjacentTo(source)
    const nextAdjacentVertices = adjacentVertices.filter(
      (adjacent) => adjacent.index !== targetIndex,
    )

    if (nextAdjacentVertices.length === adjacentVertices.length) {
      return false
    }

    this.replace(source, nextAdjacentVertices)
    return true
  }

  removeReferences(vertices: TVertex<T>[], deletedVertex: TVertex<T>): void {
    vertices.forEach((vertex) => {
      this.replace(
        vertex,
        this.adjacentTo(vertex).filter((adjacent) => adjacent !== deletedVertex),
      )
    })
  }

  replace(source: TVertex<T>, adjacentVertices: TVertex<T>[]): void {
    source.edges = new LinkedList<TVertex<T>>()
    adjacentVertices.forEach((adjacent) => {
      source.edges.insertLast(adjacent)
    })
  }
}
