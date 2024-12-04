import REGL from "regl";
import { Assert } from "../assertion";
import { Camera2d } from "./nodes/camera2d";
import { Scene } from "./scene";
import { BasicMaterial } from "./material";
import { Sprite } from "./nodes/sprite";

export class Renderer {
  static #instance: Renderer | null = null;

  #regl: REGL.Regl | null = null;

  #scopedCommand: REGL.DrawCommand | null = null;

  #basicMaterial: BasicMaterial | null = null;

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

    this.#basicMaterial = new BasicMaterial(this.#regl);

    this.#scopedCommand = this.#regl({
      context: {
        PROJECTION: (context, props) => {
          const camera = (props as any).camera as Camera2d;

          return camera.getProjectionMatrix(
            context.viewportWidth,
            context.viewportHeight,
          );
        },
        VIEW: (_, props) => {
          const camera = (props as any).camera as Camera2d;

          return camera.getViewMatrix();
        },
        TIME: this.#regl.context("time"),
        VIEWPORT: [
          0,
          0,
          this.#regl.context("viewportWidth"),
          this.#regl.context("viewportHeight"),
        ],
      },
      uniforms: {
        PROJECTION: this.#regl.context<any, "PROJECTION">("PROJECTION"),
        VIEW: this.#regl.context<any, "VIEW">("VIEW"),
        TIME: this.#regl.context<any, "TIME">("TIME"),
        VIEWPORT: this.#regl.context<any, "VIEWPORT">("VIEWPORT"),
      },
    });
  }

  public get regl() {
    Assert.notNullOrUndefined(
      this.#regl,
      "Renderer is not initialized, make sure to call Renderer.initialize() before using it.",
    );

    return this.#regl;
  }

  public render(scene: Scene, camera: Camera2d) {
    this.regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });

    const sprites = scene.findAllNodesOfType(Sprite);

    this.#scopedCommand!(
      {
        camera,
      },
      () => {
        this.#basicMaterial!.drawSprites(...sprites);
      },
    );
  }
}
