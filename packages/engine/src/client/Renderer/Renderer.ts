import regl from "regl";
import { Sprite } from "./Sprite";
import { ShaderProgram } from "./ShaderProgram";
import { Container } from "./Container";
import { Camera } from "./Camera";
import { CameraControl } from "./CameraControl";

export class Renderer {
  #htmlContainer: HTMLElement;

  #regl: regl.Regl;
  #rootContainer: Container;
  #camera: Camera;
  #programDrawCommands: Map<string, regl.DrawCommand> = new Map();
  #cameraControl: CameraControl;

  constructor({ container }: { container: HTMLElement }) {
    this.#regl = regl({ container });

    this.#rootContainer = new Container({ pixelPerUnit: 1 });
    this.#camera = new Camera();

    this.#regl.frame(() => {
      this.render();
    });

    this.#htmlContainer = container;

    this.#cameraControl = new CameraControl(this.#camera, this.#htmlContainer);

    container.addEventListener("mousedown", this.#onMouseDown);
    container.addEventListener("mouseup", this.#onMouseUp);
    container.addEventListener("mousemove", this.#onMouseMove);
  }

  addSprite(sprite: Sprite) {
    this.#rootContainer.addChild(sprite);

    // Ensure the ShaderProgram's draw command is registered
    const programId = sprite.getProgramId();
    if (!this.#programDrawCommands.has(programId)) {
      this.addProgram(sprite.program);
    }
  }

  addProgram(program: ShaderProgram) {
    const drawCommand = this.#regl({
      frag: program.frag,
      vert: program.vert,
      attributes: {
        position: this.#regl.buffer([
          [-0.5, -0.5],
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
        ]),
        uv: this.#regl.buffer([
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ]),
      },
      elements: this.#regl.elements([
        [0, 1, 2],
        [2, 3, 0],
      ]),
      uniforms: {
        ...program.uniforms,
        uTime: ({ time }) => time,
        uTick: ({ tick }) => tick,
        resolution: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
      },
    });

    this.#programDrawCommands.set(program.id, drawCommand);
  }

  removeSprite(sprite: Sprite) {
    this.#rootContainer.removeById(sprite.id);
  }

  render = () => {
    this.#camera.applyTo(this.#rootContainer, [
      this.#regl._gl.drawingBufferWidth,
      this.#regl._gl.drawingBufferHeight,
    ]);

    const groups = this.#groupSpritesByProgram();

    for (const [programId, sprites] of groups) {
      const drawCommand = this.#programDrawCommands.get(programId);

      for (const sprite of sprites) {
        drawCommand?.({
          texture: sprite.texture,
          spritePosition: sprite.getWorldPosition(),
          spriteScale: sprite.getWorldScale(),
          spriteRotation: sprite.getWorldRotation(),
        });
      }
    }
  };

  #groupSpritesByProgram(): Map<string, Sprite[]> {
    const sprites = this.#rootContainer.getAllByType(Sprite, true);

    const groups = new Map<string, Sprite[]>();

    for (const sprite of sprites) {
      const programId = sprite.getProgramId();
      if (!groups.has(programId)) {
        groups.set(programId, []);
      }
      groups.get(programId)!.push(sprite);
    }

    return groups;
  }

  #screenToWorld(mouseX: number, mouseY: number): [number, number] {
    const canvas = this.#regl._gl.canvas as HTMLCanvasElement;
    const canvasBounds = canvas.getBoundingClientRect();

    const canvasX = mouseX - canvasBounds.left;
    const canvasY = mouseY - canvasBounds.top;

    const viewportWidth = canvas.width;
    const viewportHeight = canvas.height;

    const zoom = this.#camera.zoom;
    const cameraPos = this.#camera.position;

    const rootPos = this.#rootContainer.position;

    const worldX =
      (canvasX - viewportWidth / 2) / zoom - cameraPos[0] + rootPos[0];
    const worldY =
      (viewportHeight / 2 - canvasY) / zoom - cameraPos[1] + rootPos[1];

    return [worldX, worldY];
  }

  #onMouseDown = (event: MouseEvent) => {
    const worldPosition = this.#screenToWorld(event.clientX, event.clientY);

    this.#rootContainer.handleMouseEvent(
      "mousedown",
      worldPosition,
      event.button,
    );
  };

  #onMouseUp = (event: MouseEvent) => {
    const worldPosition = this.#screenToWorld(event.clientX, event.clientY);
    this.#rootContainer.handleMouseEvent(
      "mouseup",
      worldPosition,
      event.button,
    );
  };

  #onMouseMove = (event: MouseEvent) => {
    const worldPosition = this.#screenToWorld(event.clientX, event.clientY);
    this.#rootContainer.handleMouseEvent("mousemove", worldPosition);
  };

  // Helper for loading textures
  public async loadTexture(url: string) {
    return new Promise<regl.Texture2D>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve(this.#regl.texture(image));
      };
      image.onerror = reject;
      image.src = url;
    });
  }
}
