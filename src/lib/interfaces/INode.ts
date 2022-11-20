import { Value } from './shared';

export interface INode {
  uuid: string,
  value: Value,
  neighbours: INode[],
}

export interface INodeClass extends INode {
  link: (...nodes: INode[]) => INode | undefined,
  update: (value: Value) => INode[] | undefined,
}
