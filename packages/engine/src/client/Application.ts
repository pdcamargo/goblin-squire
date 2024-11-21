import { Assert } from "./Assert";
import { ApplicationNotInitializedError } from "./Errors";

import regl from "regl";
import { Renderer, Sprite } from "./Renderer";

export type ApplicationInitOptions = {
  gameId: string;
  locale: string;
  htmlContainerSelector: string;
};

export type DrawTriangleProps = {
  color: number[];
};

export class Application {
  #hasInitialized = false;
  #renderer: Renderer | null = null;
  #gameId: string | null = null;
  #locale: string | null = null;

  public async init(options: ApplicationInitOptions) {
    Assert.isFalse(
      this.#hasInitialized,
      "Application has already been initialized",
    );

    Assert.notNullOrUndefined(options, "Options are required");
    Assert.notNullOrUndefined(options.gameId, "Game ID is required");
    Assert.notNullOrUndefined(options.locale, "Locale is required");
    Assert.notNullOrUndefined(
      options.htmlContainerSelector,
      "HTML container selector is required",
    );

    const { gameId, locale, htmlContainerSelector } = options;

    console.log("Initializing application");

    const htmlContainer = document.querySelector(htmlContainerSelector);

    Assert.notNull(
      htmlContainer,
      `HTML container with selector '${htmlContainerSelector}' not found`,
    );

    Assert.isOfType(
      htmlContainer,
      (value): value is HTMLElement => value instanceof HTMLElement,
    );

    this.#renderer = new Renderer({
      container: htmlContainer,
      // onRender: this.#onRender,
    });
    this.#gameId = gameId;
    this.#locale = locale;

    this.#hasInitialized = true;

    this.#onRender();
  }

  #sprite: Sprite | null = null;

  #onRender = async () => {
    if (this.#sprite === null) {
      this.#sprite = new Sprite({
        position: [0, 0],
        scale: [1, 1],
        rotation: 0,
        texture: await this.renderer.loadTexture("/dwarve.jpg"),
        pixelPerUnit: 500,
        mouseDetectionEnabled: true,
      });

      this.#sprite.on("mousedown", ({ position }) => {
        console.log("Mouse down", position);
      });

      this.#sprite.on("mouseup", ({ position }) => {
        console.log("Mouse up", position);
      });

      this.#sprite.on("mouseenter", ({ position }) => {
        console.log("Mouse enter", position);
      });

      this.#sprite.on("mouseleave", ({ position }) => {
        console.log("Mouse leave", position);
      });

      this.renderer.addSprite(this.#sprite!);
    }
  };

  public get gameId() {
    Assert.notNullOrUndefined(
      this.#gameId,
      "Game ID is not set, make sure to call `init` first",
    );

    return this.#gameId;
  }

  public get locale() {
    Assert.notNullOrUndefined(
      this.#locale,
      "Locale is not set, make sure to call `init` first",
    );

    return this.#locale;
  }

  public get renderer() {
    Assert.notNullOrUndefined(
      this.#renderer,
      "Renderer is not set, make sure to call `init` first",
    );

    return this.#renderer;
  }

  public async run() {
    if (!this.#hasInitialized) {
      throw new ApplicationNotInitializedError();
    }

    console.log("Running application");
  }
}
