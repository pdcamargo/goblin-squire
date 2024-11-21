import regl from "regl";
import { ShaderProgram } from "./ShaderProgram";
import { Container, ContainerProps } from "./Container";

export type SpriteProps = ContainerProps & {
  texture: regl.Texture2D;
  program?: ShaderProgram;
};

export class Sprite extends Container {
  texture: regl.Texture2D;
  program: ShaderProgram;

  constructor({
    position,
    scale,
    rotation,
    texture,
    pixelPerUnit,
    program,
    parent,
    children,
  }: SpriteProps) {
    super({
      position,
      scale,
      rotation,
      pixelPerUnit,
      parent,
      children,
      aspectRatio: texture.width / texture.height,
    });

    this.texture = texture;

    this.program =
      program ||
      new ShaderProgram({
        uniforms: {
          spritePosition: () => this.getWorldPosition(),
          spriteScale: () => this.getWorldScale(),
          spriteRotation: () => this.getWorldRotation(),
          texture: () => this.texture,
        },
      });
  }

  getProgramId = (): string => {
    return this.program.id;
  };
}
