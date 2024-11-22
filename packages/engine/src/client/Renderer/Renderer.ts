import regl from "regl";
import { Sprite } from "./Sprite";
import { ShaderProgram } from "./ShaderProgram";
import { Container } from "./Container";
import { Camera } from "./Camera";
import { CameraControl } from "./CameraControl";
import { mat4, vec4 } from "gl-matrix";

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
        uProjectionView: () =>
          this.#camera.getProjectionViewMatrix(
            this.#regl._gl.canvas.width,
            this.#regl._gl.canvas.height,
          ),
        modelMatrix: (context, props: any) => {
          const position = props.uPosition;
          const scale = props.uScale;
          const rotation = props.uRotation;

          const modelMatrix = mat4.create();

          mat4.translate(modelMatrix, modelMatrix, [
            position[0],
            position[1],
            0,
          ]);

          mat4.rotateZ(modelMatrix, modelMatrix, rotation);

          mat4.scale(modelMatrix, modelMatrix, [scale[0], scale[1], 1]);

          return modelMatrix;
        },
      },
    });

    this.#programDrawCommands.set(program.id, drawCommand);
  }

  removeSprite(sprite: Sprite) {
    this.#rootContainer.removeById(sprite.id);
  }

  render = () => {
    const groups = this.#groupSpritesByProgram();

    for (const [programId, sprites] of groups) {
      const drawCommand = this.#programDrawCommands.get(programId);

      for (const sprite of sprites) {
        drawCommand?.({
          texture: sprite.texture,
          uPosition: sprite.getWorldPosition(),
          uScale: sprite.getWorldScale(),
          uRotation: sprite.getWorldRotation(),
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

    // Convert to normalized device coordinates (NDC)
    const ndcX = (canvasX / canvasBounds.width) * 2 - 1;
    const ndcY = 1 - (canvasY / canvasBounds.height) * 2;

    // Create a vec4 for the NDC position
    const ndcPosition = vec4.fromValues(ndcX, ndcY, 0, 1);

    // Get the inverse of the projection-view matrix
    const projectionViewMatrix = this.#camera.getProjectionViewMatrix(
      canvas.width,
      canvas.height,
    );
    const inverseProjectionView = mat4.invert(
      mat4.create(),
      projectionViewMatrix,
    );
    if (!inverseProjectionView) {
      throw new Error("Failed to invert projection-view matrix");
    }

    // Transform NDC back to world space
    const worldPosition = vec4.transformMat4(
      vec4.create(),
      ndcPosition,
      inverseProjectionView,
    );

    // Return the x, y world coordinates
    return [worldPosition[0], worldPosition[1]];
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
