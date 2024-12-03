import REGL from "regl";
import { Assert } from "../assertion";
import { Clock } from "./clock";
import EventEmitter from "eventemitter3";

export type EngineEvents = {
  fixedUpdate: (delta: number) => void;
  update: (delta: number) => void;
  render: (delta: number) => void;
};

export class Engine extends EventEmitter<EngineEvents> {
  #regl: REGL.Regl | null = null;
  #clock: Clock;

  static #instance: Engine | null = null;

  constructor() {
    super();

    this.#clock = new Clock();
  }

  public async initialize(container: HTMLElement) {
    Assert.isNullOrUndefined(
      Engine.#instance,
      "Engine is already initialized.",
    );

    Engine.#instance = this;

    this.#regl = REGL({
      container,
    });

    this.#clock.onFixedUpdate = this.#onFixedUpdate.bind(this);
    this.#clock.onUpdate = this.#onUpdate.bind(this);
    this.#clock.onRender = this.#onRender.bind(this);
  }

  #onFixedUpdate(delta: number) {
    this.emit("fixedUpdate", delta);
  }

  #onUpdate(delta: number) {
    this.emit("update", delta);
  }

  #onRender(delta: number) {
    this.emit("render", delta);
  }

  public static get instance() {
    Assert.notNullOrUndefined(
      Engine.#instance,
      "Engine is not initialized, make sure to call Engine.initialize() before using it.",
    );

    return Engine.#instance;
  }

  public get regl() {
    Assert.notNullOrUndefined(this.#regl, "Engine is not initialized.");

    return this.#regl;
  }

  public run() {
    this.regl.frame((context) => {
      this.#clock.tick(context.time);
    });
  }
}
