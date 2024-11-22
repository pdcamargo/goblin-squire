import regl from "regl";
import { ShaderProgram } from "./ShaderProgram";
import { Container, ContainerProps } from "./Container";

export type LineProps = Omit<ContainerProps, "aspectRatio"> & {
  points: Array<[number, number]>;
  color?: [number, number, number];
  thickness?: number;
  program?: ShaderProgram;
};

export class Line extends Container {
  points: Array<[number, number]>;
  color: [number, number, number];
  thickness: number;
  program: ShaderProgram;

  constructor({
    id,
    position,
    scale,
    rotation,
    points,
    color = [1, 1, 1],
    thickness = 1,
    pixelPerUnit,
    program,
    parent,
    children,
    mouseDetectionEnabled,
  }: LineProps) {
    super({
      position,
      scale,
      rotation,
      pixelPerUnit,
      parent,
      children,
      id,
      mouseDetectionEnabled,
    });

    this.points = points;
    this.color = color;
    this.thickness = thickness;

    this.program =
      program ||
      new ShaderProgram({
        uniforms: {
          uColor: () => this.color,
          uPosition: () => this.getWorldPosition(),
          uScale: () => this.getWorldScale(),
          uRotation: () => this.getWorldRotation(),
        },
        vert: `
        precision mediump float;

        attribute vec2 position;

        uniform mat4 uProjectionView;

        void main() {
          gl_Position = uProjectionView * vec4(position, 0.0, 1.0);
        }
      `,
        frag: `
        precision mediump float;

        uniform vec3 uColor;

        void main() {
          gl_FragColor = vec4(uColor, 1.0);
        }
      `,
      });
  }

  getProgramId = (): string => {
    return this.program.id;
  };

  getLineBuffer = (reglInstance: regl.Regl): regl.Buffer => {
    return reglInstance.buffer(this.points);
  };
}
