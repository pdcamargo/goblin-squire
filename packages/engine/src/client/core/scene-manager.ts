import { Assert } from "../assertion";
import { Camera2d } from "../renderer/nodes/camera2d";
import { Scene } from "../renderer/scene";

export class SceneManager {
  static #instance: SceneManager | null = null;

  #currentScene: Scene | null = null;

  public async initialize(initialScene?: Scene) {
    Assert.isNullOrUndefined(
      SceneManager.#instance,
      "SceneManager is already initialized.",
    );

    SceneManager.#instance = this;

    this.#currentScene = initialScene || null;

    if (!this.#currentScene) {
      const defaultScene = new Scene("Default Scene");

      defaultScene.createNode(Camera2d, "Main Camera");

      this.#currentScene = defaultScene;
    }
  }

  public static get instance(): SceneManager {
    Assert.notNullOrUndefined(
      SceneManager.#instance,
      "SceneManager is not initialized, make sure to call SceneManager.initialize() before using it.",
    );

    return SceneManager.#instance;
  }

  public get currentScene() {
    return this.#currentScene;
  }
}
