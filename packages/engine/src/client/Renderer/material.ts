import REGL from "regl";
import { Sprite } from "./nodes/sprite";

export abstract class Material {
  #cmd: REGL.DrawCommand;

  constructor(
    public regl: REGL.Regl,
    public uniforms: REGL.Uniforms,
    public attributes: REGL.Attributes,
    public elements: REGL.Elements | REGL.ElementsOptions | REGL.ElementsData,
    public vert: string,
    public frag: string,
  ) {
    this.#cmd = this.regl({
      vert: this.vert,
      frag: this.frag,
      uniforms: {
        ...this.uniforms,
        MODEL: this.regl.prop<any, "model">("model"),
        TEXTURE: this.regl.prop<any, "texture">("texture"),
        RECT: this.regl.prop<any, "rect">("rect"),
        TINT: this.regl.prop<any, "tint">("tint"),
      },
      elements: this.elements,
      attributes: {
        ...this.attributes,
        POSITION: this.regl.buffer([
          [-0.5, -0.5],
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
        ]),
        UV: this.regl.buffer([
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ]),
      },
    });
  }

  public drawSprites(...sprites: Sprite[]) {
    const toDraw = sprites.filter((s) => s.texture);

    this.#cmd(
      toDraw.map((sprite) => ({
        model: sprite.getModelMatrix(),
        rect: sprite.rect.xywh,
        texture: sprite.texture,
        tint: sprite.color.rgba,
      })),
    );
  }
}

export class BasicMaterial extends Material {
  constructor(regl: REGL.Regl) {
    super(
      regl,
      {},
      {},
      regl.elements([
        [0, 1, 2],
        [2, 3, 0],
      ]),
      `
        precision mediump float;

        attribute vec2 POSITION;
        attribute vec2 UV;

        uniform mat4 MODEL;
        uniform mat4 PROJECTION;
        uniform mat4 VIEW;
        uniform vec4 RECT;

        varying vec2 vUv;

        void main() {
          vUv = UV * RECT.zw + RECT.xy;
          gl_Position = PROJECTION * VIEW * MODEL * vec4(POSITION, 0, 1);
        }
      `,
      `
        precision mediump float;

        varying vec2 vUv;

        uniform sampler2D TEXTURE;
        uniform vec4 TINT;

        void main() {
          gl_FragColor = texture2D(TEXTURE, vUv) * TINT;
        }
      `,
    );
  }
}
