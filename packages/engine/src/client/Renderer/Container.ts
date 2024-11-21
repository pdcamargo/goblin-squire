const generateV4UUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export type ContainerProps = {
  id?: string;
  position?: [number, number];
  scale?: [number, number];
  rotation?: number;
  pixelPerUnit?: number;
  parent?: Container;
  children?: Container[];
  aspectRatio?: number;
};

/**
 * Container is a base class for all objects that contain multiple child objects.
 *
 * Containers will be used to group objects together so the stage can render them together.
 */
export class Container {
  id: string;

  position: [number, number];
  scale: [number, number];
  rotation: number;
  parent: Container | null = null;
  children: Container[] = [];
  pixelPerUnit: number;

  aspectRatio = 1;

  constructor({
    position,
    scale,
    rotation,
    pixelPerUnit,
    parent,
    children,
    aspectRatio,
    id,
  }: ContainerProps = {}) {
    this.id = id || generateV4UUID();

    this.position = position || [0, 0];
    this.scale = scale || [1, 1];
    this.rotation = rotation || 0;
    this.pixelPerUnit = pixelPerUnit || 100;

    if (parent) {
      parent.addChild(this);
    }

    if (children) {
      children.forEach((child) => this.addChild(child));
    }

    if (aspectRatio) {
      this.aspectRatio = aspectRatio;
    }
  }

  findById = (id: string, recursive = true): Container | null => {
    if (this.id === id) {
      return this;
    }

    for (const child of this.children) {
      if (child.id === id) {
        return child;
      }

      if (recursive) {
        const found = child.findById(id, recursive);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  removeById = (id: string, recursive = true) => {
    const index = this.children.findIndex((child) => child.id === id);
    if (index >= 0) {
      const child = this.children[index]!;

      child.parent = null;

      this.children.splice(index, 1);
      return;
    }

    if (recursive) {
      for (const child of this.children) {
        child.removeById(id, recursive);
      }
    }
  };

  getByType = <T extends Container>(
    type: new (...args: any[]) => T,
    recursive = true,
  ): T | null => {
    if (this instanceof type) {
      return this as T;
    }

    for (const child of this.children) {
      if (child instanceof type) {
        return child as T;
      }

      if (recursive) {
        const found = child.getByType(type, recursive);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  getAllByType = <T extends Container>(
    type: new (...args: any[]) => T,
    recursive = true,
  ): T[] => {
    const found: T[] = [];

    if (this instanceof type) {
      found.push(this as T);
    }

    for (const child of this.children) {
      if (child instanceof type) {
        found.push(child as T);
      }

      if (recursive) {
        const children = child.getAllByType(type, recursive);
        found.push(...children);
      }
    }

    return found;
  };

  addChild = (child: Container) => {
    child.parent = this;
    this.children.push(child);
  };

  removeChild = (child: Container) => {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      child.parent = null;
      this.children.splice(index, 1);
    }
  };

  getWorldPosition = (): [number, number] => {
    if (this.parent) {
      const [parentX, parentY] = this.parent.getWorldPosition();
      const [localX, localY] = this.getLocalPosition();
      return [parentX + localX, parentY + localY];
    }
    return this.getLocalPosition();
  };

  getWorldRotation = (): number => {
    if (this.parent) {
      return this.rotation + this.parent.getWorldRotation();
    }
    return this.rotation;
  };

  getLocalScale = (): [number, number] => {
    return [
      this.scale[0] * this.pixelPerUnit,
      (this.scale[1] * this.pixelPerUnit) / this.aspectRatio,
    ];
  };

  getLocalPosition = (): [number, number] => {
    return [
      this.position[0] * this.pixelPerUnit,
      this.position[1] * this.pixelPerUnit,
    ];
  };

  getWorldScale = (): [number, number] => {
    if (this.parent) {
      const [parentX, parentY] = this.parent.getWorldScale();
      const [localX, localY] = this.getLocalScale();
      return [parentX * localX, parentY * localY];
    }
    return this.getLocalScale();
  };
}
