import { mat4 } from "gl-matrix";
import { Container, ContainerProps } from "./Container";

type CameraProps = Pick<ContainerProps, "position" | "scale" | "rotation">;

export class Camera extends Container {
  zoom: number;

  constructor({ position, scale, rotation }: CameraProps = {}) {
    super({ position, scale, rotation, pixelPerUnit: 1 });

    this.zoom = 1;
  }

  public getViewMatrix(): mat4 {
    const view = mat4.create();

    // Translate based on camera position
    mat4.translate(view, view, [-this.position[0], -this.position[1], 0]);

    // Rotate based on camera rotation
    mat4.rotateZ(view, view, -this.rotation);

    // Scale based on zoom
    mat4.scale(view, view, [this.zoom, this.zoom, 1]);

    return view;
  }

  public getProjectionMatrix(canvasWidth: number, canvasHeight: number): mat4 {
    const projection = mat4.create();

    // Orthographic projection
    mat4.ortho(
      projection,
      0,
      canvasWidth,
      canvasHeight,
      0, // Invert Y-axis for screen coordinates
      -1,
      1,
    );

    return projection;
  }

  public getProjectionViewMatrix(width: number, height: number): mat4 {
    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();

    // Adjust the projection matrix for orthographic projection (no perspective)
    mat4.ortho(
      projectionMatrix,
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      -1,
      1,
    );

    // Apply camera zoom and position to the view matrix
    mat4.translate(viewMatrix, viewMatrix, [
      -this.position[0],
      -this.position[1],
      0,
    ]); // Move the world based on camera position
    mat4.scale(viewMatrix, viewMatrix, [this.zoom, this.zoom, 1]); // Apply zoom

    // Combine the projection and view matrices to get the final projectionView matrix
    const projectionViewMatrix = mat4.create();
    mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);

    return projectionViewMatrix;
  }

  public getVisibleBounds(
    canvasWidth: number,
    canvasHeight: number,
  ): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    const halfWidth = canvasWidth / 2 / this.zoom;
    const halfHeight = canvasHeight / 2 / this.zoom;

    const centerX = this.position[0];
    const centerY = this.position[1];

    return {
      minX: centerX - halfWidth,
      maxX: centerX + halfWidth,
      minY: centerY - halfHeight,
      maxY: centerY + halfHeight,
    };
  }

  public isContainerVisible(
    target: Container,
    canvasWidth: number,
    canvasHeight: number,
  ): boolean {
    const cameraBounds = this.getVisibleBounds(canvasWidth, canvasHeight);
    const targetBounds = target.getWorldBounds();

    return !(
      targetBounds.maxX < cameraBounds.minX ||
      targetBounds.minX > cameraBounds.maxX ||
      targetBounds.maxY < cameraBounds.minY ||
      targetBounds.minY > cameraBounds.maxY
    );
  }
}
