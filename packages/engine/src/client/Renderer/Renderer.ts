import REGL from "regl";
import { Assert } from "../assertion";
import { Camera2d } from "./nodes/camera2d";
import { Scene } from "./scene";
import { BasicMaterial } from "./material";
import { Sprite } from "./nodes/sprite";
import { GlobalLight2d, PointLight2d } from "./nodes";
import { Color, Mat4 } from "../math";

export class Renderer {
  static #instance: Renderer | null = null;

  #regl: REGL.Regl | null = null;

  #scopedCommand: REGL.DrawCommand | null = null;

  #basicMaterial: BasicMaterial | null = null;

  #emptyTexture: REGL.Texture2D | null = null;

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

    this.#emptyTexture = this.#regl.texture({
      data: new Uint8Array([255, 255, 255, 255]),
      width: 1,
      height: 1,
    });

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

        "GLOBAL_LIGHT_0.intensity": (context, props: any) => {
          return (props as any).globalLights[0].intensity;
        },
        "GLOBAL_LIGHT_0.color": (context, props) => {
          return (props as any).globalLights[0].color;
        },
        "GLOBAL_LIGHT_0.blendMode": (context, props) => {
          return (props as any).globalLights[0].blendMode;
        },
        "GLOBAL_LIGHT_1.intensity": (context, props: any) => {
          return (props as any).globalLights[1].intensity;
        },
        "GLOBAL_LIGHT_1.color": (context, props) => {
          return (props as any).globalLights[1].color;
        },
        "GLOBAL_LIGHT_1.blendMode": (context, props) => {
          return (props as any).globalLights[1].blendMode;
        },

        /**
         * 
         * vec4 color;
          float intensity;
          int blendMode;
          sampler2D texture;
          float textureScale;
          vec2 position;
         */

        "POINT_LIGHT_0.intensity": (context, props: any) => {
          return (props as any).pointLights[0].intensity;
        },
        "POINT_LIGHT_0.color": (context, props: any) => {
          return (props as any).pointLights[0].color;
        },
        "POINT_LIGHT_0.blendMode": (context, props: any) => {
          return (props as any).pointLights[0].blendMode;
        },
        "POINT_LIGHT_0.texture": (context, props: any) => {
          return (props as any).pointLights[0].texture;
        },
        "POINT_LIGHT_0.textureScale": (context, props: any) => {
          return (props as any).pointLights[0].textureScale;
        },
        "POINT_LIGHT_0.position": (context, props: any) => {
          return (props as any).pointLights[0].position;
        },
        "POINT_LIGHT_0.model": (context, props: any) => {
          return (props as any).pointLights[0].model;
        },
        "POINT_LIGHT_1.intensity": (context, props: any) => {
          return (props as any).pointLights[1].intensity;
        },
        "POINT_LIGHT_1.color": (context, props: any) => {
          return (props as any).pointLights[1].color;
        },
        "POINT_LIGHT_1.blendMode": (context, props: any) => {
          return (props as any).pointLights[1].blendMode;
        },
        "POINT_LIGHT_1.texture": (context, props: any) => {
          return (props as any).pointLights[1].texture;
        },
        "POINT_LIGHT_1.textureScale": (context, props: any) => {
          return (props as any).pointLights[1].textureScale;
        },
        "POINT_LIGHT_1.position": (context, props: any) => {
          return (props as any).pointLights[1].position;
        },
        "POINT_LIGHT_1.model": (context, props: any) => {
          return (props as any).pointLights[1].model;
        },
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

    let globalLights = scene.findAllNodesOfType(GlobalLight2d).map((g) => {
      return {
        color: g.color.rgba,
        intensity: g.intensity,
        blendMode: g.blendMode,
      };
    });

    let pointLights = scene
      .findAllNodesOfType(PointLight2d)
      .filter((l) => l.texture)
      .map((l) => {
        return {
          color: l.color.rgba,
          intensity: l.intensity,
          blendMode: l.blendMode,
          texture: l.texture,
          textureScale: l.textureScale,
          position: l.worldPosition.xy,
          model: l.getInverseModelMatrix(),
        };
      });

    if (globalLights.length < 2) {
      globalLights = [
        ...globalLights,
        ...Array(2 - globalLights.length).fill({
          color: Color.WHITE.rgba,
          intensity: 0,
          blendMode: 0,
        }),
      ];
    }

    if (pointLights.length < 2) {
      pointLights = [
        ...pointLights,
        ...Array(2 - pointLights.length).fill({
          color: Color.WHITE.rgba,
          intensity: 0,
          blendMode: 0,
          texture: this.#emptyTexture,
          textureScale: 1,
          position: [0, 0],
          model: Mat4.IDENTITY,
        }),
      ];
    }

    this.#scopedCommand!(
      {
        camera,
        globalLights: globalLights,
        pointLights: pointLights,
      },
      () => {
        this.#basicMaterial!.drawSprites(...sprites);
      },
    );
  }
}
