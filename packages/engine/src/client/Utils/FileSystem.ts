import { Assert } from "../Assert";

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
  #methods: FileSystemOptions;

  static #instance: FileSystem;

  constructor(options: FileSystemOptions) {
    Assert.isNullOrUndefined(
      FileSystem.#instance,
      "FileSystem instance has already been created.",
    );

    this.#methods = Object.freeze(options);

    Assert.isFunction(this.#methods.readJson, "Read JSON method is required.");
    Assert.isFunction(this.#methods.readText, "Read text method is required.");
    Assert.isFunction(
      this.#methods.writeJson,
      "Write JSON method is required.",
    );
    Assert.isFunction(
      this.#methods.writeText,
      "Write text method is required.",
    );
    Assert.isFunction(this.#methods.exists, "Exists method is required.");
    Assert.isFunction(
      this.#methods.ensureDir,
      "Ensure directory method is required.",
    );

    FileSystem.#instance = this;
  }

  public static getInstance(): FileSystem {
    if (!FileSystem.#instance) {
      throw new Error(
        "FileSystem instance has not been created. You are trying to access FileSystem before it was initialized.",
      );
    }

    return FileSystem.#instance;
  }

  #getFinalOptions = (options?: PathOptions): PathOptions => {
    let finalOptions: PathOptions = options || {
      basePath: "userData",
    };

    if (!finalOptions.basePath) {
      finalOptions.basePath = "userData";
    }

    Assert.isEnumValue(finalOptions.basePath, appBasePaths);

    return finalOptions;
  };

  readJson: ReadJsonFn = async (path, options) => {
    return this.#methods.readJson(path, this.#getFinalOptions(options));
  };

  readText: ReadTextFn = async (path, options) => {
    return this.#methods.readText(path, this.#getFinalOptions(options));
  };

  writeJson: WriteJsonFn = async (path, data, options) => {
    return this.#methods.writeJson(path, data, this.#getFinalOptions(options));
  };

  writeText: WriteTextFn = async (path, data, options) => {
    return this.#methods.writeText(path, data, this.#getFinalOptions(options));
  };

  exists: ExistsFn = async (path, options) => {
    return this.#methods.exists(path, this.#getFinalOptions(options));
  };

  ensureDir: EnsureDirFn = async (path, options) => {
    return this.#methods.ensureDir(path, this.#getFinalOptions(options));
  };

  public static readJson = async (path: string, options?: PathOptions) => {
    return FileSystem.getInstance().readJson(path, options);
  };

  public static readText = async (path: string, options?: PathOptions) => {
    return FileSystem.getInstance().readText(path, options);
  };

  public static writeJson = async <T extends Record<string, any>>(
    path: string,
    data: T,
    options?: PathOptions,
  ) => {
    return FileSystem.getInstance().writeJson(path, data, options);
  };

  public static writeText = async (
    path: string,
    data: string,
    options?: PathOptions,
  ) => {
    return FileSystem.getInstance().writeText(path, data, options);
  };

  public static exists = async (path: string, options?: PathOptions) => {
    return FileSystem.getInstance().exists(path, options);
  };

  public static ensureDir = async (
    path: string,
    options?: PathOptions & { recursive?: boolean },
  ) => {
    return FileSystem.getInstance().ensureDir(path, options);
  };
}
