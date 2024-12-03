import EventEmitter from "eventemitter3";
import { Renderer } from "../renderer";
import { ApplicationPath } from "./application-path";
import { FileSystem } from "./file-system";
import { Logger } from "../logger";
import { Assert } from "../assertion";
import { WorldDatabase } from "./world-database";
import { Engine } from "./engine";

export class Application extends EventEmitter {
  #initialized = false;

  #engine: Engine;
  #logger: Logger;
  #applicationPath: ApplicationPath;
  #fileSystem: FileSystem;
  #renderer: Renderer;
  #database: WorldDatabase;

  constructor() {
    super();

    this.#logger = new Logger();
    this.#applicationPath = new ApplicationPath();
    this.#fileSystem = new FileSystem();
    this.#renderer = new Renderer();
    this.#database = new WorldDatabase();
    this.#engine = new Engine();
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

    this.#engine.on("fixedUpdate", (delta) => {});
    this.#engine.on("update", (delta) => {});
    this.#engine.on("render", (delta) => {
      this.#renderer.render(delta);
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
