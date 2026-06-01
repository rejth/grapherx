import { LinkedList } from "../LinkedList";
import { SimpleQueue } from "../Queue";
import { Stack } from "../Stack";

import type { GraphSnapshot, IGraph, VertexSnapshot } from "./interface";
import { type TVertex, Vertex } from "./Vertex";

export class Graph<T = unknown> implements IGraph<T> {
	#vertices: TVertex<T>[];

	constructor(verticesCount: number) {
		this.#vertices = new Array(verticesCount);

		for (let i = 0; i < verticesCount; i++) {
			this.#vertices[i] = new Vertex<T>(i);
		}
	}

	#getIterator(array: TVertex<T>[] = []): IterableIterator<TVertex<T>> {
		return array.values();
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

		return [...vertex.edges.values];
	}

	#setAdjacentVertices(vertex: TVertex<T>, adjacentVertices: TVertex<T>[]) {
		vertex.edges = new LinkedList<TVertex<T>>();
		adjacentVertices.forEach((adjacent) => {
			vertex.edges.insertLast(adjacent);
		});
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
		this.#vertices[sourceIndex].edges.insertFirst(this.#vertices[targetIndex]);
		return true;
	}

	updateVertex(index: number, newValue: T): VertexSnapshot<T>[] {
		this.setVertex(index, newValue);
		return this.getAdjacent(index);
	}

	breadthFirstSearch(): number[] {
		const queue = new SimpleQueue<TVertex<T>>();
		const visited = new Set<string>();
		const traversal: number[] = [];

		const visitNode = (index: number): void => {
			visited.add(this.#vertices[index].uuid);
			queue.push(this.#vertices[index]);
			traversal.push(index);
		};

		if (!this.#vertices.length) return traversal;

		visitNode(0);

		while (queue.length) {
			const vertex = queue.shift();
			if (!vertex) return traversal;

			for (const adjacent of vertex.edges.values) {
				if (adjacent && !visited.has(adjacent.uuid)) {
					visitNode(adjacent.index);
				}
			}
		}

		return traversal;
	}

	depthFirstSearch(): number[] {
		const stack = new Stack<IterableIterator<TVertex<T>>>();
		const visited = new Set<string>();
		const traversal: number[] = [];

		stack.push(this.#getIterator(this.#vertices));

		while (stack.length) {
			const iterator = stack.pop();
			if (!iterator) return traversal;

			for (const vertex of iterator) {
				if (vertex && !visited.has(vertex.uuid)) {
					visited.add(vertex.uuid);

					const adjacentVertices = Array.from(vertex.edges.values);

					stack.push(iterator);
					stack.push(this.#getIterator(adjacentVertices));
					traversal.push(vertex.index);
					break;
				}
			}
		}

		return traversal;
	}

	detectCycle(): boolean {
		const visited = new Array(this.#vertices.length).fill(false);
		const recNodes = new Array(this.#vertices.length).fill(false);

		const detect = (i: number, visited: boolean[], recNodes: boolean[]) => {
			if (!visited[i]) {
				const node = this.#vertices[i];
				visited[i] = true;
				recNodes[i] = true;

				for (const adjacent of node.edges.values) {
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

	*#depthFirstVertexTraversalGenerator(
		vertex: TVertex<T>,
		visited: Set<string> = new Set(),
	): Generator<TVertex<T>> {
		visited.add(vertex.uuid);
		yield vertex;

		if (!vertex.edges.length) return;

		for (const node of vertex.edges.values) {
			if (!visited.has(node.uuid))
				yield* this.#depthFirstVertexTraversalGenerator(node, visited);
		}
	}

	#depthFirstVertexTraversal(startIndex: number): IterableIterator<TVertex<T>> {
		const startNode = this.#vertices[startIndex];
		const generator = this.#depthFirstVertexTraversalGenerator(startNode);

		return {
			[Symbol.iterator](): IterableIterator<TVertex<T>> {
				return this;
			},
			next(): IteratorResult<TVertex<T>> {
				return generator.next();
			},
		};
	}

	*depthFirstTraversal(
		startIndex: number,
	): IterableIterator<VertexSnapshot<T>> {
		if (!this.#isValidIndex(startIndex)) return;

		for (const vertex of this.#depthFirstVertexTraversal(startIndex)) {
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
		if (!this.#isValidIndex(sourceIndex) || !this.#isValidIndex(targetIndex)) {
			return -1;
		}
		if (sourceIndex === targetIndex) {
			return 0;
		}

		const queue = new SimpleQueue<{ vertex: TVertex<T>; distance: number }>();
		const visited = new Set<string>();
		const sourceNode = this.#vertices[sourceIndex];

		visited.add(sourceNode.uuid);
		queue.push({ vertex: sourceNode, distance: 0 });

		while (queue.length) {
			const item = queue.shift();
			if (!item) return -1;

			for (const adjacent of item.vertex.edges.values) {
				if (adjacent && !visited.has(adjacent.uuid)) {
					visited.add(adjacent.uuid);
					if (adjacent.index === targetIndex) return item.distance + 1;
					queue.push({ vertex: adjacent, distance: item.distance + 1 });
				}
			}
		}

		return -1;
	}

	// The mother vertex is one from which all other vertices are reachable.
	// There can be multiple mother vertices, but we need to return the first one.
	findMotherVertex(): VertexSnapshot<T> | undefined {
		for (const vertex of this.#vertices) {
			const traversal = [...this.#depthFirstVertexTraversal(vertex.index)];
			if (traversal.length === this.#vertices.length)
				return this.#toSnapshot(vertex);
		}

		return undefined;
	}

	// If there is no repeated sequence of edges and vertices between the source and the destination vertex then the path exists between these two vertices.
	checkPath(sourceIndex: number, targetIndex: number): boolean {
		const traversal = [...this.depthFirstTraversal(sourceIndex)];
		return traversal.map((node) => node.index).includes(targetIndex);
	}

	removeVertex(index: number): VertexSnapshot<T> | undefined {
		if (!this.#isValidIndex(index)) return undefined;

		const deletedSnapshot = this.#toSnapshot(this.#vertices[index]);
		const deleted = this.#vertices.splice(index, 1);
		const deletedVertex = deleted[0];

		this.#vertices.forEach((node, currentIndex) => {
			node.index = currentIndex;
			this.#setAdjacentVertices(
				node,
				this.#getAdjacentVertices(currentIndex).filter(
					(adjacent) => adjacent !== deletedVertex,
				),
			);
		});

		return deletedSnapshot;
	}

	removeEdge(sourceNodeIndex: number, targetNodeIndex: number): boolean {
		if (
			!this.#isValidIndex(sourceNodeIndex) ||
			!this.#isValidIndex(targetNodeIndex)
		) {
			return false;
		}

		const sourceVertex = this.#vertices[sourceNodeIndex];
		const adjacentVertices = this.#getAdjacentVertices(sourceNodeIndex);
		const nextAdjacentVertices = adjacentVertices.filter(
			(adjacent) => adjacent.index !== targetNodeIndex,
		);

		if (nextAdjacentVertices.length === adjacentVertices.length) {
			return false;
		}

		this.#setAdjacentVertices(sourceVertex, nextAdjacentVertices);

		return true;
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

			[...node.edges.values].forEach((adjacent) => {
				process.stdout.write(`[${String(adjacent.value)}] -> `);
			});

			console.log("null");
		});
	}
}
