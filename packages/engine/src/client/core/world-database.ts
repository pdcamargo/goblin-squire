// @ts-expect-error -- TODO: not sure why this is failing
import Database from "@tauri-apps/plugin-sql";
import { Assert } from "../assertion";
import { QueryBuilder, SchemaBuilder } from "../database";

export class WorldDatabase {
  #db: Database | null = null;
  #queryBuilder: QueryBuilder<any> | null = null;
  #schemaBuilder: SchemaBuilder | null = null;

  static #instance: WorldDatabase | null = null;

  public static get instance() {
    Assert.notNullOrUndefined(
      WorldDatabase.#instance,
      "WorldDatabase is not initialized, make sure to call WorldDatabase.initialize() before using it.",
    );

    return WorldDatabase.#instance;
  }

  public async initialize(worldId: string) {
    Assert.isNullOrUndefined(
      WorldDatabase.#instance,
      "WorldDatabase is already initialized.",
    );

    this.#db = await Database.load(`sqlite:Data/worlds/${worldId}/world.db`);

    this.#queryBuilder = new QueryBuilder(this.db);
    this.#schemaBuilder = new SchemaBuilder(this.db);

    await this.#schemaBuilder
      .createTable("items", {
        ifNotExists: true,
      })
      .addColumn({
        name: "id",
        type: "INTEGER",
        autoIncrement: true,
        primaryKey: true,
        notNull: true,
        unique: true,
      })
      .addColumn({
        name: "name",
        type: "TEXT",
        notNull: true,
      })
      .addColumn({
        name: "description",
        type: "TEXT",
        notNull: true,
      })
      .execute();

    WorldDatabase.#instance = this;
  }

  private get db() {
    Assert.notNullOrUndefined(this.#db, "WorldDatabase is not initialized.");

    return this.#db;
  }

  private get queryBuilder() {
    Assert.notNullOrUndefined(
      this.#queryBuilder,
      "WorldDatabase is not initialized.",
    );

    return this.#queryBuilder;
  }

  private get schemaBuilder() {
    Assert.notNullOrUndefined(
      this.#schemaBuilder,
      "WorldDatabase is not initialized.",
    );

    return this.#schemaBuilder;
  }

  public get table() {
    return this.queryBuilder.table.bind(this.queryBuilder);
  }

  public get schema() {
    return this.schemaBuilder.createTable.bind(this.#schemaBuilder);
  }
}
