import { Camera } from "./Camera";

export class CameraControl {
  #camera: Camera;
  #canvas: HTMLElement;
  #dragging = false;
  #lastMousePosition: [number, number] | null = null;

  constructor(camera: Camera, canvas: HTMLElement) {
    this.#camera = camera;
    this.#canvas = canvas;

    this.#addEventListeners();
  }

  #addEventListeners() {
    this.#canvas.addEventListener("mousedown", this.#onMouseDown);
    window.addEventListener("mousemove", this.#onMouseMove);
    window.addEventListener("mouseup", this.#onMouseUp);
    this.#canvas.addEventListener("wheel", this.#onWheel, { passive: false });
  }

  #onMouseDown = (event: MouseEvent) => {
    this.#dragging = true;
    this.#lastMousePosition = [event.clientX, event.clientY];
  };

  #onMouseMove = (event: MouseEvent) => {
    if (!this.#dragging || !this.#lastMousePosition) return;

    const [lastX, lastY] = this.#lastMousePosition;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;

    // Update camera position based on drag offset
    this.#camera.position = [
      this.#camera.position[0] - deltaX / this.#camera.scale[0],
      this.#camera.position[1] - deltaY / this.#camera.scale[1],
    ];

    // Update last mouse position
    this.#lastMousePosition = [event.clientX, event.clientY];
  };

  #onMouseUp = () => {
    this.#dragging = false;
    this.#lastMousePosition = null;
  };

  #onWheel = (event: WheelEvent) => {
    event.preventDefault(); // Prevent default scrolling behavior

    const zoomFactor = 0.1;
    const newZoom = this.#camera.zoom - (event.deltaY * zoomFactor) / 100;

    // Clamp zoom to prevent extreme values
    this.#camera.zoom = Math.max(0.1, Math.min(10, newZoom));
  };

  destroy() {
    this.#canvas.removeEventListener("mousedown", this.#onMouseDown);
    window.removeEventListener("mousemove", this.#onMouseMove);
    window.removeEventListener("mouseup", this.#onMouseUp);
    this.#canvas.removeEventListener("wheel", this.#onWheel);
  }
}
