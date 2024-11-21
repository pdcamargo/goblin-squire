import regl from "regl";
import { Renderer } from "./Renderer";

export type ShaderProgramOptions = {
  frag?: string;
  vert?: string;
  uniforms?: Record<string, regl.Uniform | ((...args: any[]) => regl.Uniform)>;
};

export class ShaderProgram {
  id: string;
  frag: string;
  vert: string;
  uniforms: Record<string, regl.Uniform | (() => regl.Uniform)>;

  constructor({ frag, vert, uniforms }: ShaderProgramOptions = {}) {
    this.id = this.generateId(frag || "", vert || "");
    this.frag = frag || ShaderProgram.defaultFragmentShader();
    this.vert = vert || ShaderProgram.defaultVertexShader();
    this.uniforms = uniforms || {};
  }

  static defaultFragmentShader(): string {
    return `
      precision mediump float;
      uniform sampler2D texture;
      varying vec2 vUV;

      void main() {
        gl_FragColor = texture2D(texture, vUV);
      }
    `;
  }

  static defaultVertexShader(): string {
    return `
      precision mediump float;
      attribute vec2 position;
      attribute vec2 uv;
      uniform vec2 spritePosition;
      uniform vec2 spriteScale;
      uniform float spriteRotation;
      uniform vec2 resolution;
      varying vec2 vUV;

      void main() {
        float cosA = cos(spriteRotation);
        float sinA = sin(spriteRotation);

        vec2 scaledPosition = (position * spriteScale);
        vec2 rotatedPosition = vec2(
          cosA * scaledPosition.x - sinA * scaledPosition.y,
          sinA * scaledPosition.x + cosA * scaledPosition.y
        );

        vec2 finalPosition = rotatedPosition + spritePosition;

        vec2 normalizedPosition = vec2(
          (finalPosition.x / resolution.x) * 2.0 - 1.0,
          1.0 - (finalPosition.y / resolution.y) * 2.0
        );

        gl_Position = vec4(normalizedPosition, 0, 1);
        vUV = uv;
      }
    `;
  }

  private generateId(frag: string, vert: string): string {
    return btoa(frag + vert); // Use Base64 encoding to create a unique ID
  }
}
