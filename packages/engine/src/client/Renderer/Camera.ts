import { mat4 } from "gl-matrix";
import { Container, ContainerProps } from "./Container";

type CameraProps = Pick<ContainerProps, "position" | "scale" | "rotation">;

export class Camera extends Container {
  zoom: number;

  constructor({ position, scale, rotation }: CameraProps = {}) {
    super({ position, scale, rotation, pixelPerUnit: 1 });

    this.zoom = 1;
  }

  getViewMatrix(): mat4 {
    const view = mat4.create();

    // Translate based on camera position
    mat4.translate(view, view, [-this.position[0], -this.position[1], 0]);

    // Rotate based on camera rotation
    mat4.rotateZ(view, view, -this.rotation);

    // Scale based on zoom
    mat4.scale(view, view, [this.zoom, this.zoom, 1]);

    return view;
  }

  getProjectionMatrix(canvasWidth: number, canvasHeight: number): mat4 {
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

  getProjectionViewMatrix(width: number, height: number): mat4 {
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
}
