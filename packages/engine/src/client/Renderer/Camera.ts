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

    // Center the camera in the viewport
    const screenCenterOffset = [
      viewportWidth / 2 / this.zoom,
      viewportHeight / 2 / this.zoom,
    ] as const;

    // Apply position and zoom adjustments
    container.position = [
      (-this.position[0] + screenCenterOffset[0]) * this.zoom,
      (-this.position[1] + screenCenterOffset[1]) * this.zoom,
    ];
    container.scale = [this.zoom, this.zoom];
  }
}
