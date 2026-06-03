# ID-based BFS + DFS traversal

## Overview

Replace the current start-at-zero, no-argument `breadthFirstSearch()` and `depthFirstSearch()` with ID-based traversal methods that accept a `startId: VertexId` and return `VertexId[]`. Both methods must be deterministic: traversal order must follow vertex and edge insertion order. Old no-argument signatures are removed from `Graph` and `IGraph`.

## Context

- Impacted files: `src/Graph/Graph.ts`, `src/Graph/interface.ts`
- Depends on issues #2 and #3 being complete — `VertexId`, map-backed vertex storage, and map-backed adjacency must exist
- Adopted from `docs/prd/production-ready-keyed-graph/issue-4-id-based-bfs-and-dfs-traversal.md` (GitHub issue #4)

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

### Task 1: Implement ID-based BFS and DFS

- [x] Rewrite `breadthFirstSearch` to accept `startId: VertexId` and return `VertexId[]` in BFS order
- [x] Rewrite `depthFirstSearch` to accept `startId: VertexId` and return `VertexId[]` in DFS order
- [x] Ensure both methods iterate adjacency maps in insertion order (Maps preserve insertion order — no sort needed)
- [x] Both methods must accept `VertexId` as either string or number
- [x] Write tests: BFS order from a start vertex, DFS order from a start vertex, both with string and number IDs
- [x] Write tests: deterministic order across multiple calls with same graph state
- [x] Run project tests — must pass before next task

### Task 2: Remove old no-argument traversal signatures

- [ ] Remove old `breadthFirstSearch(): number[]` signature from `Graph`
- [ ] Remove old `depthFirstSearch(): number[]` signature from `Graph`
- [ ] Update `IGraph<T>` interface: replace old signatures with `breadthFirstSearch(startId: VertexId): VertexId[]` and `depthFirstSearch(startId: VertexId): VertexId[]`
- [ ] Confirm no other callers reference the old no-argument form
- [ ] Write tests confirming old no-arg call shape no longer compiles or is present
- [ ] Run project tests — must pass before next task

### Task 3: Verify acceptance criteria

- [ ] Verify `breadthFirstSearch(startId)` returns `VertexId[]` in BFS order starting from `startId`
- [ ] Verify `depthFirstSearch(startId)` returns `VertexId[]` in DFS order starting from `startId`
- [ ] Verify traversal order is deterministic (insertion order for vertices and adjacent edges)
- [ ] Verify both methods accept `VertexId` (string or number)
- [ ] Verify old no-argument traversal signatures are absent from `IGraph`
- [ ] Run full project test suite
- [ ] Run project linter — all issues must be fixed
