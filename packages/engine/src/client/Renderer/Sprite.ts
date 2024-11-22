import regl from "regl";
import { ShaderProgram } from "./ShaderProgram";
import { Container, ContainerProps } from "./Container";

export type SpriteProps = Omit<ContainerProps, "aspectRatio"> & {
  texture: regl.Texture2D;
  program?: ShaderProgram;
};

export class Sprite extends Container {
  texture: regl.Texture2D;
  program: ShaderProgram;

  constructor({
    id,
    position,
    scale,
    rotation,
    texture,
    pixelPerUnit,
    program,
    parent,
    children,
    mouseDetectionEnabled,
  }: SpriteProps) {
    super({
      position,
      scale,
      rotation,
      pixelPerUnit,
      parent,
      children,
      aspectRatio: texture.width / texture.height,
      id,
      mouseDetectionEnabled,
    });

    this.texture = texture;

    this.program =
      program ||
      new ShaderProgram({
        uniforms: {
          uPosition: () => this.getWorldPosition(),
          uScale: () => this.getWorldScale(),
          uRotation: () => this.getWorldRotation(),
          texture: () => this.texture,
        },
      });
  }

  getProgramId = (): string => {
    return this.program.id;
  };
}
