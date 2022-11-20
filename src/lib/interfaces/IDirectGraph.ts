import { INode } from "./INode";
import { Value } from "./shared";

export interface IGraph {
  vertex: INode,
  length: number,
}

export interface IDirectGraph {
  data: IGraph | null,
  createNode: (value: Value) => INode,
}
