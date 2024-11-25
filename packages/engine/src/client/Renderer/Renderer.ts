import regl from "regl";
import { Sprite } from "./Sprite";
import { ShaderProgram } from "./ShaderProgram";
import { Container } from "./Container";
import { Camera } from "./Camera";
import { CameraControl } from "./CameraControl";
import { mat4, vec4 } from "gl-matrix";
import { Assert } from "../Assert";
import { GenericCache } from "../Utils";
import { Gizmo } from "./Gizmo";

function generateGridLines(
  gridSpacing: number,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
) {
  const halfWidth = (canvasWidth / 2) * scale;
  const halfHeight = (canvasHeight / 2) * scale;
  const lines = [];

  // Generate vertical lines
  for (let x = -halfWidth; x <= halfWidth; x += gridSpacing) {
    lines.push([x, -halfHeight, 0]);
    lines.push([x, halfHeight, 0]);
  }

  // Generate horizontal lines
  for (let y = -halfHeight; y <= halfHeight; y += gridSpacing) {
    lines.push([-halfWidth, y, 0]);
    lines.push([halfWidth, y, 0]);
  }

  return lines.flat();
}

export class Renderer {
  #htmlContainer: HTMLElement;

  #regl: regl.Regl;
  #rootContainer: Container;
  #camera: Camera;
  #programDrawCommands: Map<string, regl.DrawCommand> = new Map();
  #cameraControl: CameraControl;

  #gizmo: Gizmo | null = null;
  #selectedContainer: Container | null = null;

  #drawLine: regl.DrawCommand;

  #textureCache = new GenericCache<string, regl.Texture2D>();

  #drawGrid: regl.DrawCommand;

