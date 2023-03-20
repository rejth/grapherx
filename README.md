# 🛠 GrapherX

Simple library for work with graphs (directed and undirected).

Graph is based on Adjacency List and provides the features below.

The algorithmic complexity of the operation is on the right.\
`V` - the total number of Vertices.\
`E` - the total number of Edges in the Graph.

Available features with the algorithmic complexity:
- [ ] Add Vertex - `O(1)`
- [ ] Add Edge - `O(1)`
- [ ] Update Vertex and get adjacent Vertices - `O(1)`
- [ ] Remove Vertex - `O(V+E)`
- [ ] Remove Edge - `O(E)`
- [ ] Binary search by Vertex value `O(logn)`
- [ ] Breadth First search
- [ ] Depth First search
- [ ] Detect cycles in Graph
- [ ] Find the shortest path between two Vertices
- [ ] Topological sort (if a graph is directed)

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
