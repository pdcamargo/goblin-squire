import { Assert } from "./Assert";
import { ApplicationNotInitializedError } from "./Errors";

import { Renderer, Sprite } from "./Renderer";
import {
  appBasePaths,
  Database,
  DatabaseOptions,
  FileSystem,
  FileSystemOptions,
} from "./Utils";

export type ApplicationInitOptions = {
  gameId: string;
  locale: string;
  htmlContainerSelector: string;

  paths: {
    userData: string;
    appData: string;
    logs: string;
  };
  fileSystem: FileSystemOptions;
  database: DatabaseOptions;
};

export type DrawTriangleProps = {
  color: number[];
};

export class Application {
  #hasInitialized = false;
  #renderer: Renderer | null = null;
  #gameId: string | null = null;
  #locale: string | null = null;
  #fileSystem: FileSystem | null = null;
  #database: Database | null = null;

  #paths: ApplicationInitOptions["paths"] | null = null;

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

    Assert.notNullOrUndefined(options.paths, "Paths are required");
    Assert.notNullOrUndefined(
      options.paths.userData,
      "User data path is required",
    );
    Assert.notNullOrUndefined(
      options.paths.appData,
      "App data path is required",
    );
    Assert.notNullOrUndefined(options.paths.logs, "Logs path is required");

    Assert.notNullOrUndefined(
      options.fileSystem,
      "File system options are required",
    );

    Assert.notNullOrUndefined(
      options.database,
      "Database options are required",
    );

    const {
      gameId,
      locale,
      htmlContainerSelector,
      paths,
      fileSystem,
      database,
    } = options;

    console.log("Initializing application");

    const htmlContainer = document.querySelector(htmlContainerSelector);

    Assert.notNull(
      htmlContainer,
      `HTML container with selector '${htmlContainerSelector}' not found`,
    );

    Assert.isHtmlElement(htmlContainer);

    this.#renderer = new Renderer({
      container: htmlContainer,
      // onRender: this.#onRender,
    });
    this.#gameId = gameId;
    this.#locale = locale;
    this.#paths = Object.freeze(paths);
    this.#fileSystem = new FileSystem(fileSystem);
    this.#database = new Database(database);

    await Promise.all(
      appBasePaths.map((p) => {
        console.log("Ensuring directory", p);

        return this.fileSystem.ensureDir("", {
          recursive: true,
          basePath: p,
        });
      }),
    );

    // make sure game world directory exists
    const worldFolderExists = await this.fileSystem.exists(`worlds/${gameId}`, {
      basePath: "userData",
    });

    Assert.isTrue(
      worldFolderExists,
      `Game world 'worlds/${gameId}' does not exist, the system cannot continue.`,
    );

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
        pixelPerUnit: 100,
        mouseDetectionEnabled: true,
      });

      this.#sprite.on("mousedown", ({ position }) => {
        console.log("Mouse down", position);
      });

      this.#sprite.on("mouseup", ({ position }) => {
        console.log("Mouse up", position);
      });

      this.#sprite.on("mouseenter", ({ position }) => {
        // console.log("Mouse enter", position);
      });

      this.#sprite.on("mouseleave", ({ position }) => {
        // console.log("Mouse leave", position);
      });

      this.renderer.addContainer(this.#sprite!);

      this.renderer.selectContainer(this.#sprite);
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

  public get paths() {
    Assert.notNullOrUndefined(
      this.#paths,
      "Paths are not set, make sure to call `init` first",
    );

    return this.#paths;
  }

  public get fileSystem() {
    Assert.notNullOrUndefined(
      this.#fileSystem,
      "File system is not set, make sure to call `init` first",
    );

    return this.#fileSystem;
  }

  public get database() {
    Assert.notNullOrUndefined(
      this.#database,
      "Database is not set, make sure to call `init` first",
    );

    return this.#database;
  }

  public async run() {
    if (!this.#hasInitialized) {
      throw new ApplicationNotInitializedError();
    }

    this.renderer.run();

    console.log("Running application");
  }
}