  constructor({ container }: { container: HTMLElement }) {
    Assert.isHtmlElement(container, "Container is required");

    this.#regl = regl({ container });

    this.#rootContainer = new Container({ pixelPerUnit: 1 });
    this.#camera = new Camera();

    this.#htmlContainer = container;

    this.#cameraControl = new CameraControl(this.#camera, this.#htmlContainer);

    this.#drawGrid = this.#regl({
      vert: `
        precision mediump float;
        uniform mat4 uProjectionView;
        attribute vec3 position;
    
        void main() {
          gl_Position = uProjectionView * vec4(position, 1.0);
        }
      `,
      frag: `
        precision mediump float;
    
        void main() {
          gl_FragColor = vec4(0.1, 0.1, 0.1, 0.1); // Grid line color
        }
      `,
      attributes: {
        position: () => {
          const scale = 3; // Extend grid to canvas size * 3
          const canvasWidth = this.#regl._gl.canvas.width;
          const canvasHeight = this.#regl._gl.canvas.height;
          return generateGridLines(25, canvasWidth, canvasHeight, scale); // Adjust spacing as needed
        },
      },
      uniforms: {
        uProjectionView: () => {
          const scale = 3; // Extend grid to canvas size * 3
          const canvasWidth = this.#regl._gl.canvas.width;
          const canvasHeight = this.#regl._gl.canvas.height;
          return this.#camera.getProjectionViewMatrix(
            canvasWidth,
            canvasHeight,
          );
        },
      },
      primitive: "lines",
      count: ({ viewportWidth, viewportHeight }) => {
        const scale = 3; // Extend grid to canvas size * 3
        const canvasWidth = this.#regl._gl.canvas.width;
        const canvasHeight = this.#regl._gl.canvas.height;
        return (
          generateGridLines(25, canvasWidth, canvasHeight, scale).length / 3
        );
      },
    });

    container.addEventListener("mousedown", this.#onMouseDown);
    container.addEventListener("mouseup", this.#onMouseUp);
    container.addEventListener("mousemove", this.#onMouseMove);

    this.#regl.frame(() => {
      this.render();
    });

    this.#drawLine = this.#regl({
      vert: `
        precision mediump float;
        attribute vec2 position;
        
        uniform mat4 uProjectionView;

        void main() {
          gl_Position = uProjectionView * vec4(position, 0, 1);
        }
      `,
      frag: `
        precision mediump float;
        uniform vec4 uColor;

        void main() {
          gl_FragColor = uColor;
        }
      `,
      attributes: {
        position: this.#regl.buffer([
          [0, 0],
          [0, 0],
        ]),
      },
      uniforms: {
        uColor: (_, props) => props.color,
        uProjectionView: () =>
          this.#camera.getProjectionViewMatrix(
            this.#regl._gl.canvas.width,
            this.#regl._gl.canvas.height,
          ),
      },
      primitive: "lines",
      count: 2,
    });
  }

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

  public screenToWorld(mouseX: number, mouseY: number): [number, number] {
    Assert.isNumber(mouseX, "mouseX must be a number");
    Assert.isNumber(mouseY, "mouseY must be a number");

    const canvas = this.#regl._gl.canvas;

    Assert.isHtmlElementOfType(
      canvas,
      HTMLCanvasElement,
      "Canvas element not found in the regl context",
    );

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

    return [worldPosition[0], worldPosition[1]];
  }

  public drawLine(start: [number, number], end: [number, number], color: vec4) {
    this.#drawLine({
      position: [start, end],
      color,
    });
  }

  #onMouseDown = (event: MouseEvent) => {
    const worldPosition = this.screenToWorld(event.clientX, event.clientY);

    const handled = this.#gizmo
      ? this.#gizmo.onMouseDown(worldPosition)
      : false;

    if (handled) {
      return;
    }

    this.#rootContainer.handleMouseEvent(
      "mousedown",
      worldPosition,
      event.button,
    );
  };

  #onMouseUp = (event: MouseEvent) => {
    const worldPosition = this.screenToWorld(event.clientX, event.clientY);
    this.#rootContainer.handleMouseEvent(
      "mouseup",
      worldPosition,
      event.button,
    );
  };

  #onMouseMove = (event: MouseEvent) => {
    const worldPosition = this.screenToWorld(event.clientX, event.clientY);

    if (this.#gizmo) {
      this.#gizmo.onMouseMove(worldPosition);

      if (this.#gizmo.isHandlingEvent()) {
        return;
      }
    }

    this.#rootContainer.handleMouseEvent("mousemove", worldPosition);
  };

  public addContainer(container: Container) {
    Assert.notNullOrUndefined(container, "Container is required");

    Assert.isOfType(
      container,
      (c) => c instanceof Container,
      "container does not extend Container base class or is not a Container instance",
    );

    this.#rootContainer.addChild(container);

    if (container instanceof Sprite) {
      // Ensure the ShaderProgram's draw command is registered
      const programId = container.getProgramId();

      if (!this.#programDrawCommands.has(programId)) {
        this.addProgram(container.program);
      }
    }
  }

  public removeContainer(container: Container) {
    Assert.notNullOrUndefined(container, "Container is required");
    Assert.isOfType(
      container,
      (c) => c instanceof Container,
      "container does not extend Container base class or is not a Container instance",
    );

    this.#rootContainer.removeById(container.id);
  }

  public addProgram(program: ShaderProgram) {
    const drawCommand = this.#regl<
      {
        uTime: number;
        uTick: number;
        uProjectionView: mat4;
        uModelMatrix: mat4;
      },
      {
        position: regl.Buffer;
        uv: regl.Buffer;
      },
      {
        uPosition: vec4;
        uScale: vec4;
        uRotation: number;
        texture: regl.Texture2D;
      }
    >({
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
        uModelMatrix: (_, props) => {
          const position = props.uPosition;
          const scale = props.uScale;
          const rotation = props.uRotation;

          Assert.notNullOrUndefined(
            position,
            "uPosition is required for model matrix calculation",
          );

          Assert.notNullOrUndefined(
            scale,
            "uScale is required for model matrix calculation",
          );

          Assert.notNullOrUndefined(
            rotation,
            "uRotation is required for model matrix calculation",
          );

          Assert.isVector2Array(
            position,
            `uPosition must be a vec2 but got ${typeof position} instead`,
          );

          Assert.isVector2Array(
            scale,
            `uScale must be a vec2 but got ${typeof scale} instead`,
          );

          Assert.isNumber(
            rotation,
            `uRotation must be a number but got ${typeof rotation} instead`,
          );

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

  public render = () => {
    this.#drawGrid();

    const groups = this.#groupSpritesByProgram();

    for (const [programId, sprites] of groups) {
      const drawCommand = this.#programDrawCommands.get(programId);

      Assert.notNullOrUndefined(
        drawCommand,
        `Draw command for program ID ${programId} not found`,
      );

      for (const sprite of sprites) {
        if (
          this.#camera.isContainerVisible(
            sprite,
            this.canvasWidth,
            this.canvasHeight,
          )
        ) {
          drawCommand({
            texture: sprite.texture,
            uPosition: sprite.getWorldPosition(),
            uScale: sprite.getWorldScale(),
            uRotation: sprite.getWorldRotation(),
          });
        }
      }
    }

    if (this.#gizmo) {
      this.#gizmo.draw();
    }
  };

  public get canvasWidth() {
    return this.#regl._gl.canvas.width;
  }

  public get canvasHeight() {
    return this.#regl._gl.canvas.height;
  }

  public selectContainer(container: Container | null) {
    this.#selectedContainer = container;

    if (container) {
      this.#gizmo = new Gizmo(this, container);
    } else {
      this.#gizmo = null;
    }
  }

  /**
   * Loads a texture from a URL.
   *
   * If the texture is already loaded, it will return the cached texture.
   *
   * TODO: verify garbage collection of textures (specially around the destroy method, cause what happens if a texture is destroyed but still in use?)
   */
  public async loadTexture(url: string) {
    return new Promise<regl.Texture2D>((resolve, reject) => {
      if (this.#textureCache.get(url)) {
        resolve(this.#textureCache.get(url)!);

        return;
      }

      const image = new Image();

      image.onload = () => {
        const texture = this.#regl.texture(image);

        this.#textureCache.set(url, texture);

        resolve(texture);
      };

      image.onerror = reject;
      image.src = url;
    });
  }
}
