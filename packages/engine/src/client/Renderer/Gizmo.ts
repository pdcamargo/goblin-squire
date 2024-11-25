import { vec2 } from "gl-matrix";
import { Container } from "./Container";
import { Renderer } from "./Renderer";

export class Gizmo {
  #target: Container;
  #renderer: Renderer;
  #isDragging = false;
  #dragAxis: "x" | "y" | null = null;
  #startMousePosition: [number, number] | null = null;

  constructor(renderer: Renderer, target: Container) {
    this.#renderer = renderer;
    this.#target = target;
  }

  public draw() {
    console.log("Drawing gizmo");

    const position = this.#target.getWorldPosition();
    const size = 1500; // Gizmo size in world units

    // Draw X-axis (red)
    this.#renderer.drawLine(
      position,
      [position[0] + size, position[1]],
      [1, 0, 0, 1], // Red color
    );

    // Draw Y-axis (green)
    this.#renderer.drawLine(
      position,
      [position[0], position[1] + size],
      [0, 1, 0, 1], // Green color
    );
  }

  onMouseDown(mousePosition: [number, number]) {
    const worldPosition = this.#renderer.screenToWorld(
      mousePosition[0],
      mousePosition[1],
    );
    const gizmoPosition = vec2.fromValues(
      this.#target.position[0],
      this.#target.position[1],
    );

    const xDistance = Math.abs(worldPosition[0] - gizmoPosition[0]);
    const yDistance = Math.abs(worldPosition[1] - gizmoPosition[1]);

    const threshold = 10; // Threshold for detecting clicks on axes
    if (xDistance <= threshold) {
      this.#dragAxis = "x";
      this.#isDragging = true;
    } else if (yDistance <= threshold) {
      this.#dragAxis = "y";
      this.#isDragging = true;
    } else {
      this.#isDragging = false;
    }

    this.#startMousePosition = worldPosition;

    if (this.#isDragging) {
      // Prevent other objects from handling this event
      return true;
    }

    return false;
  }

  onMouseMove(mousePosition: [number, number]) {
    if (!this.#isDragging || !this.#dragAxis || !this.#startMousePosition) {
      return;
    }

    const worldPosition = this.#renderer.screenToWorld(
      mousePosition[0],
      mousePosition[1],
    );
    const delta = vec2.sub(
      vec2.create(),
      worldPosition,
      this.#startMousePosition,
    );

    if (this.#dragAxis === "x") {
      this.#target.position[0] += delta[0];
    } else if (this.#dragAxis === "y") {
      this.#target.position[1] += delta[1];
    }

    this.#startMousePosition = worldPosition;
  }

  onMouseUp() {
    this.#isDragging = false;
    this.#dragAxis = null;
    this.#startMousePosition = null;
  }

  public isHandlingEvent(): boolean {
    return this.#isDragging;
  }
}
