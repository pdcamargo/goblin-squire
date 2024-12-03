import { Assert } from "../assertion";

export class Color {
  #r = 0;
  #g = 0;
  #b = 0;
  #a = 1;

  constructor(r = 0, g = 0, b = 0, a = 1) {
    this.#r = r;
    this.#g = g;
    this.#b = b;
    this.#a = a;
  }

  public static get WHITE() {
    return new Color(1, 1, 1, 1);
  }

  public static get BLACK() {
    return new Color(0, 0, 0, 1);
  }

  public static get RED() {
    return new Color(1, 0, 0, 1);
  }

  public static get GREEN() {
    return new Color(0, 1, 0, 1);
  }

  public static get BLUE() {
    return new Color(0, 0, 1, 1);
  }

  public static get CYAN() {
    return new Color(0, 1, 1, 1);
  }

  public static get MAGENTA() {
    return new Color(1, 0, 1, 1);
  }

  public static get YELLOW() {
    return new Color(1, 1, 0, 1);
  }

  public static get GRAY() {
    return new Color(0.5, 0.5, 0.5, 1);
  }

  public static get TRANSPARENT() {
    return new Color(0, 0, 0, 0);
  }

  public get r() {
    return this.#r;
  }

  public set r(value: number) {
    Assert.isWithinRange(value, 0, 1, "Red value must be between 0 and 1");

    this.#r = value;
  }

  public get g() {
    return this.#g;
  }

  public set g(value: number) {
    Assert.isWithinRange(value, 0, 1, "Green value must be between 0 and 1");

    this.#g = value;
  }

  public get b() {
    return this.#b;
  }

  public set b(value: number) {
    Assert.isWithinRange(value, 0, 1, "Blue value must be between 0 and 1");

    this.#b = value;
  }

  public get a() {
    return this.#a;
  }

  public set a(value: number) {
    Assert.isWithinRange(value, 0, 1, "Alpha value must be between 0 and 1");

    this.#a = value;
  }

  public get rgb() {
    return [this.r, this.g, this.b] as const;
  }

  public get rgba() {
    return [this.r, this.g, this.b, this.a] as [number, number, number, number];
  }

  public set(r: number, g: number, b: number, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  public copy(color: Color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
  }

  public equals(color: Color) {
    return (
      this.r === color.r &&
      this.g === color.g &&
      this.b === color.b &&
      this.a === color.a
    );
  }
}
