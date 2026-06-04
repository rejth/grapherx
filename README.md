# GrapherX

GrapherX is a small TypeScript library for working with directed graphs with caller-provided vertex identifiers.

Graphs are stored in a map-backed adjacency structure. Callers work with `VertexId` keys and receive readonly snapshots instead of mutable internal vertices.

```ts
import { Graph } from 'grapherx';

const graph = new Graph<string>();

graph.addVertex(0, 'load data');
graph.addVertex(1, 'match treatments');
graph.addVertex(2, 'pull results');

graph.addEdge(0, 1);
graph.addEdge(1, 2);

graph.getAdjacent(0);
// [1]

graph.breadthFirstSearch(0);
// [0, 1, 2]

graph.depthFirstSearch(1);
// [1, 2]

graph.findShortestPath(0, 2);
// [0, 1, 2]
```

## Model

`Graph<T>` is dynamically sized. Vertices are added individually with `addVertex(id, value)` where `id` is a caller-provided `VertexId` (`string | number`). The constructor takes no arguments.

The graph is directed. It can represent a directed acyclic graph, and it can detect cycles. Self-loops (an edge from a vertex to itself) are rejected at insertion time; multi-vertex cyclic edges are not prevented.

Public graph observations use snapshots:

```ts
type VertexId = string | number;

type VertexSnapshot<T> = Readonly<{
  id: VertexId;
  value: T;
}>;
```

`addVertex` throws `VertexAlreadyExistsError` on a duplicate ID. `updateVertex`, `removeVertex`, and `getAdjacent` throw `VertexNotFoundError` when the ID does not exist. `addEdge` throws `VertexNotFoundError` when either endpoint does not exist, throws `EdgeAlreadyExistsError` on a duplicate edge, and throws `SelfLoopError` when source and target are the same vertex. `removeEdge` throws `VertexNotFoundError` for a missing endpoint and `EdgeNotFoundError` when the edge does not exist. `topologicalSort` throws `CycleError` when the graph contains a cycle. All six error classes are exported and catchable via `instanceof`.

## API Reference

### Construction

```ts
const graph = new Graph<T>()
```

No arguments. `T` is the type of vertex values.

### Vertex methods

```ts
addVertex(id: VertexId, value: T): void
updateVertex(id: VertexId, value: T): void
getVertex(id: VertexId): VertexSnapshot<T> | undefined
removeVertex(id: VertexId): void
get vertexCount(): number
```

### Edge methods

```ts
addEdge(sourceId: VertexId, targetId: VertexId): void
removeEdge(sourceId: VertexId, targetId: VertexId): void
getAdjacent(id: VertexId): VertexId[]
get edgeCount(): number
```

### Traversal and analysis

```ts
breadthFirstSearch(startId: VertexId): VertexId[]
depthFirstSearch(startId: VertexId): VertexId[]
findShortestPath(sourceId: VertexId, targetId: VertexId): VertexId[] | undefined
detectCycle(): boolean
topologicalSort(): VertexId[]
```

`findShortestPath` returns `undefined` when the target is unreachable **and** when either vertex does not exist. It does not throw `VertexNotFoundError`. To distinguish a missing vertex from an unreachable target, call `getVertex(id)` first.

### Error classes

All error classes extend `Error`, are exported, and are catchable via `instanceof`.

| Class | Thrown by | Condition |
|---|---|---|
| `VertexAlreadyExistsError` | `addVertex` | ID already exists |
| `VertexNotFoundError` | `updateVertex`, `removeVertex`, `addEdge`, `removeEdge`, `getAdjacent` | ID not found |
| `EdgeAlreadyExistsError` | `addEdge` | Edge already exists |
| `EdgeNotFoundError` | `removeEdge` | Edge not found |
| `SelfLoopError` | `addEdge` | Source and target are the same vertex |
| `CycleError` | `topologicalSort` | Graph contains a cycle |

## Features and Complexity

`V` is the number of vertices. `E` is the number of edges. `out(v)` is the number of outgoing edges from a vertex.

- [x] Add vertex: `O(1)`
- [x] Update vertex value: `O(1)`
- [x] Add edge: `O(1)`
- [x] Get vertex snapshot: `O(1)`
- [x] Get adjacent vertex IDs: `O(out(v))`
- [x] Edge count: `O(1)`
- [x] Remove vertex: `O(V + out(v))`
- [x] Remove edge: `O(1)`
- [x] Breadth-first search: `O(V + E)`
- [x] Depth-first search: `O(V + E)`
- [x] Detect cycles: `O(V + E)`
- [x] Find shortest path in an unweighted graph: `O(V + E)`
- [x] Topological sort (DAG): `O(V + E)`

## Breaking Changes

`breadthFirstSearch()` and `depthFirstSearch()` now require a `startId: VertexId` argument. The previous zero-argument form has been removed.

```ts
// Before
graph.breadthFirstSearch()
// After
graph.breadthFirstSearch(startId)
```

`sortTopologically()` has been renamed to `topologicalSort()` and now throws `CycleError` instead of returning an empty array when the graph contains a cycle.

```ts
// Before
graph.sortTopologically() // returned [] on cyclic graphs
// After
graph.topologicalSort() // throws CycleError on cyclic graphs
```

`findShortestPath(sourceId, targetId)` now returns `VertexId[] | undefined` (the full vertex path) instead of `number` (edge count). Returns `undefined` when the target is unreachable or when either vertex does not exist. The previous sentinel value `-1` is gone.

```ts
// Before
graph.findShortestPath(0, 2) // 2
// After
graph.findShortestPath(0, 2) // [0, 1, 2]
```

`depthFirstTraversal(startId)` has been removed. Use `depthFirstSearch(startId)` instead, which returns `VertexId[]` in the same DFS order.

`checkPath(sourceId, targetId)` has been removed. Use `findShortestPath(sourceId, targetId) !== undefined` instead.

`findMotherVertex()` has been removed with no direct replacement.

`mapGraphOver()` has been removed. To inspect the adjacency structure, iterate vertex IDs and call `getAdjacent(id)` for each.

`LinkedList` is no longer exported from the package. It is an internal data structure.

## Current Limitations

- Multi-vertex cycles are allowed at insertion time; use `detectCycle()` to check for them. Self-loops are rejected by `addEdge` with `SelfLoopError`.

## Get Started

Prerequisites:

- Node 16+
- npm 5+
- git

```bash
git clone https://github.com/rejth/grapherx.git
cd grapherx
npm install
```

## Scripts

### `npm run build`

Builds the library into the `dist` folder.

### `npm run test`

Runs the Jest test suite.

### `npm run declarations`

Generates TypeScript declaration files.
