import EventEmitter from "eventemitter3";
import { Renderer } from "../renderer";
import { ApplicationPath } from "./application-path";
import { FileSystem } from "./file-system";
import { Logger } from "../logger";
import { Assert } from "../assertion";
import { WorldDatabase } from "./world-database";
import { Engine } from "./engine";
import { SceneManager } from "./scene-manager";
import { Camera2d } from "../renderer/nodes/camera2d";
import { Sprite } from "../renderer/nodes/sprite";

export class Application extends EventEmitter {
  #initialized = false;

  #engine: Engine;
  #logger: Logger;
  #applicationPath: ApplicationPath;
  #fileSystem: FileSystem;
  #renderer: Renderer;
  #sceneManager: SceneManager;
  #database: WorldDatabase;

  constructor() {
    super();

    this.#logger = new Logger();
    this.#applicationPath = new ApplicationPath();
    this.#fileSystem = new FileSystem();
    this.#renderer = new Renderer();
    this.#database = new WorldDatabase();
    this.#engine = new Engine();
    this.#sceneManager = new SceneManager();
  }

  async #validateWorld(worldId: string) {
    const worldFolderExists = await this.#fileSystem.exists(
      `worlds/${worldId}`,
      {
        basePath: "userData",
      },
    );

    Assert.isTrue(worldFolderExists, "World does not exist.");
  }

  public async initialize({
    worldId,
    container,
  }: {
    worldId: string;
    container: HTMLElement;
  }) {
    await this.#logger.initialize();
    await this.#applicationPath.initialize();
    await this.#fileSystem.initialize();

    await this.#validateWorld(worldId);

    await this.#database.initialize(worldId);

    await this.#engine.initialize(container);

    await this.#renderer.initialize(this.#engine.regl);

    await this.#sceneManager.initialize();

    const ctx = document
      .createElement("canvas")
      .getContext("2d") as CanvasRenderingContext2D;

    ctx.canvas.width = 50;
    ctx.canvas.height = 50;

    ctx.fillStyle = "red";

    ctx.fillRect(0, 0, 50, 50);

    const fakeTexture = this.#renderer.regl.texture(ctx.canvas);

    const scene = this.#sceneManager.currentScene!;

    const sprite = scene.createNode(Sprite, "Fake Sprite");

    sprite.texture = fakeTexture;

    this.#engine.on("fixedUpdate", (delta) => {});
    this.#engine.on("update", (delta) => {});
    this.#engine.on("render", (delta) => {
      this.#renderer.render(this.#sceneManager.currentScene!, Camera2d.main);
    });

    this.#initialized = true;
  }

  public async run() {
    this.#engine.run();
  }

  public get logger() {
    Assert.isTrue(this.#initialized, "Application is not initialized.");

    return this.#logger;
  }

  public get database() {
    Assert.isTrue(this.#initialized, "Application is not initialized.");

    return this.#database;
  }
}
