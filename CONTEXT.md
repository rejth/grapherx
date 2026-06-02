# GrapherX

GrapherX is a library for representing and querying directed graphs.

## Language

**Graph**:
A directed collection of vertices connected by edges; it may contain cycles.

**Directed Acyclic Graph**:
A graph state with no cycles.
_Avoid_: DAG as the default graph invariant

**Vertex**:
A graph entity identified by a Vertex ID and carrying a caller-provided value.
_Avoid_: Node

**Vertex ID**:
A caller-provided stable string or number identifier for a vertex.
_Avoid_: Index as caller-facing identity

**Edge**:
A directed identity-only connection from one vertex to another vertex.

**Vertex Snapshot**:
A readonly observation of a vertex's ID and value exposed to callers.
_Avoid_: Vertex internals

## Relationships

- A **Graph** has zero or more **Vertices**
- A **Graph** has zero or more **Edges**
- A **Vertex** has exactly one **Vertex ID**
- An **Edge** connects exactly one source **Vertex** to exactly one target **Vertex**
- A **Vertex Snapshot** describes exactly one **Vertex**
- A **Directed Acyclic Graph** is a **Graph** with no cyclic paths

## Example dialogue

> **Dev:** "When a caller asks for adjacent vertices, should they get the stored **Vertex**?"
> **Domain expert:** "No — callers should get a **Vertex Snapshot** so the **Graph** owns mutation."
>
> **Dev:** "Should callers create **Edges** with array positions?"
> **Domain expert:** "No — callers should use stable **Vertex IDs**. Array positions are storage details."

## Flagged ambiguities

- "node" appears in some method names, but the project term is **Vertex**.
- "DAG" describes a checked graph state, not the default **Graph** invariant.
- "index" is an implementation detail, not the caller-facing identity of a **Vertex**.
