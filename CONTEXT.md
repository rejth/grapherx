# GrapherX

GrapherX is a library for representing and querying directed acyclic graphs.

## Language

**Graph**:
A directed collection of vertices connected by edges.

**Vertex**:
A graph position that may hold a caller-provided value.
_Avoid_: Node

**Edge**:
A directed connection from one vertex to another vertex.

**Vertex Snapshot**:
A readonly observation of a vertex exposed to callers.
_Avoid_: Vertex internals

## Relationships

- A **Graph** has zero or more **Vertices**
- A **Graph** has zero or more **Edges**
- An **Edge** connects exactly one source **Vertex** to exactly one target **Vertex**
- A **Vertex Snapshot** describes exactly one **Vertex**

## Example dialogue

> **Dev:** "When a caller asks for adjacent vertices, should they get the stored **Vertex**?"
> **Domain expert:** "No — callers should get a **Vertex Snapshot** so the **Graph** owns mutation."

## Flagged ambiguities

- "node" appears in some method names, but the project term is **Vertex**.
