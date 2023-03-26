# 🛠 GrapherX

Simple library for work with **directed acyclic graphs**.

Graph is based on Adjacency List and provides the features below.

The algorithmic complexity of the operation is on the right.\
`V` - the total number of Vertices.\
`E` - the total number of Edges in the Graph.

Available features with the algorithmic complexity:
- [x] Add Vertex - `O(1)`
- [x] Add Edge - `O(1)`
- [x] Update Vertex and get adjacent Vertices - `O(1)`
- [ ] Remove Vertex - `O(V+E)`
- [ ] Remove Edge - `O(E)`
- [x] Breadth First search
- [x] Depth First search
- [ ] Detect cycles in Graph
- [ ] Find the shortest path between two Vertices
- [ ] Topological sort

## Get Started

Prerequisites:

- Node 16+
- npm 5+
- git latest

To set up the app execute the following commands.

```bash
git clone https://github.com/rejth/grapherx.git
cd grapherx
npm install
```
## Available scripts

##### `npm run build`

Builds the app for production to the `dist` folder.

##### `npm run test`

Run unit tests.

##### `npm run declarations`

Generate types declarations.
