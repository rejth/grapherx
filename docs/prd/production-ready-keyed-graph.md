# Production-ready keyed Graph

## Problem Statement

GrapherX is currently useful as a small directed graph utility, but its core data model is not production-ready. Callers still inherit too much of the original fixed-size, index-based model: vertices are addressed by array positions, graph size is fixed at construction time, and the public model does not match caller-owned domain identities. Internally, the current model also carries avoidable memory and performance costs, including UUIDs for vertices, linked-list-backed adjacency, allocation-heavy snapshot reads, and public `LinkedList` code that is not part of the Graph domain.

The user wants GrapherX to become a production-ready graph library where callers express Graphs, Vertices, Vertex IDs, and Edges in stable domain terms, while the implementation owns storage details, validation, traversal behavior, and error semantics.

## Solution

Replace the current index-based `Graph` interface with a keyed mutable `Graph` whose Vertices are identified by caller-provided string or number Vertex IDs. The Graph remains mutable for commands, but observations are immutable: callers receive Vertex Snapshots or Vertex ID collections, never mutable internal Vertices.

The production-ready Graph will use map-backed adjacency storage with `Map<VertexId, EdgeRecord>` so duplicate Edges are rejected efficiently and future Edge metadata can be added without another storage rewrite. Mutating commands will use strict custom errors. Traversal methods will require a start Vertex ID and return Vertex IDs. `findShortestPath` will return the path as Vertex IDs. `topologicalSort` will replace the misleading `sortTopologically` behavior with a real topological sort that throws when the Graph contains a cycle.

## User Stories

1. As a library user, I want to add a Vertex using my own stable Vertex ID, so that I do not have to translate domain entities into array indices.
2. As a library user, I want Vertex IDs to support strings and numbers, so that I can use common domain IDs and database IDs.
3. As a library user, I want Vertex values to be required when adding a Vertex, so that Graph observations do not leak `null` payloads by default.
4. As a library user, I want to use `undefined` as a value only when my value type allows it, so that empty payloads are explicit.
5. As a library user, I want duplicate Vertex IDs to be rejected, so that accidental duplicate domain entities are caught early.
6. As a library user, I want to update an existing Vertex value separately from adding a Vertex, so that create and update intent is explicit.
7. As a library user, I want to add an Edge using source and target Vertex IDs, so that Graph operations read in domain terms.
8. As a library user, I want adding an Edge to require both Vertices to already exist, so that typos and missing data are not silently accepted.
9. As a library user, I want duplicate Edges to be rejected, so that repeated input bugs are visible.
10. As a library user, I want Edges to be identity-only for now, so that the first production version stays focused.
11. As a future library user, I want the internal Edge storage to leave room for Edge metadata, so that metadata can be added without rewriting adjacency storage.
12. As a library user, I want removing a Vertex to remove all incoming and outgoing Edges automatically, so that the Graph cannot retain dangling Edges.
13. As a library user, I want removing a missing Vertex to throw a precise error, so that invalid mutation is visible.
14. As a library user, I want removing a missing Edge to throw a precise error, so that invalid mutation is visible.
15. As a library user, I want querying a missing Vertex to return absence, so that read operations can be used naturally.
16. As a library user, I want `getVertex` to return an immutable Vertex Snapshot, so that I can observe ID and value without mutating storage.
17. As a library user, I want `getAdjacent` to return adjacent Vertex IDs, so that the common adjacency read is cheap and identity-focused.
18. As a library user, I want an optional richer adjacent-Vertex observation later if needed, so that payload reads remain separate from adjacency identity reads.
19. As a library user, I want traversal methods to require a start Vertex ID, so that there is no hidden start-at-zero behavior.
20. As a library user, I want breadth-first traversal to return Vertex IDs, so that traversal output is cheap and consistent.
21. As a library user, I want depth-first traversal to return Vertex IDs, so that traversal output is cheap and consistent.
22. As a library user, I want traversal order to be deterministic, so that tests and production behavior are predictable.
23. As a library user, I want Vertex iteration order to preserve Vertex insertion order, so that Graph observations are stable.
24. As a library user, I want adjacent iteration order to preserve Edge insertion order, so that traversal and adjacency behavior are stable.
25. As a library user, I want `findShortestPath` to return the path as Vertex IDs, so that I can use the route directly.
26. As a library user, I want unreachable shortest path queries to return absence, so that no-path is distinct from an empty Graph.
27. As a library user, I want cycle detection to remain available as a boolean query, so that I can check whether a Graph is a Directed Acyclic Graph state.
28. As a library user, I want Graphs to allow cycles by default, so that the base Graph remains general-purpose.
29. As a dependency-graph user, I want a future DAG-enforcing mode to be possible, so that cycle prevention can be opted into later.
30. As a library user, I want `topologicalSort` to be a real topological sort, so that it is correct for Directed Acyclic Graph states.
31. As a library user, I want `topologicalSort` to throw on cyclic Graphs, so that invalid topological sorting does not look like an empty result.
32. As a library user, I want `vertexCount` and `edgeCount` readonly getters, so that I can inspect Graph size without deriving it manually.
33. As a library user, I want custom error classes, so that I can catch specific mutation failures.
34. As a library user, I want `VertexNotFoundError`, so that missing Vertex ID failures are precise.
35. As a library user, I want `VertexAlreadyExistsError`, so that duplicate Vertex creation failures are precise.
36. As a library user, I want `EdgeAlreadyExistsError`, so that duplicate Edge failures are precise.
37. As a library user, I want `EdgeNotFoundError`, so that missing Edge removal failures are precise.
38. As a library user, I want `CycleError`, so that topological sorting and future DAG enforcement failures are precise.
39. As a maintainer, I want Graph storage to use Maps rather than linked lists, so that memory overhead is lower and lookup/removal behavior is clearer.
40. As a maintainer, I want to remove UUIDs from Vertices, so that Graph identity is not duplicated internally.
41. As a maintainer, I want `LinkedList` removed from the public model, so that GrapherX remains a Graph library rather than a general data-structures package.
42. As a maintainer, I want the rewrite to replace `Graph` directly instead of adding `KeyedGraph`, so that the public surface remains focused.
43. As a maintainer, I want the implementation to proceed in compatibility-preserving internal slices before the final interface switch, so that algorithm regressions are easier to catch.
44. As a maintainer, I want tests to describe external Graph behavior, so that internals can be refactored without rewriting tests.
45. As a maintainer, I want README and declarations to reflect the production-ready Graph model, so that package consumers see the real API.

