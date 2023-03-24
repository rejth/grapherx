import { Graph } from "../Graph";

const graph = new Graph(5);

graph.addVertex(0, 'A');
graph.addVertex(1, 'B');
graph.addVertex(2, 'C');
graph.addVertex(3, 'D');
graph.addVertex(4, 'E');

graph.addEdge(0, 1);
graph.addEdge(0, 2);
graph.addEdge(0, 4);
graph.addEdge(1, 3);
graph.addEdge(2, 3);

const edgesB = graph.updateVertex(1, 'updated value B');
// console.log('edges B: ', [...edgesB])

const edgesA = graph.updateVertex(0, 'updated value A');
// console.log('edges A: ', [...edgesA])

graph.printGraph();

// const traversalBreadth = graph.breadthFirstSearch();
// console.log('traversalBreadth: ', traversalBreadth);

const traversalDepth = graph.depthFirstSearch();
console.log('traversalDepth: ', traversalDepth);

const iterator = graph.depthFirstTraversal();

for (const value of iterator) {
  console.log('Value of Graph: ', value)
}
