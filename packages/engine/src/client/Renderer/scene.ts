import EventEmitter from "eventemitter3";
import { Mat4, Vector2 } from "../math";
import { Assert } from "../assertion";

export type Node2dEvents = EventEmitter.ValidEventTypes & {
  nameChanged: (name: string) => void;
  childrenChanged: () => void;
};

export class Node2d<
  EventTypes extends Record<string, any> = any,
  Context extends unknown = any,
> extends EventEmitter<EventTypes & Node2dEvents, Context> {
  id: string;
  #name: string;

  #parentId: string | null = null;
  #childrenIds: string[] = [];

  #scene: Scene;

  position: Vector2 = Vector2.ZERO;
  rotation: number = 0;
  scale: Vector2 = Vector2.ONE;

  visible: boolean = true;

  constructor(scene: Scene, name: string, id?: string) {
    super();

    this.#name = name;
    this.id = id || Math.random().toString(36).substring(2, 9);

    this.#scene = scene;
  }

  public get name() {
    return this.#name;
  }

  public set name(value: string) {
    this.#name = value;

    // @ts-expect-error -- type is very bad if it's not from an inherited class
    this.emit("nameChanged", value);
  }

  public addChild(child: Node2d) {
    child.#parentId = this.id;

    this.#childrenIds.push(child.id);

    // @ts-expect-error -- type is very bad if it's not from an inherited class
    this.emit("childrenChanged");
  }

  public removeChild(child: Node2d) {
    this.#childrenIds = this.#childrenIds.filter((id) => id !== child.id);

    child.#parentId = null;

    // @ts-expect-error -- type is very bad if it's not from an inherited class
    this.emit("childrenChanged");
  }

  public start() {}

  public update(delta: number) {}

  public fixedUpdate(delta: number) {}

  public draw(delta: number) {}

  protected get scene() {
    Assert.notNullOrUndefined(this.#scene, "Node must be attached to a scene");

    return this.#scene;
  }

  public get parentId() {
    return this.#parentId;
  }

  public get childrenIds() {
    return this.#childrenIds;
  }

  public set childrenIds(value: string[]) {
    this.#childrenIds = value;
  }

  public get children() {
    return this.#childrenIds.map((id) => {
      const child = this.scene.getNodeById(id);

      Assert.notNullOrUndefined(child, `Child with ID "${id}" not found`);

      return child;
    });
  }

  public get parent(): Node2d | null {
    if (this.#parentId) {
      const parent = this.scene.getNodeById(this.#parentId);

      Assert.notNullOrUndefined(
        parent,
        `Parent with ID "${this.#parentId}" not found`,
      );

      return parent;
    }

    return null;
  }

  public set parent(parent: Node2d | string | null) {
    if (parent === null) {
      this.#parentId = null;
      return;
    }

    if (typeof parent === "string") {
      this.#parentId = parent;
      return;
    }

    this.#parentId = parent.id;
  }

  public getModelMatrix() {
    return Mat4.toModelMatrix(
      this.worldPosition,
      this.worldRotation,
      this.worldScale,
    );
  }

  public isVisible(): boolean {
    if (this.parent) {
      return this.visible && this.parent.isVisible();
    }

    return this.visible;
  }

  public get worldPosition(): Vector2 {
    if (this.#parentId) {
      const parent = this.parent;

      return parent?.worldPosition.add(this.position) || this.position.clone();
    }

    return this.position.clone();
  }

  public get worldScale(): Vector2 {
    if (this.#parentId) {
      const parent = this.parent;

      return parent?.worldScale.multiply(this.scale) || this.scale.clone();
    }

    return this.scale.clone();
  }

  public get worldRotation(): number {
    if (this.#parentId) {
      const parent = this.parent;

      return (parent?.worldRotation || 0) + this.rotation || this.rotation;
    }

    return this.rotation;
  }

  public findChildOfType<T extends Node2d>(
    type: new (...args: any[]) => T,
    directDescendantsOnly = true,
  ): T | undefined {
    return this.scene.findChildOfType(this, type, directDescendantsOnly);
  }

  public findAllChildrenOfType<T extends Node2d>(
    type: new (...args: any[]) => T,
    directDescendantsOnly = true,
  ): T[] {
    return this.scene.findAllChildrenOfType(this, type, directDescendantsOnly);
  }

  public getWorldBounds(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    const [worldX, worldY] = this.worldPosition.xy;
    const [scaleX, scaleY] = this.worldScale.xy;

    const halfWidth = scaleX / 2;
    const halfHeight = scaleY / 2;

    return {
      minX: worldX - halfWidth,
      maxX: worldX + halfWidth,
      minY: worldY - halfHeight,
      maxY: worldY + halfHeight,
    };
  }

  public toJSON() {
    return {
      __type: "Node2d",
      id: this.id,
      name: this.#name,
      parentId: this.#parentId,
      childrenIds: this.#childrenIds,
      position: this.position.xy,
      rotation: this.rotation,
      scale: this.scale.xy,
      visible: this.visible,
    };
  }

  public static updateNodeFromJSON(node: Node2d, json: any) {
    node.name = json.name;
    node.parent = json.parentId;
    node.childrenIds = json.childrenIds;
    node.position.set(json.position[0], json.position[1]);
    node.rotation = json.rotation;
    node.scale.set(json.scale[0], json.scale[1]);
    node.visible = json.visible;
  }

  public static fromJSON(scene: Scene, json: any) {
    if (json.__type !== "Node2d") {
      console.warn(
        `Node type "${json.__type}" does not match expected type "Node2d", which means that the class didn't implement the static "fromJSON" method. Defaulting to Node2d class.`,
      );
    }

    const node = new Node2d(scene, json.name, json.id);

    Node2d.updateNodeFromJSON(node, json);

    return node;
  }
}

