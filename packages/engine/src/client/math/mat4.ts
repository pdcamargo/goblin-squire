import { mat4 } from "gl-matrix";
import { Vector2 } from "./vector2";

export class Mat4 {
  public static get IDENTITY() {
    return mat4.create();
  }

  public static toModelMatrix(
    position: Vector2,
    rotation: number,
    scale: Vector2,
  ) {
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, position.xyz);

    mat4.rotateZ(modelMatrix, modelMatrix, rotation);

    mat4.scale(modelMatrix, modelMatrix, [scale.x, scale.y, 1]);

    return modelMatrix;
  }

  public static getViewMatrix(position: Vector2) {
    const viewMatrix = mat4.create();

    mat4.translate(viewMatrix, viewMatrix, [-position.x, -position.y, 0]);

    return viewMatrix;
  }

  public static getProjectionViewMatrix(
    width: number,
    height: number,
    position: Vector2,
    zoom: number,
  ) {
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
    mat4.translate(viewMatrix, viewMatrix, position.xyz); // Move the world based on camera position
    mat4.scale(viewMatrix, viewMatrix, [zoom, zoom, 1]); // Apply zoom

    // Combine the projection and view matrices to get the final projectionView matrix
    const projectionViewMatrix = mat4.create();

    mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);

    return projectionViewMatrix;
  }
}
