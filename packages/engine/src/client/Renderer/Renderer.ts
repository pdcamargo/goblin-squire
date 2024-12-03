import { Assert } from "../assertion";

export class Renderer {
  static #instance: Renderer | null = null;

  public static get instance(): Renderer {
    Assert.notNullOrUndefined(
      Renderer.#instance,
      "Renderer is not initialized, make sure to call Renderer.initialize() before using it.",
    );

    return Renderer.#instance;
  }

  public async initialize() {
    Assert.isNullOrUndefined(
      Renderer.#instance,
      "Renderer is already initialized.",
    );

    Renderer.#instance = this;
  }
}
