export class ApplicationNotInitializedError extends Error {
  constructor() {
    super("Application has not been initialized");

    Object.setPrototypeOf(this, ApplicationNotInitializedError.prototype);
  }
}

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, AssertionError.prototype);
  }
}
