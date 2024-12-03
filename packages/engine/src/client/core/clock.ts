import { Assert } from "../assertion";

export class Clock {
  #accumulator: number = 0;
  #fixedDelta: number;
  #lastTime: number | null = null;
  #deltaTime: number = 0;

  #frameCount: number = 0; // Tracks the number of frames since last FPS calculation
  #elapsedTime: number = 0; // Tracks the total time since last FPS calculation
  #fps: number = 0; // Stores the calculated FPS

  onFixedUpdate?: (delta: number) => void;
  onUpdate?: (delta: number) => void;
  onRender?: (delta: number) => void;

  static #instance: Clock | null = null;

  constructor(fixedDelta: number = 1 / 60) {
    Assert.isNullOrUndefined(Clock.#instance, "Clock instance already created");

    this.#fixedDelta = fixedDelta;

    Clock.#instance = this;
  }

  public static get instance() {
    Assert.notNullOrUndefined(
      Clock.#instance,
      "Clock instance not found, trying to access before initialization",
    );

    return Clock.#instance;
  }

  public static get elapsed() {
    return Clock.instance.#accumulator;
  }

  public tick(currentTime: number) {
    if (this.#lastTime === null) {
      this.#lastTime = currentTime;
      return;
    }

    const delta = currentTime - this.#lastTime;
    this.#lastTime = currentTime;

    this.#accumulator += delta;
    this.#deltaTime = delta;

    // Increment frame count and accumulate elapsed time for FPS calculation
    this.#frameCount++;
    this.#elapsedTime += delta;

    if (this.#elapsedTime >= 1) {
      this.#fps = this.#frameCount / this.#elapsedTime;
      this.#frameCount = 0;
      this.#elapsedTime = 0;
    }

    // Call fixed updates
    while (this.#accumulator >= this.#fixedDelta) {
      if (this.onFixedUpdate) {
        this.onFixedUpdate(this.#fixedDelta);
      }
      this.#accumulator -= this.#fixedDelta;
    }

    if (this.onUpdate) {
      this.onUpdate(delta);
    }

    if (this.onRender) {
      this.onRender(delta);
    }
  }

  public get deltaTime() {
    return this.#deltaTime;
  }

  public get fixedDeltaTime() {
    return this.#fixedDelta;
  }

  public get fps() {
    return this.#fps;
  }
}
