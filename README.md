# GrapherX

GrapherX is a small TypeScript library for working with directed, index-based graphs.

Graphs are stored as adjacency lists. Callers work with vertex indices and receive readonly
snapshots instead of mutable internal vertices.

```ts
import { Graph } from 'grapherx';

const graph = new Graph<string>(3);

graph.setVertex(0, 'load data');
graph.setVertex(1, 'match treatments');
graph.setVertex(2, 'pull results');

graph.addEdge(0, 1);
graph.addEdge(1, 2);

graph.getAdjacent(0);
// [{ index: 1, value: "match treatments" }]

graph.findShortestPath(0, 2);
// 2
```

## Model

`Graph<T>` is fixed-size: the constructor creates `V` indexed vertices from `0` to `V - 1`.
Use `setVertex` or `addVertex` to assign values to those existing vertices.

The graph is directed. It can represent a directed acyclic graph, and it can detect cycles, but
it does not currently prevent callers from adding cyclic edges.

Public graph observations use snapshots:

```ts
type VertexSnapshot<T> = Readonly<{
  index: number;
  value: T | null;
}>;

type GraphSnapshot<T> = Map<number, VertexSnapshot<T>[]>;
```

## Features and Complexity

`V` is the number of vertices. `E` is the number of edges. `out(v)` is the number of outgoing
edges from a vertex.

- [x] Set vertex value: `O(1)`
- [x] Add edge: `O(1)`
- [x] Get vertex snapshot: `O(1)`
- [x] Get adjacent vertex snapshots: `O(out(v))`
- [x] Update vertex and return adjacent snapshots: `O(out(v))`
- [x] Remove vertex: `O(V + E)`
- [x] Remove edge: `O(out(source))`
- [x] Breadth-first search: `O(V + E)`
- [x] Depth-first search: `O(V + E)`
- [x] Detect cycles: `O(V + E)`
- [x] Find shortest path in an unweighted graph: `O(V + E)`
- [x] Check whether a path exists: `O(V + E)`
- [x] Find a mother vertex: `O(V(V + E))`

## Current Limitations

- Vertices are identified by numeric indices, not stable user-defined keys.
- The graph is not dynamically resizable after construction.
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