## Implementation Decisions

- Replace index-based Vertex identity with caller-provided Vertex ID identity.
- Define Vertex ID as `string | number`.
- Treat Vertex values as required by default; callers may use `undefined` only when their value type includes it.
- Keep the Graph mutable for commands.
- Keep Graph observations immutable.
- Reject duplicate Vertex IDs.
- Reject duplicate Edges.
- Require both Vertices to exist before adding an Edge.
- Remove all incident Edges automatically when removing a Vertex.
- Use strict mutation semantics: invalid mutations throw custom errors.
- Use absence-returning query semantics for missing data where appropriate.
- Add custom error classes for missing Vertices, duplicate Vertices, duplicate Edges, missing Edges, and cyclic topological sort.
- Store Vertices in a map keyed by Vertex ID.
- Store adjacency in map-backed Edge records, preserving insertion order.
- Keep Edges identity-only in the public API for now.
- Reserve the internal Edge record shape for future Edge metadata.
- Remove per-Vertex UUIDs because Vertex ID is the canonical identity.
- Remove linked-list-backed adjacency.
- Remove `LinkedList` from the public product model and eventually from source once no longer used.
- Replace `sortTopologically` with `topologicalSort`.
- Make `topologicalSort` throw on cyclic Graphs.
- Keep `detectCycle` as a boolean query.
- Make traversal methods require a start Vertex ID.
- Make traversal methods return Vertex IDs.
- Make `findShortestPath` return the shortest path as Vertex IDs, not only distance.
- Expose `vertexCount` and `edgeCount` readonly getters.
- Preserve Vertex insertion order.
- Preserve adjacent Edge insertion order.
- Implement the rewrite as a breaking replacement of `Graph`, not a parallel `KeyedGraph`.
- Proceed in internal slices before the final public interface switch: introduce Vertex IDs and map storage, replace adjacency storage, add errors, add ID-based tests, switch public Graph interface, then remove index-era tests/docs/types.
- Respect ADR-0001, which records the choice to replace the indexed graph with a keyed mutable Graph.

## Testing Decisions

- Tests should exercise external behavior through the public Graph interface and avoid asserting internal storage details.
- Graph tests should cover adding Vertices, rejecting duplicate Vertices, setting Vertex values, retrieving Vertex Snapshots, and missing Vertex queries.
- Graph tests should cover adding Edges, rejecting missing Vertex IDs, rejecting duplicate Edges, removing Edges, and throwing on missing Edges.
- Graph tests should cover removing a Vertex and automatically removing incoming and outgoing Edges.
- Graph tests should cover `vertexCount` and `edgeCount`.
- Graph tests should cover deterministic insertion order for Vertices and adjacent Vertex IDs.
- Traversal tests should cover breadth-first traversal from a start Vertex ID.
- Traversal tests should cover depth-first traversal from a start Vertex ID.
- Path tests should cover shortest path returning a Vertex ID path and absence for unreachable targets.
- Cycle tests should cover `detectCycle` returning true and false.
- Topological sort tests should cover valid ordering for a Directed Acyclic Graph and `CycleError` for cyclic Graphs.
- Error tests should assert specific custom error classes rather than generic error messages.
- Existing Graph interface tests and task-dependency scenario tests provide prior art for behavior-level tests.
- Existing LinkedList tests can be removed when LinkedList leaves the product model.

## Out of Scope

- Edge metadata in the public API.
- Object or symbol Vertex IDs.
- Immutable Graph updates.
- A separate `KeyedGraph` class.
- DAG enforcement by default.
- A DAG-only factory or module in the first implementation.
- Returning actual cycle paths from cycle detection.
- Weighted shortest paths.
- General-purpose `LinkedList`, `Stack`, or `Queue` modules.
- Serialization and deserialization APIs.
- Browser or visualization features.

## Further Notes

This PRD intentionally describes a breaking production-ready rewrite. The current library is small enough that carrying both the indexed Graph and the keyed Graph would add more confusion than value.

The glossary defines Graph, Directed Acyclic Graph, Vertex, Vertex ID, Edge, and Vertex Snapshot. Implementation work should use those terms consistently.

The GitHub issue version of this PRD is [#1](https://github.com/rejth/grapherx/issues/1).
