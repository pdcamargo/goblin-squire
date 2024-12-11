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

        varying vec2 vWorldPos;

        void main() {
          vec4 worldPos = MODEL * vec4(POSITION, 0, 1);
          vWorldPos = worldPos.xy;

          vUv = UV * RECT.zw + RECT.xy;
          gl_Position = PROJECTION * VIEW * MODEL * vec4(POSITION, 0, 1);
        }
      `,
      `
        precision mediump float;

        varying vec2 vUv;
        varying vec2 vWorldPos;

        uniform sampler2D TEXTURE;
        uniform vec4 TINT;

        struct GlobalLight {
          vec4 color;
          float intensity;
          int blendMode;
        };

        struct PointLight {
          vec4 color;
          float intensity;
          int blendMode;
          sampler2D texture;
          float textureScale;
          vec2 position; // should deprecate if necessary
          mat4 model;
        };

        uniform GlobalLight GLOBAL_LIGHT_0;
        uniform GlobalLight GLOBAL_LIGHT_1;

        uniform PointLight POINT_LIGHT_0;
        uniform PointLight POINT_LIGHT_1;

        vec3 applyBlendMode(vec3 color, GlobalLight light) {
          if (light.intensity == 0.0) {
            return color;
          }

          if (light.blendMode == 0) {
            return clamp(color + light.color.rgb * light.intensity, 0.0, 1.0);
          } else if (light.blendMode == 1) {
            return clamp(color - light.color.rgb * light.intensity, 0.0, 1.0);
          } else if (light.blendMode == 2) {
            return clamp(mix(color, light.color.rgb, light.intensity), 0.0, 1.0);
          }

          return color;
        }

        vec3 applyPointLight(vec3 color, PointLight light) {
          if (light.intensity == 0.0) {
            return color;
          }

          // Convert world position into light's local space
          vec4 worldPos = vec4(vWorldPos, 0.0, 1.0);
          vec4 lightLocalPos = light.model * worldPos;
          vec2 lightUV = lightLocalPos.xy * light.textureScale;

          // Sample the light's texture as a mask
          vec4 texel = texture2D(light.texture, lightUV);
          vec3 lightColor = texel.rgb * light.color.rgb;

          // Compute distance in world space (assuming light.position is in world coords)
          float dist = distance(light.position, vWorldPos);
          float intensity = 1.0 - dist / 2.0;

          if (intensity < 0.0) {
            return color;
          }

          if (light.blendMode == 0) {
            return clamp(color + lightColor * intensity, 0.0, 1.0);
          } else if (light.blendMode == 1) {
            return clamp(color - lightColor * intensity, 0.0, 1.0);
          } else if (light.blendMode == 2) {
            return clamp(mix(color, lightColor, intensity), 0.0, 1.0);
          }

          return color;
        }

        void main() {
          vec4 texel = texture2D(TEXTURE, vUv);
          vec4 color = TINT * texel;

          vec3 blendedColor = applyBlendMode(color.rgb, GLOBAL_LIGHT_0);
          blendedColor = applyBlendMode(blendedColor, GLOBAL_LIGHT_1);

          blendedColor = applyPointLight(blendedColor, POINT_LIGHT_0);
          blendedColor = applyPointLight(blendedColor, POINT_LIGHT_1);

          gl_FragColor = vec4(blendedColor, color.a);
        }
      `,
    );
  }
}
