# Public interface switch + index-era removal

## Overview

Finalize the public API surface by rewriting `IGraph` to the production-ready keyed contract, removing all index-era methods and types from `Graph`, removing `LinkedList` from public exports, deleting `AdjacencyList`, and stripping UUID usage from `Vertex`. This is the breaking surface switch that completes slices #2–#5.

## Context

- Impacted files: `src/Graph/interface.ts`, `src/Graph/Graph.ts`, `src/Graph/Vertex.ts`, `src/Graph/AdjacencyList.ts`, `src/Graph/index.ts`, `src/LinkedList/index.ts`, package root `index.ts`
- Depends on issues #3, #4, and #5 being complete — map-backed adjacency, ID-based traversal, and path/topo-sort must all be implemented
- Adopted from `docs/prd/production-ready-keyed-graph/issue-6-public-interface-switch-and-index-era-removal.md` (GitHub issue #6)

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

## Technical Details

The target `IGraph<T>` contract:

```ts
interface IGraph<T> {
  get vertexCount(): number
  get edgeCount(): number
  addVertex(id: VertexId, value: T): void
  updateVertex(id: VertexId, value: T): void
  getVertex(id: VertexId): VertexSnapshot<T> | undefined
  getAdjacent(id: VertexId): VertexId[]
  removeVertex(id: VertexId): void
  addEdge(sourceId: VertexId, targetId: VertexId): void
  removeEdge(sourceId: VertexId, targetId: VertexId): void
  breadthFirstSearch(startId: VertexId): VertexId[]
  depthFirstSearch(startId: VertexId): VertexId[]
  findShortestPath(sourceId: VertexId, targetId: VertexId): VertexId[] | undefined
  detectCycle(): boolean
  topologicalSort(): VertexId[]
}
```

## Implementation Steps

### Task 1: Rewrite IGraph to the keyed contract

- [x] Replace all method signatures in `src/Graph/interface.ts` with the keyed contract above
- [x] Update `VertexSnapshot<T>` to export `id: VertexId` (not `index: number`) in `interface.ts`
- [x] Remove `GraphSnapshot` type if it was part of the old index-era interface
- [x] Ensure `Graph` class still satisfies the new `IGraph<T>` — fix any TypeScript compile errors
- [x] Write tests confirming `VertexSnapshot` has `id` field and no `index` field
- [x] Run project tests — must pass before next task

### Task 2: Remove old index-era methods from Graph

- [x] Remove `size` getter from `Graph` (replaced by `vertexCount`)
- [x] Remove `setVertex` from `Graph` (replaced by `updateVertex`)
- [x] Remove `mapGraphOver` from `Graph`
- [x] Remove `printGraph` from `Graph`
- [x] Remove `findMotherVertex` from `Graph`
- [x] Remove `checkPath` from `Graph`
- [x] Remove `depthFirstTraversal` generator from `Graph`
- [x] Remove `sortTopologically` from `Graph` (already replaced by `topologicalSort` in issue #5)
- [x] Confirm none of these are referenced elsewhere in the codebase
- [x] Write tests confirming the removed methods are absent (or just confirm TypeScript compilation catches any accidental callers)
- [x] Run project tests — must pass before next task

### Task 3: Remove LinkedList exports, AdjacencyList, and UUID from Vertex

- [x] Remove `LinkedList` re-export from `src/LinkedList/index.ts` (or clear the file entirely if it only re-exports)
- [x] Remove `LinkedList` export from the package root `index.ts`
- [x] Remove or stop importing `AdjacencyList` in `Graph.ts`; delete `src/Graph/AdjacencyList.ts` if it is no longer referenced
- [x] Remove `uuid` import and `uuid` field from `src/Graph/Vertex.ts` — `VertexId` is now the canonical identity
- [x] Update any internal code that referenced `vertex.uuid` to use `vertex.id` instead
- [x] Run TypeScript compilation — must pass with no errors
- [x] Write tests confirming `LinkedList` is not exported from the package
- [x] Run project tests — must pass before next task

### Task 4: Verify acceptance criteria

- [x] Verify `IGraph` matches the keyed contract exactly
- [x] Verify `Graph` implements the new `IGraph` without old index-era methods
- [x] Verify `VertexSnapshot<T>` has `id: VertexId`, not `index: number`
- [x] Verify `LinkedList` is not re-exported from the package root or `src/LinkedList/index.ts`
- [x] Verify `AdjacencyList` file is removed or no longer imported
- [x] Verify no UUID imports or usage remain in `Vertex` or `Graph`
- [x] Verify old methods (`sortTopologically`, `printGraph`, `mapGraphOver`, `findMotherVertex`, `checkPath`, `depthFirstTraversal`) are absent from `IGraph` and `Graph`
- [x] Run full project test suite
- [x] Run project linter — all issues must be fixed
