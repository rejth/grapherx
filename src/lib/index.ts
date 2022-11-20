import { v4 as uuid } from 'uuid';
import { IDirectGraph, IGraph, INode, INodeClass, Value } from "./types";

export default class DirectGraph implements IDirectGraph {
  data: IGraph | null;

  constructor() {
    this.data = null;
  }

  public createNode(value: Value): INodeClass {
    let { data } = this;

    const node: INode = {
      uuid: uuid(),
      neighbours: [],
      value,
    };

    if (!data) {
      this.data = { vertex: node, length: 1 };
      data = { vertex: node, length: 1 };
    }

    return class extends DirectGraph {
      constructor() {
        super();
      }

      static uuid: string = node.uuid;
      static value: Value = node.value;
      static neighbours: INode[] = node.neighbours;

      private static getIterator(object: INode[] = []): IterableIterator<INode> {
        return object.values();
      }

      private static addNeighbours(node: INode, neighbours: INode[]): INode {
        node.neighbours = [...node.neighbours, ...neighbours];
        return node;
      }

      private static updateValue(node: INode, value: Value): INode {
        node.value = value;
        return node;
      }

      private static find(uuid: string): INode | undefined {
        if (data?.vertex?.uuid === uuid) return data.vertex;

        const stack = [this.getIterator(data?.vertex?.neighbours)];

        while (stack.length) {
          const iterator = stack.pop();
          if (!iterator) return undefined;

          for (const node of iterator) {
            if (node.uuid === uuid) {
              return node;
            } else {
              stack.push(iterator);
              stack.push(this.getIterator(node.neighbours));
              break;
            }
          }
        }
      }

      public static link(...nodes: INode[]): INode | undefined {
        const node = this.find(this.uuid);
        if (!node) return undefined;

        const updatedNode = this.addNeighbours(node, nodes);
        this.neighbours = updatedNode.neighbours;

        return {
          uuid: this.uuid,
          value: this.value,
          neighbours: this.neighbours,
        };
      }

      public static update(value: Value): INode[] | undefined {
        const node = this.find(this.uuid);
        if (!node) return undefined;

        const updatedNode = this.updateValue(node, value);
        this.value = updatedNode.value;

        return this.neighbours;
      }
    };
  }
}
