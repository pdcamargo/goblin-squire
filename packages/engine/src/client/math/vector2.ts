export class Vector2 {
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  public add(v: Vector2) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  public addScalar(s: number) {
    return new Vector2(this.x + s, this.y + s);
  }

  public subtract(v: Vector2) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  public subtractScalar(s: number) {
    return new Vector2(this.x - s, this.y - s);
  }

  public multiply(v: Vector2) {
    return new Vector2(this.x * v.x, this.y * v.y);
  }

  public multiplyScalar(s: number) {
    return new Vector2(this.x * s, this.y * s);
  }

  public divide(v: Vector2) {
    return new Vector2(this.x / v.x, this.y / v.y);
  }

  public divideScalar(s: number) {
    return new Vector2(this.x / s, this.y / s);
  }

  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize() {
    const l = this.length();

    if (l === 0) {
      this.set(0, 0);
    }

    this.set(this.x / l, this.y / l);
  }

  public dot(v: Vector2) {
    return this.x * v.x + this.y * v.y;
  }

  public cross(v: Vector2) {
    return this.x * v.y - this.y * v.x;
  }

  public angle(v: Vector2) {
    return Math.acos(this.dot(v) / (this.length() * v.length()));
  }

  public distance(v: Vector2) {
    return this.subtract(v).length();
  }

  public clone() {
    return new Vector2(this.x, this.y);
  }

  public copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;
  }

  public equals(v: Vector2) {
    return this.x === v.x && this.y === v.y;
  }

  public toString() {
    return `(${this.x}, ${this.y})`;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public get normalized() {
    const v = this.clone();

    v.normalize();

    return v;
  }

  public get xy() {
    return [this.x, this.y] as [number, number];
  }

  public get xyz() {
    return [this.x, this.y, 0] as [number, number, number];
  }

  public static get ZERO() {
    return new Vector2(0, 0);
  }

  public static get ONE() {
    return new Vector2(1, 1);
  }

  public static get UP() {
    return new Vector2(0, -1);
  }

  public static get DOWN() {
    return new Vector2(0, 1);
  }

  public static get LEFT() {
    return new Vector2(-1, 0);
  }

  public static get RIGHT() {
    return new Vector2(1, 0);
  }

  public static get HALF() {
    return new Vector2(0.5, 0.5);
  }
}
