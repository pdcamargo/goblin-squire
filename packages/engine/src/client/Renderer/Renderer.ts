import REGL from "regl";
import { Assert } from "../assertion";

export class Renderer {
  static #instance: Renderer | null = null;

  #regl: REGL.Regl | null = null;

  public static get instance(): Renderer {
    Assert.notNullOrUndefined(
      Renderer.#instance,
      "Renderer is not initialized, make sure to call Renderer.initialize() before using it.",
    );

    return Renderer.#instance;
  }

  public async initialize(regl: REGL.Regl) {
    Assert.isNullOrUndefined(
      Renderer.#instance,
      "Renderer is already initialized.",
    );

    Renderer.#instance = this;

    this.#regl = regl;
  }

  public get regl() {
    Assert.notNullOrUndefined(
      this.#regl,
      "Renderer is not initialized, make sure to call Renderer.initialize() before using it.",
    );

    return this.#regl;
  }

  public render(delta: number) {
    // TODO: Implement rendering logic
  }
}
