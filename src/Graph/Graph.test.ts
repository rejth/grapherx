import { Graph } from "./Graph";

describe("Graph", () => {
	it("exposes vertex snapshots without leaking mutable storage", () => {
		const graph = new Graph<string>(2);

		expect(graph.setVertex(0, "source")).toBe(true);
		expect(graph.addVertex(1, "target")).toBe(true);
		expect(graph.addEdge(0, 1)).toBe(true);

		const vertex = graph.getVertex(0);
		const adjacent = graph.getAdjacent(0);

		expect(vertex).toEqual({ index: 0, value: "source" });
		expect(adjacent).toEqual([{ index: 1, value: "target" }]);
		expect(Object.keys(vertex ?? {}).sort()).toEqual(["index", "value"]);
		expect(Object.keys(adjacent[0]).sort()).toEqual(["index", "value"]);
	});

	it("keeps graph mutation behind the Graph interface", () => {
		const graph = new Graph<string>(3);

		graph.setVertex(0, "a");
		graph.setVertex(1, "b");
		graph.setVertex(2, "c");
		graph.addEdge(0, 1);
		graph.addEdge(0, 2);

		expect(graph.removeEdge(0, 1)).toBe(true);
		expect(graph.removeEdge(0, 1)).toBe(false);
		expect(graph.getAdjacent(0)).toEqual([{ index: 2, value: "c" }]);

		expect(graph.removeVertex(1)).toEqual({ index: 1, value: "b" });
		expect(graph.size).toBe(2);
		expect(graph.getAdjacent(0)).toEqual([{ index: 1, value: "c" }]);
	});

	it("removes incoming adjacency when a vertex is removed", () => {
		const graph = new Graph<string>(4);

		graph.setVertex(0, "a");
		graph.setVertex(1, "b");
		graph.setVertex(2, "c");
		graph.setVertex(3, "d");
		graph.addEdge(0, 2);
		graph.addEdge(1, 2);
		graph.addEdge(2, 3);

		expect(graph.removeVertex(2)).toEqual({ index: 2, value: "c" });
		expect(graph.getAdjacent(0)).toEqual([]);
		expect(graph.getAdjacent(1)).toEqual([]);
		expect(graph.getAdjacent(2)).toEqual([]);
	});

	it("returns graph snapshots keyed by vertex index", () => {
		const graph = new Graph<string>(2);

		graph.setVertex(0, "source");
		graph.setVertex(1, "target");
		graph.addEdge(0, 1);

		expect(graph.mapGraphOver()).toEqual(
			new Map([
				[0, [{ index: 1, value: "target" }]],
				[1, []],
			]),
		);
	});

	it("runs graph operations through the public seam", () => {
		const graph = new Graph<string>(3);

		graph.setVertex(0, "a");
		graph.setVertex(1, "b");
		graph.setVertex(2, "c");
		graph.addEdge(0, 1);
		graph.addEdge(1, 2);

		expect([...graph.depthFirstTraversal(0)]).toEqual([
			{ index: 0, value: "a" },
			{ index: 1, value: "b" },
			{ index: 2, value: "c" },
		]);
		expect(graph.findMotherVertex()).toEqual({ index: 0, value: "a" });
		expect(graph.findShortestPath(0, 2)).toBe(2);
		expect(graph.checkPath(0, 2)).toBe(true);
	});

	it("concentrates traversal behavior across graph operations", () => {
		const graph = new Graph<string>(4);

		graph.setVertex(0, "a");
		graph.setVertex(1, "b");
		graph.setVertex(2, "c");
		graph.setVertex(3, "d");
		graph.addEdge(0, 2);
		graph.addEdge(0, 1);
		graph.addEdge(1, 3);
		graph.addEdge(2, 3);

		expect(graph.breadthFirstSearch()).toEqual([0, 1, 2, 3]);
		expect(graph.depthFirstSearch()).toEqual([0, 1, 3, 2]);
		expect([...graph.depthFirstTraversal(0)]).toEqual([
			{ index: 0, value: "a" },
			{ index: 1, value: "b" },
			{ index: 3, value: "d" },
			{ index: 2, value: "c" },
		]);
		expect(graph.findShortestPath(0, 3)).toBe(2);
		expect(graph.checkPath(2, 1)).toBe(false);
	});

	it("returns empty traversal results for invalid or unreachable paths", () => {
		const graph = new Graph(2);

		graph.addEdge(0, 1);

		expect([...graph.depthFirstTraversal(4)]).toEqual([]);
		expect(graph.findShortestPath(1, 0)).toBe(-1);
		expect(graph.findShortestPath(0, 4)).toBe(-1);
		expect(graph.checkPath(4, 0)).toBe(false);
	});

	it("detects directed cycles", () => {
		const graph = new Graph(3);

		graph.addEdge(0, 1);
		graph.addEdge(1, 2);
		graph.addEdge(2, 0);

		expect(graph.detectCycle()).toBe(true);
	});
});
