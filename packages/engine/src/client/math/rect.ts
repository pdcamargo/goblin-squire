import { Vector2 } from "./vector2";

export class Rect {
  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0,
  ) {}

  public get xywh() {
    return [this.x, this.y, this.width, this.height];
  }

  public get left() {
    return this.x;
  }

  public get top() {
    return this.y;
  }

  public get right() {
    return this.x + this.width;
  }

  public get bottom() {
    return this.y + this.height;
  }

  public get centerX() {
    return this.x + this.width / 2;
  }

  public get centerY() {
    return this.y + this.height / 2;
  }

  public get center() {
    return new Vector2(this.centerX, this.centerY);
  }

  public get size() {
    return new Vector2(this.width, this.height);
  }

  public get aspectRatio() {
    return this.width / this.height;
  }

  public contains(point: Vector2) {
    return (
      point.x >= this.x &&
      point.x <= this.right &&
      point.y >= this.y &&
      point.y <= this.bottom
    );
  }

  public intersects(rect: Rect) {
    return (
      this.x < rect.right &&
      this.right > rect.x &&
      this.y < rect.bottom &&
      this.bottom > rect.y
    );
  }

  public clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  public copy(rect: Rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }

  public equals(rect: Rect) {
    return (
      this.x === rect.x &&
      this.y === rect.y &&
      this.width === rect.width &&
      this.height === rect.height
    );
  }

  public toString() {
    return `Rect(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
  }
}
