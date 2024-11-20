import { Assert } from "./Assert";
import { ApplicationNotInitializedError } from "./Errors";

import regl from "regl";

export type ApplicationInitOptions = {
  gameId: string;
  locale: string;
  htmlContainerSelector: string;
};

class Renderer {
  #regl: regl.Regl;
  #onRender: (opt: regl.DefaultContext) => void;

  #drawTriangle: regl.DrawCommand<regl.DefaultContext, { color: number[] }>;

  constructor({
    container,
    onRender,
  }: {
    container: HTMLElement;
    onRender: (opt: regl.DefaultContext) => void;
  }) {
    this.#regl = regl({
      container,
    });

    this.#onRender = onRender;

    this.#regl.frame((opt) => {
      this.#regl.clear({
        color: [0, 0, 0, 0],
        depth: 1,
      });

      this.#onRender(opt);
    });

    this.#drawTriangle = this.#regl({
      frag: `
        precision mediump float;

        uniform vec4 color;

        void main() {
          gl_FragColor = color;
        }
      `,

      vert: `
        precision mediump float;
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0, 1);
        }
      `,

      attributes: {
        position: this.#regl.buffer([
          [-2, -2], // no need to flatten nested arrays, regl automatically
          [4, -2], // unrolls them into a typedarray (default Float32)
          [4, 4],
        ]),
      },

      uniforms: {
        color: this.#regl.prop("color"),
      },

      count: 3,
    });
  }

  public drawTriangle(color: number[]) {
    this.#drawTriangle({ color });
  }
}

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
      onRender: this.#onRender,
    });
    this.#gameId = gameId;
    this.#locale = locale;

    this.#hasInitialized = true;
  }

  #onRender = ({ time }: regl.DefaultContext) => {
    this.renderer.drawTriangle([
      Math.cos(time * 1.2),
      Math.sin(time * 0.5),
      Math.cos(time * -0.1),
      1.0,
    ]);
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
