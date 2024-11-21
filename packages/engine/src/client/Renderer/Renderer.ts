import regl from "regl";
import { Sprite } from "./Sprite";
import { ShaderProgram } from "./ShaderProgram";
import { Container } from "./Container";
import { Camera } from "./Camera";

export class Renderer {
  #htmlContainer: HTMLElement;

  #regl: regl.Regl;
  #rootContainer: Container;
  #camera: Camera;
  #programDrawCommands: Map<string, regl.DrawCommand> = new Map();

  constructor({ container }: { container: HTMLElement }) {
    this.#regl = regl({ container });

    this.#rootContainer = new Container({ pixelPerUnit: 1 });
    this.#camera = new Camera();

    this.#regl.frame(() => {
      this.render();
    });

    this.#htmlContainer = container;

    window.moveCamera = (x, y) => {
      this.#camera.position = [x, y];
    };

    window.setZoom = (zoom) => {
      this.#camera.zoom = zoom;
    };
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
      this.#htmlContainer.clientWidth,
      this.#htmlContainer.clientHeight,
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
