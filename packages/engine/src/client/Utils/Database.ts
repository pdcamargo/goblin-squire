import { Assert } from "../Assert";
import { DatabaseOptions, QueryBuilder, QueryResult } from "./QueryBuilder";
import { SchemaBuilder } from "./SchemaBuilder";

export type TablesType = {
  items: {
    id: number;
    name: string;
    description: string;
  };
};

export class Database {
  #methods: DatabaseOptions;
  #queryBuilder: QueryBuilder<TablesType>;
  #schemaBuilder: SchemaBuilder;

  static #instance: Database;

  constructor(options: DatabaseOptions) {
    Assert.isNullOrUndefined(
      Database.#instance,
      "Database instance has already been created.",
    );

    this.#methods = Object.freeze(options);

    Assert.isFunction(this.#methods.execute, "Execute method is required.");
    Assert.isFunction(this.#methods.select, "Select method is required.");

    Database.#instance = this;

    this.#queryBuilder = new QueryBuilder(this.#methods);
    this.#schemaBuilder = new SchemaBuilder(this.#methods);
  }

  static getInstance(): Database {
    Assert.notNullOrUndefined(
      Database.#instance,
      "Database instance has not been created.",
    );

    return Database.#instance;
  }

  execute(query: string, bindValues?: unknown[]): Promise<QueryResult> {
    return this.#methods.execute(query, bindValues);
  }

  select<T>(query: string, bindValues?: unknown[]): Promise<T> {
    return this.#methods.select(query, bindValues);
  }

  get schema(): SchemaBuilder {
    return this.#schemaBuilder;
  }

  public table(tableName: keyof TablesType): QueryBuilder<TablesType> {
    return this.#queryBuilder.table(tableName);
  }

  static execute(query: string, bindValues?: unknown[]): Promise<QueryResult> {
    return Database.getInstance().execute(query, bindValues);
  }

  static select<T>(query: string, bindValues?: unknown[]): Promise<T> {
    return Database.getInstance().select(query, bindValues);
  }

  static schema(): SchemaBuilder {
    return Database.getInstance().schema;
  }
}
