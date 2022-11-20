/* eslint-disable no-undef */
import DirectGraph from "../lib/index";

const graph = new DirectGraph();

const node1 = graph.createNode(1);
const node2 = graph.createNode(2);
const node3 = graph.createNode(3);
const node4 = graph.createNode(4);
const node5 = graph.createNode(5);
const node6 = graph.createNode(6);

node1.link(node2, node3, node4);
node2.link(node5, node6);

node2.update('updated value 1');
node5.update('updated value 2');

console.log('node1: ', node1);
console.log('node2: ', node2);

console.log('graph vertex neighbours: ', graph?.data?.vertex.neighbours);
