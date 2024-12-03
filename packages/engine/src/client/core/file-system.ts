// @ts-expect-error -- TODO: not sure why this is failing
import * as fs from "@tauri-apps/plugin-fs";

import { Assert } from "../assertion";
import { ApplicationPath } from "./application-path";

export const appBasePaths = ["appData", "userData", "logs"] as const;

export type AppPath = (typeof appBasePaths)[number];

/**
 * The base path is limited due to security reasons.
 *
 * Even not provided, the base path will be set to `userData`.
 */
export type PathOptions = {
  basePath?: AppPath;
};

export type ReadJsonFn = <T extends Record<string, any> = Record<string, any>>(
  path: string,
  options?: PathOptions,
) => Promise<T | undefined>;

export type ReadTextFn = (
  path: string,
  options?: PathOptions,
) => Promise<string | undefined>;

export type WriteJsonFn = <T extends Record<string, any>>(
  path: string,
  data: T,
  options?: PathOptions,
) => Promise<void>;

export type WriteTextFn = (
  path: string,
  data: string,
  options?: PathOptions,
) => Promise<void>;

export type ExistsFn = (
  path: string,
  options?: PathOptions,
) => Promise<boolean>;

export type EnsureDirFn = (
  path: string,
  options?: PathOptions & {
    recursive?: boolean;
  },
) => Promise<void>;

export type FileSystemOptions = {
  readJson: ReadJsonFn;
  readText: ReadTextFn;
  writeJson: WriteJsonFn;
  writeText: WriteTextFn;
  exists: ExistsFn;
  ensureDir: EnsureDirFn;
};

export class FileSystem {
  static #instance: FileSystem | null = null;

  public async initialize() {
    Assert.isNullOrUndefined(
      FileSystem.#instance,
      "FileSystem is already initialized.",
    );

    FileSystem.#instance = this;
  }

  public static get instance(): FileSystem {
    Assert.notNullOrUndefined(
      FileSystem.#instance,
      "FileSystem is not initialized, make sure to call FileSystem.initialize() before using it.",
    );

    return FileSystem.#instance;
  }

  #getPath = (basePath: "appData" | "userData" | "logs" | (string & {})) => {
    if (!basePath || basePath === "") {
      return ApplicationPath.userData;
    }

    const paths: Record<string, string> = {
      appData: ApplicationPath.appData,
      userData: ApplicationPath.userData,
      logs: ApplicationPath.logs,
    };

    return paths[basePath] || ApplicationPath.userData;
  };

  readJson: ReadJsonFn = async (targetPath, options) => {
    const base = this.#getPath(options?.basePath || "userData");

    return JSON.parse(
      await fs.readTextFile(await ApplicationPath.resolve(base, targetPath)),
    );
  };

  readText: ReadTextFn = async (targetPath, options) => {
    const base = this.#getPath(options?.basePath || "userData");

    return fs.readTextFile(await ApplicationPath.resolve(base, targetPath));
  };

  writeJson: WriteJsonFn = async (targetPath, data) => {
    const base = this.#getPath("userData");

    await fs.writeTextFile(
      await ApplicationPath.resolve(base, targetPath),
      JSON.stringify(data),
    );
  };

  writeText: WriteTextFn = async (targetPath, data, options) => {
    const base = this.#getPath(options?.basePath || "userData");

    await fs.writeTextFile(
      await ApplicationPath.resolve(base, targetPath),
      data,
    );
  };

  exists: ExistsFn = async (targetPath, options) => {
    const base = this.#getPath(options?.basePath || "userData");

    return fs.exists(await ApplicationPath.resolve(base, targetPath));
  };

  ensureDir: EnsureDirFn = async (targetPath, options) => {
    const base = this.#getPath(options?.basePath || "userData");

    if (await fs.exists(await ApplicationPath.resolve(base, targetPath))) {
      return;
    }

    await fs.mkdir(await ApplicationPath.resolve(base, targetPath), {
      recursive: options?.recursive || false,
    });
  };
}
