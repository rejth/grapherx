import { VertexAlreadyExistsError, VertexNotFoundError } from './errors'
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

    const graph = new Graph<string>(tasks.length)

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
    const graph = new Graph<string>(2)

    expect(graph.setVertex(0, 'source')).toBe(true)
    expect(graph.addVertex(1, 'target')).toBe(true)
    expect(graph.addEdge(0, 1)).toBe(true)

    const vertex = graph.getVertex(0)
    const adjacent = graph.getAdjacent(0)

    expect(vertex).toEqual({ id: 0, value: 'source' })
    expect(adjacent).toEqual([{ id: 1, value: 'target' }])
    expect(Object.keys(vertex ?? {}).sort()).toEqual(['id', 'value'])
    expect(Object.keys(adjacent[0]).sort()).toEqual(['id', 'value'])

    const id: VertexId = vertex!.id
    expect(typeof id === 'string' || typeof id === 'number').toBe(true)
  })

  it('keeps graph mutation behind the Graph interface', () => {
    const graph = new Graph<string>(3)

    graph.setVertex(0, 'a')
    graph.setVertex(1, 'b')
    graph.setVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)

    expect(graph.removeEdge(0, 1)).toBe(true)
    expect(graph.removeEdge(0, 1)).toBe(false)
    expect(graph.getAdjacent(0)).toEqual([{ id: 2, value: 'c' }])

    expect(graph.removeVertex(1)).toEqual({ id: 1, value: 'b' })
    expect(graph.size).toBe(2)
    expect(graph.getAdjacent(0)).toEqual([{ id: 2, value: 'c' }])
  })

  it('removes incoming adjacency when a vertex is removed', () => {
    const graph = new Graph<string>(4)

    graph.setVertex(0, 'a')
    graph.setVertex(1, 'b')
    graph.setVertex(2, 'c')
    graph.setVertex(3, 'd')
    graph.addEdge(0, 2)
    graph.addEdge(1, 2)
    graph.addEdge(2, 3)

    expect(graph.removeVertex(2)).toEqual({ id: 2, value: 'c' })
    expect(graph.getAdjacent(0)).toEqual([])
    expect(graph.getAdjacent(1)).toEqual([])
    expect(graph.getAdjacent(2)).toEqual([])
  })

  it('returns graph snapshots keyed by vertex index', () => {
    const graph = new Graph<string>(2)

    graph.setVertex(0, 'source')
    graph.setVertex(1, 'target')
    graph.addEdge(0, 1)

    expect(graph.mapGraphOver()).toEqual(
      new Map([
        [0, [{ id: 1, value: 'target' }]],
        [1, []],
      ]),
    )
  })

  it('runs graph operations through the public seam', () => {
    const graph = new Graph<string>(3)

    graph.setVertex(0, 'a')
    graph.setVertex(1, 'b')
    graph.setVertex(2, 'c')
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)

    expect([...graph.depthFirstTraversal(0)]).toEqual([
      { id: 0, value: 'a' },
      { id: 1, value: 'b' },
      { id: 2, value: 'c' },
    ])
    expect(graph.findMotherVertex()).toEqual({ id: 0, value: 'a' })
    expect(graph.findShortestPath(0, 2)).toBe(2)
    expect(graph.checkPath(0, 2)).toBe(true)
  })

  it('concentrates traversal behavior across graph operations', () => {
    const graph = new Graph<string>(4)

    graph.setVertex(0, 'a')
    graph.setVertex(1, 'b')
    graph.setVertex(2, 'c')
    graph.setVertex(3, 'd')
    graph.addEdge(0, 2)
    graph.addEdge(0, 1)
    graph.addEdge(1, 3)
    graph.addEdge(2, 3)

    expect(graph.breadthFirstSearch()).toEqual([0, 1, 2, 3])
    expect(graph.depthFirstSearch()).toEqual([0, 1, 3, 2])
    expect([...graph.depthFirstTraversal(0)]).toEqual([
      { id: 0, value: 'a' },
      { id: 1, value: 'b' },
      { id: 3, value: 'd' },
      { id: 2, value: 'c' },
    ])
    expect(graph.findShortestPath(0, 3)).toBe(2)
    expect(graph.checkPath(2, 1)).toBe(false)
  })

  it('returns empty traversal results for invalid or unreachable paths', () => {
    const graph = new Graph(2)

    graph.addEdge(0, 1)

    expect([...graph.depthFirstTraversal(4)]).toEqual([])
    expect(graph.findShortestPath(1, 0)).toBe(-1)
    expect(graph.findShortestPath(0, 4)).toBe(-1)
    expect(graph.checkPath(4, 0)).toBe(false)
  })

  it('detects directed cycles', () => {
    const graph = new Graph(3)

    graph.addEdge(0, 1)
    graph.addEdge(1, 2)
    graph.addEdge(2, 0)

    expect(graph.detectCycle()).toBe(true)
  })

  it('vertex insertion order is stable across add and remove cycles', () => {
    const graph = new Graph<string>(4)
    graph.setVertex(0, 'a')
    graph.setVertex(1, 'b')
    graph.setVertex(2, 'c')
    graph.setVertex(3, 'd')

    graph.removeVertex(1)

    const keys = [...graph.mapGraphOver().keys()]
    expect(keys).toEqual([0, 2, 3])

    const snapshot0 = graph.getVertex(0)
    const snapshot2 = graph.getVertex(2)
    const snapshot3 = graph.getVertex(3)
    expect(snapshot0?.id).toBe(0)
    expect(snapshot2?.id).toBe(2)
    expect(snapshot3?.id).toBe(3)

    expect(graph.getVertex(1)).toBeUndefined()
  })

  it('VertexSnapshot exposes id as VertexId, not index', () => {
    const graph = new Graph<string>(1)
    graph.setVertex(0, 'hello')

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

  it('models task dependencies through the Graph interface', () => {
    const graph = createTaskGraph()

    expect(graph.getAdjacent(0)).toEqual([
      { id: 2, value: 'RELOAD_COMPLEX_MEASURES' },
      { id: 1, value: 'RELOAD_MATCHED_TREATMENTS' },
    ])
    expect(graph.findShortestPath(2, 6)).toBe(3)
    expect(graph.findMotherVertex()).toEqual({
      id: 0,
      value: 'RELOAD_PATIENT_DATA',
    })
    expect(graph.checkPath(2, 8)).toBe(true)
    expect(graph.sortTopologically()).toEqual(graph.breadthFirstSearch())
    expect([...graph.mapGraphOver().keys()]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })
})
