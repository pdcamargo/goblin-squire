// @ts-expect-error -- TODO: not sure why this is failing
import * as path from "@tauri-apps/api/path";
import { Assert } from "../assertion";

export class ApplicationPath {
  static #instance: ApplicationPath | null = null;

  #userData: string | null = null;
  #appData: string | null = null;
  #logs: string | null = null;

  public static get instance(): ApplicationPath {
    Assert.notNullOrUndefined(
      ApplicationPath.#instance,
      "ApplicationPath is not initialized, make sure to call ApplicationPath.initialize() before using it.",
    );

    return ApplicationPath.#instance;
  }

  public static get userData(): string {
    Assert.notNullOrUndefined(
      ApplicationPath.instance.#userData,
      "ApplicationPath is not initialized, make sure to call ApplicationPath.initialize() before using it.",
    );

    return ApplicationPath.instance.#userData;
  }

  public static get appData(): string {
    Assert.notNullOrUndefined(
      ApplicationPath.instance.#appData,
      "ApplicationPath is not initialized, make sure to call ApplicationPath.initialize() before using it.",
    );

    return ApplicationPath.instance.#appData;
  }

  public static get logs(): string {
    Assert.notNullOrUndefined(
      ApplicationPath.instance.#logs,
      "ApplicationPath is not initialized, make sure to call ApplicationPath.initialize() before using it.",
    );

    return ApplicationPath.instance.#logs;
  }

  public async initialize() {
    Assert.isNullOrUndefined(
      ApplicationPath.#instance,
      "ApplicationPath is already initialized.",
    );

    const userData = await path.resolve(await path.appDataDir(), "Data");
    const appData = await path.resolve(await path.appDataDir());
    const logs = await path.resolve(await path.appLogDir());

    this.#userData = userData;
    this.#appData = appData;
    this.#logs = logs;

    ApplicationPath.#instance = this;
  }

  public static async resolve(...args: string[]): Promise<string> {
    return path.resolve(...args);
  }
}
