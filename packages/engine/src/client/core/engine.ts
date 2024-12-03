import REGL from "regl";
import { Assert } from "../assertion";

export class Engine {
  #regl: REGL.Regl | null = null;

  static #instance: Engine | null = null;

  public async initialize(container: HTMLElement) {
    Assert.isNullOrUndefined(
      Engine.#instance,
      "Engine is already initialized.",
    );

    Engine.#instance = this;

    this.#regl = REGL({
      container,
    });
  }

  public static get instance() {
    Assert.notNullOrUndefined(
      Engine.#instance,
      "Engine is not initialized, make sure to call Engine.initialize() before using it.",
    );

    return Engine.#instance;
  }

  public get regl() {
    Assert.notNullOrUndefined(this.#regl, "Engine is not initialized.");

    return this.#regl;
  }

  public run() {}
}
