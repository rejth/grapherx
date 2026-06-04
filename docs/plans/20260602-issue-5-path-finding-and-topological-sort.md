# Path finding + topological sort

## Overview

Update `findShortestPath` to return the full path as `VertexId[] | undefined` instead of a distance count. Add `topologicalSort` as a correct replacement for `sortTopologically` — it returns a valid topological ordering for DAGs and throws `CycleError` when the graph contains a cycle. Update `detectCycle` internals to use `VertexId`-based storage. Remove `sortTopologically`.

## Context

- Impacted files: `src/Graph/Graph.ts`, `src/Graph/errors.ts`, `src/Graph/interface.ts`, `src/Graph/index.ts`
- Depends on issue #2 (VertexId, map-backed vertex storage) and issue #4 (ID-based BFS/DFS) being complete
- Adopted from `docs/prd/production-ready-keyed-graph/issue-5-path-finding-and-topological-sort.md` (GitHub issue #5)

## Development Approach

- Testing approach: regular
- Complete each task fully before moving to the next
- Update this plan when scope changes during implementation

## Testing Strategy

- Unit tests required for every code-changing task
- Run project tests after each task before proceeding

## Progress Tracking

- Mark completed items with `[x]` immediately when done
- Update plan if implementation deviates from original scope

## Implementation Steps

### Task 1: Update findShortestPath to return path array

- [x] Rewrite `findShortestPath(sourceId: VertexId, targetId: VertexId): VertexId[] | undefined` to track the predecessor of each visited vertex during BFS
- [x] On reaching the target, reconstruct and return the path as an ordered `VertexId[]` from source to target (inclusive)
- [x] Return `undefined` when the target is unreachable (not reachable from source via any path)
- [x] Update `IGraph<T>` signature for `findShortestPath` to reflect the new return type
- [x] Write tests: path returned for reachable target, `undefined` for unreachable target, path includes both source and target vertices
- [x] Run project tests — must pass before next task

### Task 2: Add CycleError, topologicalSort, update detectCycle, remove sortTopologically

- [ ] Add `CycleError` class to `src/Graph/errors.ts`
- [ ] Export `CycleError` from `src/Graph/index.ts`
- [ ] Implement `topologicalSort(): VertexId[]` using Kahn's algorithm or DFS-based topo sort; throw `CycleError` if a cycle is detected
- [ ] Update `detectCycle()` internals to use `VertexId`-based vertex tracking (replacing any index-based visited arrays)
- [ ] Remove `sortTopologically` from `Graph` and `IGraph`
- [ ] Update `IGraph<T>` to add `topologicalSort(): VertexId[]`
- [ ] Write tests: `topologicalSort` returns valid ordering for a DAG, throws `CycleError` for cyclic graph, `CycleError` catchable via `instanceof`
- [ ] Write tests: `detectCycle` returns `true` for cyclic graphs and `false` for acyclic graphs
- [ ] Run project tests — must pass before next task

### Task 3: Verify acceptance criteria

- [ ] Verify `findShortestPath` returns `VertexId[]` containing the full path from source to target
- [ ] Verify `findShortestPath` returns `undefined` when target is unreachable
- [ ] Verify `topologicalSort` returns a valid topological ordering for a DAG
- [ ] Verify `topologicalSort` throws `CycleError` when the graph contains a cycle
- [ ] Verify `detectCycle` returns `true` for cyclic graphs and `false` for acyclic graphs
- [ ] Verify `CycleError` is exported and catchable via `instanceof`
- [ ] Verify `sortTopologically` is absent from `Graph` and `IGraph`
- [ ] Run full project test suite
- [ ] Run project linter — all issues must be fixed
