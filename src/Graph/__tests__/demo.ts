import { Graph } from '../Graph';

const tasks = [
  {
    id: '0',
    specification: {
      dependsOn: [],
      id: 'RELOAD_PATIENT_DATA',
    },
  },
  {
    id: '1',
    specification: {
      dependsOn: ['RELOAD_PATIENT_DATA'],
      id: 'RELOAD_MATCHED_TREATMENTS',
    },
  },
  {
    id: '2',
    specification: {
      dependsOn: ['RELOAD_PATIENT_DATA'],
      id: 'RELOAD_COMPLEX_MEASURES',
    },
  },
  {
    id: '3',
    specification: {
      dependsOn: ['RELOAD_MATCHED_TREATMENTS', 'RELOAD_COMPLEX_MEASURES'],
      id: 'RELOAD_MATCHED_BIOMARKERS',
    },
  },
  {
    id: '4',
    specification: {
      dependsOn: ['RELOAD_MATCHED_TREATMENTS', 'RELOAD_COMPLEX_MEASURES'],
      id: 'RELOAD_SIGNALING_BIOMARKERS',
    },
  },
  {
    id: '5',
    specification: {
      dependsOn: ['RELOAD_MATCHED_BIOMARKERS', 'RELOAD_SIGNALING_BIOMARKERS'],
      id: 'RELOAD_MATCHED_NCCN_GUIDELINE',
    },
  },
  {
    id: '6',
    specification: {
      dependsOn: ['RELOAD_MATCHED_NCCN_GUIDELINE'],
      id: 'RELOAD_MATCHED_CONTRAINDICATIONS',
    },
  },
  {
    id: '7',
    specification: {
      dependsOn: ['RELOAD_MATCHED_NCCN_GUIDELINE'],
      id: 'RELOAD_NCCN_CLINICAL_EVIDENCE',
    },
  },
  {
    id: '8',
    specification: {
      dependsOn: ['RELOAD_MATCHED_CONTRAINDICATIONS'],
      id: 'PULL_MATCHED_TREATMENTS',
    },
  },
];

const graph = new Graph<string>(tasks.length);

tasks.forEach((task, i) => {
  graph.addVertex(i, task.specification.id);
});

tasks.forEach((task, i) => {
  const { id } = task.specification;
  const dependent = tasks.filter((el) => el.specification.dependsOn.includes(id));
  dependent.forEach((el) => graph.addEdge(i, +el.id));
});

graph.printGraph();
console.log(graph.mapGraphOver());

console.log(graph.breadthFirstSearch());
console.log(graph.depthFirstSearch());

for (const node of graph.depthFirstTraversal(0)) {
  console.log(node);
}

console.log(graph.findShortestPath(2, 6));
console.log(graph.findMotherVertex());

console.log(graph.removeVertex(2));
console.log(graph.removeEdge(0, 1));
