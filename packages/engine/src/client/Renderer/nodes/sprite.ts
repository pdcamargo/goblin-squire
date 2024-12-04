import REGL from "regl";
import { Color, Mat4, Vector2, Rect } from "../../math";
import { Node2d } from "../scene";
import { Material } from "../material";
import { Settings } from "../settings";

export class Sprite extends Node2d {
  color: Color = Color.WHITE;
  texture: REGL.Texture2D | null = null;
  material: Material | null = null;

  /**
   * The portion of the texture to display
   */
  rect: Rect = new Rect(0, 0, 1, 1);

  zIndex = 0;

  public override getModelMatrix() {
    if (!this.texture) {
      return Mat4.toModelMatrix(
        this.worldPosition,
        this.worldRotation,
        this.worldScale,
      );
    }

    const { width: textureWidth, height: textureHeight } = this.texture;

    // Calculate the portion size in pixels
    const portionWidth = textureWidth * this.rect.width;
    const portionHeight = textureHeight * this.rect.height;

    // Adjust the scale to the portion size
    const scale = new Vector2(portionWidth, portionHeight).multiply(
      this.worldScale.multiplyScalar(Settings.pixelPerUnit),
    );

    const position = this.worldPosition
      .clone()
      .multiplyScalar(Settings.pixelPerUnit);

    return Mat4.toModelMatrix(position, this.worldRotation, scale);
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      color: this.color.rgba,
      texture: null, // TODO: serialize texture
      material: null, // TODO: serialize material,
      zIndex: this.zIndex,
    };
  }
}
