# Map-backed adjacency + edge operations

## Overview

Replace the linked-list-backed `AdjacencyList` with a `Map<VertexId, Map<VertexId, EdgeRecord>>` adjacency structure. `EdgeRecord` is identity-only (`{}`) for now but shaped to accept metadata in future. Implement `addEdge`, `removeEdge`, `getAdjacent`, and `edgeCount` on `Graph` with strict error semantics. Wire `removeVertex` to cascade-remove all incident edges automatically.

## Context

- Impacted files: `src/Graph/Graph.ts`, `src/Graph/AdjacencyList.ts`, `src/Graph/errors.ts`, `src/Graph/interface.ts`, `src/Graph/index.ts`
- Depends on issue #2 (keyed vertex layer) being complete — `VertexId`, `VertexNotFoundError`, and map-backed vertex storage must exist
- Adopted from `docs/prd/production-ready-keyed-graph/issue-3-map-backed-adjacency-and-edge-operations.md` (GitHub issue #3)

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

### Task 1: Add edge error classes and EdgeRecord type

- [x] Add `EdgeAlreadyExistsError` class to `src/Graph/errors.ts`
- [x] Add `EdgeNotFoundError` class to `src/Graph/errors.ts`
- [x] Export both error classes from `src/Graph/index.ts`
- [x] Define `EdgeRecord = {}` type in `src/Graph/interface.ts`
- [x] Write tests asserting both error classes are catchable via `instanceof`
- [x] Run project tests — must pass before next task

### Task 2: Replace AdjacencyList with map-backed adjacency storage

- [x] Replace the `AdjacencyList<T>` field in `Graph` with `Map<VertexId, Map<VertexId, EdgeRecord>>`
- [x] Initialise an empty inner map for each vertex on `addVertex`
- [x] Remove the inner map entry on `removeVertex`
- [x] Remove `AdjacencyList` import and dependency from `Graph.ts`
- [x] Write tests confirming adjacency map is initialised on vertex add
- [x] Run project tests — must pass before next task

### Task 3: Implement edge operations and cascade removal

- [x] Implement `addEdge(sourceId, targetId): void` — throws `VertexNotFoundError` for missing source or target, throws `EdgeAlreadyExistsError` on duplicate
- [x] Implement `removeEdge(sourceId, targetId): void` — throws `EdgeNotFoundError` on missing edge
- [x] Implement `getAdjacent(id: VertexId): VertexId[]` — returns adjacent IDs in edge insertion order
- [x] Implement `get edgeCount(): number`
- [x] Update `removeVertex` to remove all outgoing edges from the deleted vertex's inner map and all incoming edges referencing it from other vertices' inner maps
- [x] Update `IGraph<T>` interface to include `addEdge`, `removeEdge`, `getAdjacent`, and `edgeCount`
- [x] Write tests for all acceptance criteria: addEdge, duplicate rejection, missing vertex rejection, removeEdge, missing edge rejection, getAdjacent order, edgeCount, removeVertex cascade
- [x] Run project tests — must pass before next task

### Task 4: Verify acceptance criteria

- [ ] Verify `addEdge` adds a directed edge from source to target
- [ ] Verify `addEdge` throws `VertexNotFoundError` when source vertex is missing
- [ ] Verify `addEdge` throws `VertexNotFoundError` when target vertex is missing
- [ ] Verify `addEdge` throws `EdgeAlreadyExistsError` on duplicate edge
- [ ] Verify `removeEdge` removes the edge
- [ ] Verify `removeEdge` throws `EdgeNotFoundError` on missing edge
- [ ] Verify `getAdjacent` returns `VertexId[]` in edge insertion order
- [ ] Verify `edgeCount` returns the current number of edges
- [ ] Verify `removeVertex` cascades: removes all incoming and outgoing edges
- [ ] Verify `EdgeAlreadyExistsError` and `EdgeNotFoundError` are exported and catchable via `instanceof`
- [ ] Verify `LinkedList`-backed `AdjacencyList` is no longer used for adjacency storage
- [ ] Run full project test suite
- [ ] Run project linter — all issues must be fixed
