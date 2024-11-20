export class ApplicationNotInitializedError extends Error {
  constructor() {
    super("Application has not been initialized");

    Object.setPrototypeOf(this, ApplicationNotInitializedError.prototype);
  }
}
