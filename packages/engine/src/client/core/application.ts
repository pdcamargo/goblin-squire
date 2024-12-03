import EventEmitter from "eventemitter3";
import { Renderer } from "../renderer";
import { ApplicationPath } from "./application-path";
import { FileSystem } from "./file-system";
import { Logger } from "../logger";
import { Assert } from "../assertion";
import { WorldDatabase } from "./world-database";

export class Application extends EventEmitter {
  #initialized = false;

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

  public async initialize({ worldId }: { worldId: string }) {
    await this.#logger.initialize();
    await this.#applicationPath.initialize();
    await this.#fileSystem.initialize();

    await this.#validateWorld(worldId);

    await this.#database.initialize(worldId);

    await this.#renderer.initialize();

    this.#initialized = true;

    console.log(this);
  }

  public async run() {
    // TODO: initialize loop
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
