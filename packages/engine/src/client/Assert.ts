import { AssertionError } from "./Errors";

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
      throw new AssertionError(message || "Value should not be null");
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
      throw new AssertionError(message || "Value should not be undefined");
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
      throw new AssertionError(
        message || "Value should not be null or undefined",
      );
    }
  }

  /**
   * Asserts that the value is `null`.
   */
  public static isNull(
    value: unknown,
    message?: string,
  ): asserts value is null {
    if (value !== null) {
      throw new AssertionError(message || "Value should be null");
    }
  }

  /**
   * Asserts that the value is `undefined`.
   */
  public static isUndefined(
    value: unknown,
    message?: string,
  ): asserts value is undefined {
    if (value !== undefined) {
      throw new AssertionError(message || "Value should be undefined");
    }
  }

  /**
   * Asserts that the value is either `null` or `undefined`.
   */
  public static isNullOrUndefined(
    value: unknown,
    message?: string,
  ): asserts value is null | undefined {
    if (value !== null && value !== undefined) {
      throw new AssertionError(message || "Value should be null or undefined");
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
      throw new AssertionError(message || "Assertion failed");
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
      throw new AssertionError(message || "Assertion failed");
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
      throw new AssertionError(message || "Value is not of the expected type");
    }
  }

  /**
   * Asserts that the value is a HTML element of any kind.
   * Narrows the type from `T` to `HTMLElement`.
   */
  public static isHtmlElement<T extends HTMLElement>(
    value: unknown,
    message?: string,
  ): asserts value is T {
    if (!(value instanceof HTMLElement)) {
      throw new AssertionError(message || "Value is not an HTML element");
    }
  }

  /**
   * Asserts that the value is a HTML element with a specific instance type.
   * Narrows the type from `T` to `K`.
   */
  public static isHtmlElementOfType<T extends HTMLElement, K extends T>(
    value: unknown,
    type: new () => K,
    message?: string,
  ): asserts value is K {
    if (!(value instanceof type)) {
      throw new AssertionError(
        message || "Value is not an HTML element of the expected type",
      );
    }
  }

  /**
   * Asserts that the value is an array of numbers.
   * Narrows the type from `T` to `number[]`.
   */
  public static isNumberArray<T extends number[]>(
    value: unknown,
    message?: string,
  ): asserts value is T {
    if (!Array.isArray(value) || !value.every((v) => typeof v === "number")) {
      throw new AssertionError(message || "Value is not an array of numbers");
    }
  }

  /**
   * Asserts that the value is an array of two numbers.
   * Narrows the type from `T` to `[number, number]`.
   */
  public static isVector2Array<T extends [number, number]>(
    value: unknown,
    message?: string,
  ): asserts value is T {
    if (
      !Array.isArray(value) ||
      value.length !== 2 ||
      !value.every((v) => typeof v === "number")
    ) {
      throw new AssertionError(
        message || "Value is not an array of two numbers",
      );
    }
  }

  /**
   * Asserts that the value is a number
   */
  public static isNumber(
    value: unknown,
    message?: string,
  ): asserts value is number {
    if (typeof value !== "number") {
      throw new AssertionError(message || "Value is not a number");
    }
  }

  /**
   * Asserts that the value is a string
   */
  public static isString(
    value: unknown,
    message?: string,
  ): asserts value is string {
    if (typeof value !== "string") {
      throw new AssertionError(message || "Value is not a string");
    }
  }

  /**
   * Asserts that the value is a function
   */
  public static isFunction(
    value: unknown,
    message?: string,
  ): asserts value is Function {
    if (typeof value !== "function") {
      throw new AssertionError(message || "Value is not a function");
    }
  }

  /**
   * Asserts that the value is an absolute path
   */
  public static isAbsolutePath(
    value: unknown,
    message?: string,
  ): asserts value is string {
    if (typeof value !== "string" || !value.startsWith("/")) {
      throw new AssertionError(message || "Value is not an absolute path");
    }
  }

  /**
   * Asserts that the value is included in the provided array or enum values
   */
  public static isEnumValue<T extends string | number>(
    value: unknown,
    values: T[] | ReadonlyArray<T>,
    message?: string,
  ): asserts value is T {
    if (!values.includes(value as T)) {
      throw new AssertionError(message || "Value is not an enum value");
    }
  }
}
