# Replace indexed graph with keyed mutable graph

GrapherX will replace the current fixed-size, index-based `Graph` interface with a keyed mutable graph whose vertices are identified by caller-provided string or number Vertex IDs. The current index model forces callers to translate domain identities into array positions, while a production-ready graph should let callers express vertices and edges in their own stable IDs.

The graph will remain mutable, but observations will be immutable snapshots or Vertex ID collections. Mutating commands will be strict: missing Vertex IDs, duplicate Vertex IDs, duplicate Edges, and missing Edges will throw custom errors. Edges are identity-only for now, but adjacency storage will use `Map<VertexId, EdgeRecord>` so edge metadata can be added later without another storage rewrite.

`Graph` may contain cycles by default; a Directed Acyclic Graph is a checked graph state, not the default invariant. Traversal methods will require a start Vertex ID and return Vertex IDs. `findShortestPath` will return the path as Vertex IDs, and `topologicalSort` will replace the misleading `sortTopologically` behavior with a real topological sort that throws on cyclic graphs. `LinkedList` will be removed from the public model because GrapherX is a graph library, not a general data-structures package.
