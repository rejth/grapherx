# Behavior tests + README

## Overview

Write a comprehensive external-behavior test suite that exercises `Graph` entirely through the public `IGraph` interface, with no assertions on internal storage details. Remove the LinkedList test file and all index-era tests. Update README to document the production-ready keyed API and update exported type declarations to reflect the new types.

## Context

- Impacted files: `src/Graph/Graph.test.ts`, `src/LinkedList/LinkedList.test.ts`, `README.md`, `types/` or `dist/` type declarations
- Depends on issue #6 (public interface switch) being complete — all methods, types, and error classes must be finalized before the test suite is written
- Adopted from `docs/prd/production-ready-keyed-graph/issue-7-behavior-tests-and-readme.md` (GitHub issue #7)

## Development Approach

- Testing approach: regular
- Complete each task fully before moving to the next
- Update this plan when scope changes during implementation

## Testing Strategy

- All tests exercise external behavior through `IGraph` only — no reaching into private fields or implementation details
- Run project tests after each task before proceeding

## Progress Tracking

- Mark completed items with `[x]` immediately when done
- Update plan if implementation deviates from original scope

## Implementation Steps

### Task 1: Remove index-era tests and LinkedList tests

- [x] Delete `src/LinkedList/LinkedList.test.ts`
- [x] Remove all test cases in `src/Graph/Graph.test.ts` that reference index-based addressing (numeric array positions, `index` field on snapshots, fixed-size constructor arg)
- [x] Confirm no remaining test file imports `LinkedList` or `AdjacencyList`
- [x] Run project tests — must pass before next task

### Task 2: Write vertex behavior tests

- [x] Test `addVertex`: adds a vertex, `vertexCount` increments
- [x] Test `addVertex`: throws `VertexAlreadyExistsError` on duplicate ID (string and number IDs)
- [x] Test `updateVertex`: updates the value of an existing vertex
- [x] Test `updateVertex`: throws `VertexNotFoundError` on missing ID
- [x] Test `getVertex`: returns `VertexSnapshot` with correct `id` and `value` for known ID
- [x] Test `getVertex`: returns `undefined` for unknown ID
- [x] Test `removeVertex`: removes the vertex, `vertexCount` decrements
- [x] Test `removeVertex`: throws `VertexNotFoundError` on missing ID
- [x] Test `vertexCount`: reflects current count accurately
- [x] Run project tests — must pass before next task

### Task 3: Write edge behavior tests

- [x] Test `addEdge`: adds a directed edge, `edgeCount` increments
- [x] Test `addEdge`: throws `VertexNotFoundError` for missing source vertex
- [x] Test `addEdge`: throws `VertexNotFoundError` for missing target vertex
- [x] Test `addEdge`: throws `EdgeAlreadyExistsError` on duplicate edge
- [x] Test `removeEdge`: removes the edge, `edgeCount` decrements
- [x] Test `removeEdge`: throws `EdgeNotFoundError` on missing edge
- [x] Test `getAdjacent`: returns `VertexId[]` in edge insertion order
- [x] Test `edgeCount`: reflects current count accurately
- [x] Test `removeVertex` cascade: removes all incoming and outgoing edges automatically
- [x] Test insertion order: vertex iteration order is stable; adjacent ID order is stable
- [x] Run project tests — must pass before next task

### Task 4: Write traversal, path, and sort tests

- [x] Test `breadthFirstSearch`: returns correct BFS order from a start vertex
- [x] Test `depthFirstSearch`: returns correct DFS order from a start vertex
- [x] Test `findShortestPath`: returns `VertexId[]` path for reachable target
- [x] Test `findShortestPath`: returns `undefined` for unreachable target
- [x] Test `detectCycle`: returns `true` for cyclic graph
- [x] Test `detectCycle`: returns `false` for acyclic graph
- [x] Test `topologicalSort`: returns valid topological ordering for a DAG
- [x] Test `topologicalSort`: throws `CycleError` for cyclic graph
- [x] Test all five error classes catchable via `instanceof`: `VertexNotFoundError`, `VertexAlreadyExistsError`, `EdgeNotFoundError`, `EdgeAlreadyExistsError`, `CycleError`
- [x] Run project tests — must pass before next task

### Task 5: Update README and type declarations

- [x] Update README: document `Graph` construction (no size argument), all public method signatures with parameter types and return types
- [x] Update README: document all five error classes with their throw conditions
- [x] Update README: document `VertexSnapshot<T>` shape (`id: VertexId`, `value: T`)
- [x] Update exported type declarations (`types/` or `dist/` as applicable): ensure `VertexId`, updated `VertexSnapshot<T>`, and all error classes are exported
- [x] Run project tests — must pass before next task

### Task 6: Verify acceptance criteria

- [x] Verify test suite covers all vertex, edge, cascade, insertion-order, traversal, path, cycle, and topo-sort behavior
- [x] Verify all tests pass
- [x] Verify no test asserts on internal storage details
- [x] Verify `LinkedList.test.ts` is deleted
- [x] Verify no index-based test cases remain
- [x] Verify README documents the new API accurately
- [x] Verify exported type declarations reflect `VertexId`, updated `VertexSnapshot`, and error classes
- [x] Run full project test suite
- [x] Run project linter — all issues must be fixed
