import EventEmitter from "eventemitter3";
import { Assert } from "../assertion";

export type LogSeverity = "debug" | "info" | "warn" | "error";

export type LogMessage =
  | string
  | Error
  | Record<string, any>
  | Array<string | Error | Record<string, any>>;

export type LogEntry = {
  timestamp: Date;
  severity: LogSeverity;
  message: LogMessage;
};

export type LoggerEvents = {
  log: [LogEntry, LogEntry[]];
};

export class Logger extends EventEmitter<LoggerEvents> {
  static #instance: Logger | null = null;

  #entries: LogEntry[] = [];

  public static get instance(): Logger {
    Assert.notNullOrUndefined(
      Logger.#instance,
      "Logger is not initialized, make sure to call Logger.initialize() before using it.",
    );

    return Logger.#instance;
  }

  public async initialize() {
    Assert.isNullOrUndefined(
      Logger.#instance,
      "Logger is already initialized.",
    );

    Logger.#instance = this;
  }

  #addEntry(
    severity: LogSeverity,
    message: string | Error | Record<string, any>,
  ) {
    const entry: LogEntry = {
      timestamp: new Date(),
      severity,
      message,
    };

    this.#entries.push(entry);

    this.emit("log", entry, this.#entries);
  }

  public debug(message: LogMessage) {
    this.#addEntry("debug", message);
  }

  public info(message: LogMessage) {
    this.#addEntry("info", message);
  }

  public warn(message: LogMessage) {
    this.#addEntry("warn", message);
  }

  public error(message: LogMessage) {
    this.#addEntry("error", message);
  }

  public static debug(message: LogMessage) {
    Logger.instance.debug(message);
  }

  public static info(message: LogMessage) {
    Logger.instance.info(message);
  }

  public static warn(message: LogMessage) {
    Logger.instance.warn(message);
  }

  public static error(message: LogMessage) {
    Logger.instance.error(message);
  }

  public static get on() {
    return Logger.instance.on.bind(Logger.instance);
  }
}
