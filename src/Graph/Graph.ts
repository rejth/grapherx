import { SimpleQueue } from "../Queue";
import { Stack } from "../Stack";

import { AdjacencyList } from "./AdjacencyList";
import type { GraphSnapshot, IGraph, VertexSnapshot } from "./interface";
import { type TVertex, Vertex } from "./Vertex";

type TraversalStep<T> = {
	vertex: TVertex<T>;
	distance: number;
};

export class Graph<T = unknown> implements IGraph<T> {
	#vertices: TVertex<T>[];
	#adjacencyList: AdjacencyList<T>;

	constructor(verticesCount: number) {
		this.#vertices = new Array(verticesCount);
		this.#adjacencyList = new AdjacencyList<T>();

		for (let i = 0; i < verticesCount; i++) {
			this.#vertices[i] = new Vertex<T>(i);
		}
	}

	#isValidIndex(index: number): boolean {
		return (
			Number.isInteger(index) && index >= 0 && index < this.#vertices.length
		);
	}

	#toSnapshot(vertex: TVertex<T>): VertexSnapshot<T> {
		return {
			index: vertex.index,
			value: vertex.value,
		};
	}

	#getAdjacentVertices(index: number): TVertex<T>[] {
		const vertex = this.#vertices[index];
		if (!vertex) return [];

		return this.#adjacencyList.adjacentTo(vertex);
	}

	#breadthFirstSteps(startIndex: number): TraversalStep<T>[] {
		if (!this.#isValidIndex(startIndex)) return [];

		const queue = new SimpleQueue<TraversalStep<T>>();
		const visited = new Set<string>();
		const traversal: TraversalStep<T>[] = [];
		const startVertex = this.#vertices[startIndex];

		visited.add(startVertex.uuid);
		queue.push({ vertex: startVertex, distance: 0 });

		while (queue.length) {
			const step = queue.shift();
			if (!step) return traversal;

			traversal.push(step);

			for (const adjacent of this.#adjacencyList.adjacentTo(step.vertex)) {
				if (visited.has(adjacent.uuid)) continue;

				visited.add(adjacent.uuid);
				queue.push({ vertex: adjacent, distance: step.distance + 1 });
			}
		}

		return traversal;
	}

	#depthFirstVertices(startVertices: Iterable<TVertex<T>>): TVertex<T>[] {
		const stack = new Stack<IterableIterator<TVertex<T>>>();
		const visited = new Set<string>();
		const traversal: TVertex<T>[] = [];

		stack.push(Array.from(startVertices).values());

		while (stack.length) {
			const iterator = stack.pop();
			if (!iterator) return traversal;

			for (const vertex of iterator) {
				if (visited.has(vertex.uuid)) continue;

				visited.add(vertex.uuid);
				traversal.push(vertex);
				stack.push(iterator);
				stack.push(this.#adjacencyList.adjacentTo(vertex).values());
				break;
			}
		}

		return traversal;
	}

	get size(): number {
		return this.#vertices.length;
	}

	addVertex(index: number, value: T): boolean {
		return this.setVertex(index, value);
	}

	setVertex(index: number, value: T): boolean {
		if (!this.#isValidIndex(index)) return false;
		this.#vertices[index].value = value;
		return true;
	}

	getVertex(index: number): VertexSnapshot<T> | undefined {
		if (!this.#isValidIndex(index)) return undefined;
		return this.#toSnapshot(this.#vertices[index]);
	}

	getAdjacent(index: number): VertexSnapshot<T>[] {
		if (!this.#isValidIndex(index)) return [];
		return this.#getAdjacentVertices(index).map((vertex) =>
			this.#toSnapshot(vertex),
		);
	}

	addEdge(sourceIndex: number, targetIndex: number): boolean {
		if (!this.#isValidIndex(sourceIndex) || !this.#isValidIndex(targetIndex)) {
			return false;
		}
		this.#adjacencyList.connect(
			this.#vertices[sourceIndex],
			this.#vertices[targetIndex],
		);
		return true;
	}

	updateVertex(index: number, newValue: T): VertexSnapshot<T>[] {
		this.setVertex(index, newValue);
		return this.getAdjacent(index);
	}

	breadthFirstSearch(): number[] {
		return this.#breadthFirstSteps(0).map((step) => step.vertex.index);
	}

	depthFirstSearch(): number[] {
		return this.#depthFirstVertices(this.#vertices).map(
			(vertex) => vertex.index,
		);
	}

	detectCycle(): boolean {
		const visited = new Array(this.#vertices.length).fill(false);
		const recNodes = new Array(this.#vertices.length).fill(false);

		const detect = (i: number, visited: boolean[], recNodes: boolean[]) => {
			if (!visited[i]) {
				const node = this.#vertices[i];
				visited[i] = true;
				recNodes[i] = true;

				for (const adjacent of this.#adjacencyList.adjacentTo(node)) {
					const j = adjacent.index;
					if (visited[j] && recNodes[j]) return true;
					if (!visited[j] && detect(j, visited, recNodes)) return true;
				}
			}

			recNodes[i] = false;
			return false;
		};

		for (let index = 0; index < this.#vertices.length; index++) {
			if (detect(index, visited, recNodes)) return true;
		}

		return false;
	}

	*depthFirstTraversal(
		startIndex: number,
	): IterableIterator<VertexSnapshot<T>> {
		if (!this.#isValidIndex(startIndex)) return;

		for (const vertex of this.#depthFirstVertices([
			this.#vertices[startIndex],
		])) {
			yield this.#toSnapshot(vertex);
		}
	}

	/*
    Breadth first search comes to rescue.
    The idea is to use a simple queue to traverse a graph and a depth level counter to store a number of edges we've passed.
    So we traverse the graph in a loop until th queue is empty. On each iteration a node gets pulled off from the queue. Then we iterate over all adjacent nodes of that node.
    Once we have passed all adjacent nodes of the node, we increase the depth level counter.
    On each iteration we check if an adjacent node is equal to the target node.
    If it is, we return the number the depth level, and it is going to be a minimal number of edges from the source node to the target.
    If it is not, we add a new adjacent node gets put on to the queue.
   */
	findShortestPath(sourceIndex: number, targetIndex: number): number {
		const targetStep = this.#breadthFirstSteps(sourceIndex).find(
			(step) => step.vertex.index === targetIndex,
		);

		return targetStep?.distance ?? -1;
	}

	// The mother vertex is one from which all other vertices are reachable.
	// There can be multiple mother vertices, but we need to return the first one.
	findMotherVertex(): VertexSnapshot<T> | undefined {
		for (const vertex of this.#vertices) {
			if (this.#depthFirstVertices([vertex]).length === this.#vertices.length)
				return this.#toSnapshot(vertex);
		}

		return undefined;
	}

	// If there is no repeated sequence of edges and vertices between the source and the destination vertex then the path exists between these two vertices.
	checkPath(sourceIndex: number, targetIndex: number): boolean {
		if (!this.#isValidIndex(sourceIndex)) return false;

		return this.#depthFirstVertices([this.#vertices[sourceIndex]]).some(
			(vertex) => vertex.index === targetIndex,
		);
	}

	removeVertex(index: number): VertexSnapshot<T> | undefined {
		if (!this.#isValidIndex(index)) return undefined;

		const deletedSnapshot = this.#toSnapshot(this.#vertices[index]);
		const deleted = this.#vertices.splice(index, 1);
		const deletedVertex = deleted[0];

		this.#vertices.forEach((node, currentIndex) => {
			node.index = currentIndex;
		});
		this.#adjacencyList.removeReferences(this.#vertices, deletedVertex);

		return deletedSnapshot;
	}

	removeEdge(sourceNodeIndex: number, targetNodeIndex: number): boolean {
		if (
			!this.#isValidIndex(sourceNodeIndex) ||
			!this.#isValidIndex(targetNodeIndex)
		) {
			return false;
		}

		return this.#adjacencyList.disconnect(
			this.#vertices[sourceNodeIndex],
			targetNodeIndex,
		);
	}

	mapGraphOver(): GraphSnapshot<T> {
		return this.#vertices.reduce((acc: GraphSnapshot<T>, vertex) => {
			return acc.set(vertex.index, this.getAdjacent(vertex.index));
		}, new Map());
	}

	// Topological Sort is used to find a linear ordering of elements that have dependencies on each other.
	// A topological ordering is possible only when the graph has no directed cycles, i.e. if the graph is a Directed Acyclic Graph (DAG).
	// If the graph has a cycle, some vertices will have cyclic dependencies which makes it impossible to find a linear ordering among vertices.
	sortTopologically(): number[] {
		if (this.detectCycle()) return [];
		return this.breadthFirstSearch();
	}

	printGraph(): void {
		console.log(">>Adjacency List of the Graph<<");

		this.#vertices.forEach((node, index) => {
			process.stdout.write(
				`|id: ${String(index)}, value: ${String(node.value)}| => `,
			);

			this.#adjacencyList.adjacentTo(node).forEach((adjacent) => {
				process.stdout.write(`[${String(adjacent.value)}] -> `);
			});

			console.log("null");
		});
	}
}