export type SceneEvents = {
  nodeAdded: (node: Node2d) => void;
  nodeRemoved: (node: Node2d) => void;
};

export class Scene extends EventEmitter<SceneEvents> {
  #nodes: Map<string, Node2d>;

  constructor(
    public name: string,
    public id: string = Math.random().toString(36).substring(2, 9),
  ) {
    super();

    this.#nodes = new Map();
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      nodes: Array.from(this.#nodes.values()).map((node) => node.toJSON()),
    };
  }

  public get rootNodes() {
    return this.findAllNodes((node) => node.parentId === null);
  }

  public createNode<T extends Node2d>(
    type: new (scene: Scene, name: string, id?: string) => T,
    name: string,
    id?: string,
    parent?: Node2d<any, any>,
  ): T {
    const node = new type(this, name, id);

    this.addNode(node);

    if (parent) {
      parent.addChild(node);
    }

    return node as T;
  }

  public addNode(node: Node2d) {
    if (this.#nodes.has(node.id)) {
      throw new Error(`Node with ID "${node.id}" already exists in the scene.`);
    }

    this.#nodes.set(node.id, node);

    this.emit("nodeAdded", node);
  }

  public removeNode(node: Node2d) {
    // Remove from flat list
    this.#nodes.delete(node.id);

    this.emit("nodeRemoved", node);

    // If the node has a parent, remove it from the parent's child list
    if (node.parentId) {
      const parent = this.#nodes.get(node.parentId);
      parent?.removeChild(node);
    }
  }

  public getNodeById(id: string): Node2d | undefined {
    return this.#nodes.get(id);
  }

  public traverse(callback: (node: Node2d) => void) {
    // Start traversal from all nodes without a parent (top-level nodes)
    this.#nodes.forEach((node) => {
      if (node.parentId === null) {
        this.#traverseFrom(node, callback);
      }
    });
  }

  public findNode(predicate: (node: Node2d) => boolean): Node2d | undefined {
    for (const node of this.#nodes.values()) {
      if (predicate(node)) {
        return node;
      }
    }

    return undefined;
  }

  public findAllNodes(predicate: (node: Node2d) => boolean): Node2d[] {
    const nodes: Node2d[] = [];

    for (const node of this.#nodes.values()) {
      if (predicate(node)) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  public findNodeOfType<T extends Node2d>(
    type: new (...args: any[]) => T,
  ): T | undefined {
    return this.findNode((node) => node instanceof type) as T;
  }

  public findAllNodesOfType<T extends Node2d>(
    type: new (...args: any[]) => T,
  ): T[] {
    return this.findAllNodes((node) => node instanceof type) as T[];
  }

  public findChildOfType<T extends Node2d>(
    parent: Node2d<any, any>,
    type: new (...args: any[]) => T,
    directDescendantsOnly = true,
  ): T | undefined {
    const children = parent.children;

    for (const child of children) {
      if (child instanceof type) {
        return child as T;
      }

      if (!directDescendantsOnly) {
        const found = this.findChildOfType(child, type, false);

        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  public findAllChildrenOfType<T extends Node2d>(
    parent: Node2d<any, any>,
    type: new (...args: any[]) => T,
    directDescendantsOnly = true,
  ): T[] {
    const children = parent.children;
    const nodes: T[] = [];

    for (const child of children) {
      if (child instanceof type) {
        nodes.push(child as T);
      }

      if (!directDescendantsOnly) {
        const found = this.findAllChildrenOfType(child, type, false);

        nodes.push(...found);
      }
    }

    return nodes;
  }

  #traverseFrom(node: Node2d, callback: (node: Node2d) => void) {
    callback(node);

    node.childrenIds.forEach((childId) => {
      const child = this.#nodes.get(childId);
      if (child) {
        this.#traverseFrom(child, callback);
      }
    });
  }
}
