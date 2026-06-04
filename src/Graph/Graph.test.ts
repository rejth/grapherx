import {
  CycleError,
  EdgeAlreadyExistsError,
  EdgeNotFoundError,
  SelfLoopError,
  VertexAlreadyExistsError,
  VertexNotFoundError,
} from './errors'
import { Graph } from './Graph'
import type { VertexId } from './interface'

describe('Graph', () => {
  const createTaskGraph = (): Graph<string> => {
    const tasks = [
      {
        id: '0',
        specification: {
          dependsOn: [],
          id: 'RELOAD_PATIENT_DATA',
        },
      },
      {
        id: '1',
        specification: {
          dependsOn: ['RELOAD_PATIENT_DATA'],
          id: 'RELOAD_MATCHED_TREATMENTS',
        },
      },
      {
        id: '2',
        specification: {
          dependsOn: ['RELOAD_PATIENT_DATA'],
          id: 'RELOAD_COMPLEX_MEASURES',
        },
      },
      {
        id: '3',
        specification: {
          dependsOn: ['RELOAD_MATCHED_TREATMENTS', 'RELOAD_COMPLEX_MEASURES'],
          id: 'RELOAD_MATCHED_BIOMARKERS',
        },
      },
      {
        id: '4',
        specification: {
          dependsOn: ['RELOAD_MATCHED_TREATMENTS', 'RELOAD_COMPLEX_MEASURES'],
          id: 'RELOAD_SIGNALING_BIOMARKERS',
        },
      },
      {
        id: '5',
        specification: {
          dependsOn: ['RELOAD_MATCHED_BIOMARKERS', 'RELOAD_SIGNALING_BIOMARKERS'],
          id: 'RELOAD_MATCHED_NCCN_GUIDELINE',
        },
      },
      {
        id: '6',
        specification: {
          dependsOn: ['RELOAD_MATCHED_NCCN_GUIDELINE'],
          id: 'RELOAD_MATCHED_CONTRAINDICATIONS',
        },
      },
      {
        id: '7',
        specification: {
          dependsOn: ['RELOAD_MATCHED_NCCN_GUIDELINE'],
          id: 'RELOAD_NCCN_CLINICAL_EVIDENCE',
        },
      },
      {
        id: '8',
        specification: {
          dependsOn: ['RELOAD_MATCHED_CONTRAINDICATIONS'],
          id: 'PULL_MATCHED_TREATMENTS',
        },
      },
    ]

    const graph = new Graph<string>()

    tasks.forEach((task, index) => {
      graph.addVertex(index, task.specification.id)
    })

    tasks.forEach((task, index) => {
      const { id } = task.specification
      const dependent = tasks.filter((item) => item.specification.dependsOn.includes(id))

      dependent.forEach((item) => {
        graph.addEdge(index, +item.id)
      })
    })

    return graph
  }

  it('exposes vertex snapshots without leaking mutable storage', () => {
    const graph = new Graph<string>()

    graph.addVertex(0, 'source')
    graph.addVertex(1, 'target')
    graph.addEdge(0, 1)

    const vertex = graph.getVertex(0)
    const adjacent = graph.getAdjacent(0)

    expect(vertex).toEqual({ id: 0, value: 'source' })
    expect(adjacent).toEqual([1])
    expect(Object.keys(vertex ?? {}).sort()).toEqual(['id', 'value'])

    const id: VertexId = vertex!.id
    expect(typeof id === 'string' || typeof id === 'number').toBe(true)
  })

  it('keeps graph mutation behind the Graph interface', () => {
    const graph = new Graph<string>()

    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)

    graph.removeEdge(0, 1)
    expect(() => graph.removeEdge(0, 1)).toThrow(EdgeNotFoundError)
    expect(graph.getAdjacent(0)).toEqual([2])

    graph.removeVertex(1)
    expect(graph.getVertex(1)).toBeUndefined()
    expect(graph.vertexCount).toBe(2)
    expect(graph.getAdjacent(0)).toEqual([2])
  })

  it('removes incoming adjacency when a vertex is removed', () => {
    const graph = new Graph<string>()

    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 2)
    graph.addEdge(1, 2)
    graph.addEdge(2, 3)

    graph.removeVertex(2)
    expect(graph.getVertex(2)).toBeUndefined()
    expect(graph.getAdjacent(0)).toEqual([])
    expect(graph.getAdjacent(1)).toEqual([])
    expect(graph.findShortestPath(0, 3)).toBeUndefined()
  })

  it('runs graph operations through the public seam', () => {
    const graph = new Graph<string>()

    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)

    expect(graph.depthFirstSearch(0)).toEqual([0, 1, 2])
    expect(graph.findShortestPath(0, 2)).toEqual([0, 1, 2])
    expect(graph.findShortestPath(2, 0)).toBeUndefined()
  })

  it('concentrates traversal behavior across graph operations', () => {
    const graph = new Graph<string>()

    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 2)
    graph.addEdge(0, 1)
    graph.addEdge(1, 3)
    graph.addEdge(2, 3)

    // Adjacency stored in insertion order: adjacent(0) = [2, 1]
    expect(graph.breadthFirstSearch(0)).toEqual([0, 2, 1, 3])
    expect(graph.depthFirstSearch(0)).toEqual([0, 2, 3, 1])
    expect(graph.findShortestPath(0, 3)).toEqual([0, 2, 3])
    expect(graph.findShortestPath(2, 1)).toBeUndefined()
  })

  it('returns empty traversal results for invalid or unreachable paths', () => {
    const graph = new Graph()
    graph.addVertex(0, null)
    graph.addVertex(1, null)
    graph.addEdge(0, 1)

    expect(graph.breadthFirstSearch(4)).toEqual([])
    expect(graph.depthFirstSearch(4)).toEqual([])
    expect(graph.findShortestPath(1, 0)).toBeUndefined()
    expect(graph.findShortestPath(0, 4)).toBeUndefined()
  })

  it('detects directed cycles', () => {
    const graph = new Graph()
    graph.addVertex(0, null)
    graph.addVertex(1, null)
    graph.addVertex(2, null)
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)
    graph.addEdge(2, 0)

    expect(graph.detectCycle()).toBe(true)
  })

  it('vertex insertion order is stable across add and remove cycles', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')

    graph.removeVertex(1)

    expect(graph.vertexCount).toBe(3)
    expect(graph.getVertex(0)?.id).toBe(0)
    expect(graph.getVertex(2)?.id).toBe(2)
    expect(graph.getVertex(3)?.id).toBe(3)
    expect(graph.getVertex(1)).toBeUndefined()
  })

  it('VertexSnapshot exposes id as VertexId, not index', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'hello')

    const snapshot = graph.getVertex(0)
    expect(snapshot).toBeDefined()
    expect('id' in snapshot!).toBe(true)
    expect('index' in snapshot!).toBe(false)
    expect(snapshot!.id).toBe(0)

    const id: VertexId = snapshot!.id
    expect(typeof id === 'string' || typeof id === 'number').toBe(true)
  })

  it('VertexAlreadyExistsError and VertexNotFoundError are catchable via instanceof', () => {
    const alreadyExists = new VertexAlreadyExistsError('a')
    expect(alreadyExists).toBeInstanceOf(Error)
    expect(alreadyExists).toBeInstanceOf(VertexAlreadyExistsError)
    expect(alreadyExists.name).toBe('VertexAlreadyExistsError')
    expect(alreadyExists.message).toContain('a')

    const notFound = new VertexNotFoundError(42)
    expect(notFound).toBeInstanceOf(Error)
    expect(notFound).toBeInstanceOf(VertexNotFoundError)
    expect(notFound.name).toBe('VertexNotFoundError')
    expect(notFound.message).toContain('42')

    const caught = (() => {
      try {
        throw new VertexAlreadyExistsError('x')
      } catch (e) {
        return e instanceof VertexAlreadyExistsError
      }
    })()
    expect(caught).toBe(true)
  })

  it('addVertex stores vertex by caller-provided ID', () => {
    const graph = new Graph<string>()
    graph.addVertex('myId', 'hello')
    graph.addVertex(42, 'world')

    expect(graph.getVertex('myId')).toEqual({ id: 'myId', value: 'hello' })
    expect(graph.getVertex(42)).toEqual({ id: 42, value: 'world' })
  })

  it('addVertex throws VertexAlreadyExistsError on duplicate ID', () => {
    const graph = new Graph<string>()
    graph.addVertex('dup', 'first')

    expect(() => graph.addVertex('dup', 'second')).toThrow(VertexAlreadyExistsError)
    expect(graph.getVertex('dup')).toEqual({ id: 'dup', value: 'first' })
  })

  it('updateVertex updates value of existing vertex', () => {
    const graph = new Graph<string>()
    graph.addVertex(1, 'original')

    graph.updateVertex(1, 'updated')

    expect(graph.getVertex(1)).toEqual({ id: 1, value: 'updated' })
  })

  it('updateVertex throws VertexNotFoundError on missing ID', () => {
    const graph = new Graph<string>()

    expect(() => graph.updateVertex('missing', 'value')).toThrow(VertexNotFoundError)
  })

  it('getVertex returns undefined for unknown ID', () => {
    const graph = new Graph<string>()
    graph.addVertex(1, 'exists')

    expect(graph.getVertex(99)).toBeUndefined()
    expect(graph.getVertex('unknown')).toBeUndefined()
  })

  it('removeVertex removes the vertex', () => {
    const graph = new Graph<string>()
    graph.addVertex('a', 'alpha')

    graph.removeVertex('a')

    expect(graph.getVertex('a')).toBeUndefined()
    expect(graph.vertexCount).toBe(0)
  })

  it('removeVertex throws VertexNotFoundError on missing ID', () => {
    const graph = new Graph<string>()

    expect(() => graph.removeVertex('ghost')).toThrow(VertexNotFoundError)
  })

  it('vertexCount returns current number of vertices', () => {
    const graph = new Graph<string>()
    expect(graph.vertexCount).toBe(0)

    graph.addVertex(1, 'a')
    expect(graph.vertexCount).toBe(1)

    graph.addVertex(2, 'b')
    expect(graph.vertexCount).toBe(2)

    graph.removeVertex(1)
    expect(graph.vertexCount).toBe(1)
  })

  it('adjacency map initialised on vertex add returns empty adjacent list', () => {
    const graph = new Graph<string>()
    graph.addVertex('a', 'alpha')

    expect(graph.getAdjacent('a')).toEqual([])

    graph.addVertex('b', 'beta')
    graph.addEdge('a', 'b')
    expect(graph.getAdjacent('a')).toEqual(['b'])
    expect(graph.getAdjacent('b')).toEqual([])
  })

  it('addEdge adds a directed edge from source to target', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addEdge(0, 1)

    expect(graph.getAdjacent(0)).toEqual([1])
    expect(graph.getAdjacent(1)).toEqual([])
  })

  it('addEdge throws VertexNotFoundError when source vertex is missing', () => {
    const graph = new Graph<string>()
    graph.addVertex(1, 'b')

    expect(() => graph.addEdge(99, 1)).toThrow(VertexNotFoundError)
  })

  it('addEdge throws VertexNotFoundError when target vertex is missing', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')

    expect(() => graph.addEdge(0, 99)).toThrow(VertexNotFoundError)
  })

  it('addEdge throws on self-loop', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')

    expect(() => graph.addEdge(0, 0)).toThrow(SelfLoopError)
    expect(graph.edgeCount).toBe(0)
  })

  it('addEdge throws EdgeAlreadyExistsError on duplicate edge', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addEdge(0, 1)

    expect(() => graph.addEdge(0, 1)).toThrow(EdgeAlreadyExistsError)
  })

  it('removeEdge removes the edge', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addEdge(0, 1)

    graph.removeEdge(0, 1)

    expect(graph.getAdjacent(0)).toEqual([])
  })

  it('removeEdge throws EdgeNotFoundError on missing edge', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')

    expect(() => graph.removeEdge(0, 1)).toThrow(EdgeNotFoundError)
  })

  it('removeEdge throws VertexNotFoundError when source vertex is missing', () => {
    const graph = new Graph<string>()
    graph.addVertex(1, 'b')

    expect(() => graph.removeEdge(99, 1)).toThrow(VertexNotFoundError)
  })

  it('removeEdge throws VertexNotFoundError when target vertex is missing', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')

    expect(() => graph.removeEdge(0, 99)).toThrow(VertexNotFoundError)
  })

  it('getAdjacent throws VertexNotFoundError for unknown vertex', () => {
    const graph = new Graph<string>()

    expect(() => graph.getAdjacent(99)).toThrow(VertexNotFoundError)
  })

  it('getAdjacent returns VertexId[] in edge insertion order', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 3)
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)

    expect(graph.getAdjacent(0)).toEqual([3, 1, 2])
  })

  it('edgeCount returns the current number of edges', () => {
    const graph = new Graph<string>()
    expect(graph.edgeCount).toBe(0)

    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    expect(graph.edgeCount).toBe(0)

    graph.addEdge(0, 1)
    expect(graph.edgeCount).toBe(1)

    graph.addEdge(0, 2)
    expect(graph.edgeCount).toBe(2)

    graph.removeEdge(0, 1)
    expect(graph.edgeCount).toBe(1)
  })

  it('removeVertex cascades: removes all incoming and outgoing edges', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(2, 1)
    graph.addEdge(1, 2)
    expect(graph.edgeCount).toBe(3)

    graph.removeVertex(1)

    expect(graph.edgeCount).toBe(0)
    expect(graph.getAdjacent(0)).toEqual([])
    expect(graph.getAdjacent(2)).toEqual([])
  })

  it('edgeCount is decremented correctly after partial vertex removal', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)
    graph.addEdge(0, 2)
    expect(graph.edgeCount).toBe(3)

    graph.removeVertex(1)

    expect(graph.edgeCount).toBe(1)
    expect(graph.getAdjacent(0)).toEqual([2])
  })

  it('findShortestPath returns path array from source to target', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)
    graph.addEdge(2, 3)

    expect(graph.findShortestPath(0, 3)).toEqual([0, 1, 2, 3])
    expect(graph.findShortestPath(0, 0)).toEqual([0])
    expect(graph.findShortestPath(1, 3)).toEqual([1, 2, 3])
  })

  it('findShortestPath returns undefined when target is unreachable', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)

    expect(graph.findShortestPath(1, 0)).toBeUndefined()
    expect(graph.findShortestPath(0, 2)).toBeUndefined()
    expect(graph.findShortestPath(99, 0)).toBeUndefined()
    expect(graph.findShortestPath(0, 99)).toBeUndefined()
  })

  it('findShortestPath returns shortest path when multiple paths exist', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 1)
    graph.addEdge(1, 3)
    graph.addEdge(0, 2)
    graph.addEdge(2, 3)

    // BFS picks shortest: 0->1->3 and 0->2->3 are equal length; order depends on adjacency insertion
    const path = graph.findShortestPath(0, 3)
    expect(path).toBeDefined()
    expect(path![0]).toBe(0)
    expect(path![path!.length - 1]).toBe(3)
    expect(path!.length).toBe(3)
  })

  it('findShortestPath path includes both source and target vertices', () => {
    const graph = new Graph<string>()
    graph.addVertex('a', 'alpha')
    graph.addVertex('b', 'beta')
    graph.addVertex('c', 'gamma')
    graph.addEdge('a', 'b')
    graph.addEdge('b', 'c')

    const path = graph.findShortestPath('a', 'c')
    expect(path).toEqual(['a', 'b', 'c'])
    expect(path![0]).toBe('a')
    expect(path![path!.length - 1]).toBe('c')
  })

  it('detectCycle returns false for an acyclic graph', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)

    expect(graph.detectCycle()).toBe(false)
  })

  it('topologicalSort returns a valid ordering for a DAG', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)
    graph.addEdge(1, 3)
    graph.addEdge(2, 3)

    const order = graph.topologicalSort()
    expect(order).toHaveLength(4)

    const pos = (id: number) => order.indexOf(id)
    expect(pos(0)).toBeLessThan(pos(1))
    expect(pos(0)).toBeLessThan(pos(2))
    expect(pos(1)).toBeLessThan(pos(3))
    expect(pos(2)).toBeLessThan(pos(3))
  })

  it('topologicalSort throws CycleError for a cyclic graph', () => {
    const graph = new Graph()
    graph.addVertex(0, null)
    graph.addVertex(1, null)
    graph.addVertex(2, null)
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)
    graph.addEdge(2, 0)

    expect(() => graph.topologicalSort()).toThrow(CycleError)
  })

  it('CycleError is catchable via instanceof', () => {
    const graph = new Graph()
    graph.addVertex(0, null)
    graph.addVertex(1, null)
    graph.addEdge(0, 1)
    graph.addEdge(1, 0)

    let caught: unknown
    try {
      graph.topologicalSort()
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(CycleError)
    expect(caught).toBeInstanceOf(Error)
  })

  it('topologicalSort handles disconnected DAG', () => {
    const graph = new Graph<string>()
    graph.addVertex('a', 'alpha')
    graph.addVertex('b', 'beta')
    graph.addVertex('c', 'gamma')
    graph.addEdge('a', 'b')

    const order = graph.topologicalSort()
    expect(order).toHaveLength(3)
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
    expect(order).toContain('c')
  })

  it('topologicalSort returns empty array for empty graph', () => {
    expect(new Graph().topologicalSort()).toEqual([])
  })

  it('breadthFirstSearch returns empty array for unknown startId', () => {
    expect(new Graph().breadthFirstSearch(0)).toEqual([])
    expect(new Graph().breadthFirstSearch('unknown')).toEqual([])
  })

  it('breadthFirstSearch returns vertices in BFS order from a given startId', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 2)
    graph.addEdge(0, 1)
    graph.addEdge(1, 3)
    graph.addEdge(2, 3)

    expect(graph.breadthFirstSearch(0)).toEqual([0, 2, 1, 3])
    expect(graph.breadthFirstSearch(2)).toEqual([2, 3])
  })

  it('depthFirstSearch returns vertices in DFS order from a given startId', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addVertex(3, 'd')
    graph.addEdge(0, 2)
    graph.addEdge(0, 1)
    graph.addEdge(1, 3)
    graph.addEdge(2, 3)

    expect(graph.depthFirstSearch(0)).toEqual([0, 2, 3, 1])
    expect(graph.depthFirstSearch(1)).toEqual([1, 3])
  })

  it('breadthFirstSearch and depthFirstSearch accept string VertexId', () => {
    const graph = new Graph<string>()
    graph.addVertex('a', 'alpha')
    graph.addVertex('b', 'beta')
    graph.addVertex('c', 'gamma')
    graph.addEdge('a', 'b')
    graph.addEdge('a', 'c')

    expect(graph.breadthFirstSearch('a')).toEqual(['a', 'b', 'c'])
    expect(graph.depthFirstSearch('a')).toEqual(['a', 'b', 'c'])
  })

  it('depthFirstSearch returns empty array for unknown startId', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')

    expect(graph.depthFirstSearch(99)).toEqual([])
    expect(graph.depthFirstSearch('unknown')).toEqual([])
  })

  it('breadthFirstSearch and depthFirstSearch return [startId] for a vertex with no edges', () => {
    const graph = new Graph<string>()
    graph.addVertex(42, 'lone')

    expect(graph.breadthFirstSearch(42)).toEqual([42])
    expect(graph.depthFirstSearch(42)).toEqual([42])
  })

  it('breadthFirstSearch and depthFirstSearch do not visit vertices unreachable from startId', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'disconnected')
    graph.addEdge(0, 1)

    expect(graph.breadthFirstSearch(0)).toEqual([0, 1])
    expect(graph.depthFirstSearch(0)).toEqual([0, 1])
  })

  it('breadthFirstSearch and depthFirstSearch terminate on a cyclic graph without duplicates', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)
    graph.addEdge(2, 0)

    const bfs = graph.breadthFirstSearch(0)
    const dfs = graph.depthFirstSearch(0)
    expect(bfs).toHaveLength(3)
    expect(new Set(bfs).size).toBe(3)
    expect(dfs).toHaveLength(3)
    expect(new Set(dfs).size).toBe(3)
  })

  it('breadthFirstSearch and depthFirstSearch produce deterministic order across multiple calls', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')
    graph.addVertex(1, 'b')
    graph.addVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)

    expect(graph.breadthFirstSearch(0)).toEqual([0, 1, 2])
    expect(graph.depthFirstSearch(0)).toEqual([0, 1, 2])
    const firstBfs = graph.breadthFirstSearch(0)
    const firstDfs = graph.depthFirstSearch(0)
    expect(graph.breadthFirstSearch(0)).toEqual(firstBfs)
    expect(graph.depthFirstSearch(0)).toEqual(firstDfs)
  })

  it('models task dependencies through the Graph interface', () => {
    const graph = createTaskGraph()

    // Insertion order: addEdge(0,1) before addEdge(0,2)
    expect(graph.getAdjacent(0)).toEqual([1, 2])
    expect(graph.findShortestPath(2, 6)).toEqual([2, 3, 5, 6])
    expect(graph.findShortestPath(2, 8)).toBeDefined()
    const topoOrder = graph.topologicalSort()
    expect(topoOrder).toHaveLength(9)
    const pos = (id: number) => topoOrder.indexOf(id)
    expect(pos(0)).toBeLessThan(pos(1))
    expect(pos(0)).toBeLessThan(pos(2))
    expect(pos(1)).toBeLessThan(pos(3))
    expect(pos(1)).toBeLessThan(pos(4))
    expect(pos(2)).toBeLessThan(pos(3))
    expect(pos(2)).toBeLessThan(pos(4))
    expect(pos(3)).toBeLessThan(pos(5))
    expect(pos(4)).toBeLessThan(pos(5))
    expect(pos(5)).toBeLessThan(pos(6))
    expect(pos(5)).toBeLessThan(pos(7))
    expect(pos(6)).toBeLessThan(pos(8))
  })

  it('old index-era methods are absent from Graph', () => {
    const graph = new Graph<string>() as unknown as Record<string, unknown>
    expect(graph['mapGraphOver']).toBeUndefined()
    expect(graph['printGraph']).toBeUndefined()
    expect(graph['findMotherVertex']).toBeUndefined()
    expect(graph['checkPath']).toBeUndefined()
    expect(graph['depthFirstTraversal']).toBeUndefined()
    expect(graph['sortTopologically']).toBeUndefined()
    expect(graph['setVertex']).toBeUndefined()
    expect(graph['size']).toBeUndefined()
  })

  it('breadthFirstSearch and depthFirstSearch reject no-argument call shape', () => {
    const graph = new Graph<string>()
    graph.addVertex(0, 'a')

    // @ts-expect-error — old no-arg signature must not compile
    graph.breadthFirstSearch()
    // @ts-expect-error — old no-arg signature must not compile
    graph.depthFirstSearch()

    expect(graph.breadthFirstSearch(0)).toEqual([0])
    expect(graph.depthFirstSearch(0)).toEqual([0])
  })
})
