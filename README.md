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

graph.findShortestPath(0, 2);
// 2
```

## Model

`Graph<T>` is dynamically sized. Vertices are added individually with `addVertex(id, value)` where `id` is a caller-provided `VertexId` (`string | number`). The constructor takes no arguments.

The graph is directed. It can represent a directed acyclic graph, and it can detect cycles, but it does not currently prevent callers from adding cyclic edges.

Public graph observations use snapshots:

```ts
type VertexId = string | number;

type VertexSnapshot<T> = Readonly<{
  id: VertexId;
  value: T;
}>;

type GraphSnapshot = Map<VertexId, VertexId[]>;
```

`addVertex` throws `VertexAlreadyExistsError` on a duplicate ID. `updateVertex` and `removeVertex` throw `VertexNotFoundError` when the ID does not exist. `addEdge` throws `VertexNotFoundError` when either endpoint does not exist, and throws `EdgeAlreadyExistsError` on a duplicate edge. `removeEdge` throws `VertexNotFoundError` for a missing endpoint and `EdgeNotFoundError` when the edge does not exist. All four error classes are exported and catchable via `instanceof`.

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
- [x] Check whether a path exists: `O(V + E)`
- [x] Find a mother vertex: `O(V(V + E))`

## Current Limitations

- Cycles are allowed at insertion time; use `detectCycle()` to check for them.
- `sortTopologically()` currently returns breadth-first order when the graph is acyclic. It is
  not a full topological sort implementation yet.
- `printGraph()` writes to stdout and is mainly useful for debugging.

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
