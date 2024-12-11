import REGL from "regl";
import { Color, Mat4, Vector2 } from "../../math";
import { Node2d } from "../scene";
import { Settings } from "../settings";

export enum LightBlendMode {
  ADD,
  SUBTRACT,
  MIX,
}

class Light2d extends Node2d {
  color = Color.WHITE;
  intensity = 1;
  blendMode: LightBlendMode = LightBlendMode.ADD;
}

export class PointLight2d extends Light2d {
  texture: REGL.Texture2D | null = null;
  textureScale = 1;

  public override getModelMatrix() {
    if (!this.texture) {
      return Mat4.toModelMatrix(
        this.worldPosition,
        this.worldRotation,
        this.worldScale,
      );
    }

    const { width: textureWidth, height: textureHeight } = this.texture;

    // Use reciprocal to directly get normalized coords
    const scale = new Vector2(1 / textureWidth, 1 / textureHeight).multiply(
      this.worldScale.multiplyScalar(Settings.pixelPerUnit),
    );

    const position = this.worldPosition
      .clone()
      .multiplyScalar(Settings.pixelPerUnit);

    return Mat4.toModelMatrix(position, this.worldRotation, scale);
  }

  public getInverseModelMatrix() {
    return Mat4.inverseModelMatrix(this.getModelMatrix());
  }
}

export class GlobalLight2d extends Light2d {}
