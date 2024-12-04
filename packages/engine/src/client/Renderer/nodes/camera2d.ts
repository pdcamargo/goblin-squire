import { Node2d, Scene } from "../scene";
import { Mat4 } from "../../math";

export class Camera2d extends Node2d {
  public distance = 100;

  static main: Camera2d;

  constructor(...args: ConstructorParameters<typeof Node2d>) {
    super(...args);

    if (!Camera2d.main) {
      Camera2d.main = this;
    }
  }

  public get zoom() {
    return 1 / this.distance;
  }

  public getProjectionMatrix(width: number, height: number) {
    return Mat4.getProjectionViewMatrix(
      width,
      height,
      this.position,
      this.zoom,
    );
  }

  public getViewMatrix() {
    return Mat4.getViewMatrix(this.position);
  }

  public getVisibleBounds(width: number, height: number) {
    const halfWidth = width / 2 / this.zoom;
    const halfHeight = height / 2 / this.zoom;

    const centerX = this.position.x;
    const centerY = this.position.y;

    return {
      minX: centerX - halfWidth,
      maxX: centerX + halfWidth,
      minY: centerY - halfHeight,
      maxY: centerY + halfHeight,
    };
  }

  public isNode2dVisible(
    target: Node2d,
    width: number,
    height: number,
  ): boolean {
    const cameraBounds = this.getVisibleBounds(width, height);
    const targetBounds = target.getWorldBounds();

    return !(
      targetBounds.maxX < cameraBounds.minX ||
      targetBounds.minX > cameraBounds.maxX ||
      targetBounds.maxY < cameraBounds.minY ||
      targetBounds.minY > cameraBounds.maxY
    );
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      distance: this.distance,
    };
  }

  public static override fromJSON(scene: Scene, json: any) {
    const cam = new Camera2d(scene, json.name, json?.id);

    Node2d.updateNodeFromJSON(cam, json);

    cam.distance = json.distance ?? 50;

    return cam;
  }
}
