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

      uniform mat4 uProjectionView;
      uniform mat4 uModelMatrix;

      varying vec2 vUV;

      void main() {
        vec4 worldPosition = uModelMatrix * vec4(position, 0.0, 1.0);
        gl_Position = uProjectionView * worldPosition;

        vUV = uv;
      }
    `;
  }

  private generateId(frag: string, vert: string): string {
    return btoa(frag + vert); // Use Base64 encoding to create a unique ID
  }
}
