import { Container, ContainerProps } from "./Container";

type CameraProps = Pick<ContainerProps, "position" | "scale" | "rotation">;

export class Camera extends Container {
  zoom: number;

  constructor({ position, scale, rotation }: CameraProps = {}) {
    super({ position, scale, rotation, pixelPerUnit: 1 });

    this.zoom = 1;
  }

  applyTo(container: Container, resolution: [number, number]) {
    const [viewportWidth, viewportHeight] = resolution;

    // Calculate the camera's screen center in world space
    const screenCenterOffset = [
      viewportWidth / 2 / this.zoom,
      viewportHeight / 2 / this.zoom,
    ] as const;

    // Apply camera position offset and zoom
    container.position = [
      -this.position[0] + screenCenterOffset[0],
      -this.position[1] + screenCenterOffset[1],
    ];

    // Apply zoom uniformly
    container.scale = [this.zoom, this.zoom];
  }
}
