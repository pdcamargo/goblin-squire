export class Assert {
  /**
   * Asserts that the value is not `null`.
   * Narrows the type from `T | null` to `T`.
   */
  public static notNull<T>(
    value: T,
    message?: string,
  ): asserts value is Exclude<T, null> {
    if (value === null) {
      throw new Error(message || "Value should not be null");
    }
  }

  /**
   * Asserts that the value is not `undefined`.
   * Narrows the type from `T | undefined` to `T`.
   */
  public static notUndefined<T>(
    value: T,
    message?: string,
  ): asserts value is Exclude<T, undefined> {
    if (value === undefined) {
      throw new Error(message || "Value should not be undefined");
    }
  }

  /**
   * Asserts that the value is neither `null` nor `undefined`.
   * Narrows the type from `T | null | undefined` to `T`.
   */
  public static notNullOrUndefined<T>(
    value: T,
    message?: string,
  ): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
      throw new Error(message || "Value should not be null or undefined");
    }
  }

  /**
   * Asserts that the condition is `true`.
   * Useful for custom assertions.
   */
  public static isTrue(
    condition: unknown,
    message?: string,
  ): asserts condition {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
  }

  /**
   * Asserts that the condition is `false`.
   * Useful for custom assertions.
   */
  public static isFalse(
    condition: unknown,
    message?: string,
  ): asserts condition {
    if (condition) {
      throw new Error(message || "Assertion failed");
    }
  }

  /**
   * Asserts that the value is of a specific type using a type guard.
   * Narrows the type accordingly.
   */
  public static isOfType<T>(
    value: unknown,
    typeGuard: (value: unknown) => value is T,
    message?: string,
  ): asserts value is T {
    if (!typeGuard(value)) {
      throw new Error(message || "Value is not of the expected type");
    }
  }
}
