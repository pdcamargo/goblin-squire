// @ts-expect-error -- TODO: not sure why this is failing
import Database from "@tauri-apps/plugin-sql";
import { Assert } from "../assertion";
import { MigrationManager, QueryBuilder, SchemaBuilder } from "../database";

import * as migrations from "../database/migrations";
import { Logger } from "../logger";

import { z } from "zod";

export const entitiesSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  type: z.enum(["item", "character", "location", "organization"]),
  path: z.string(),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  rotation: z.number().default(0),
  tags: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val;
  }, z.array(z.string())),
  metadata: z.preprocess((val) => {
    if (typeof val === "string") {
      return JSON.parse(val);
    }
    return val;
  }, z.record(z.any())),
  createdBy: z.string(),
  permissions: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val;
  }, z.array(z.string())),
  createdAt: z.string(),
});

type Table = {
  entities: z.infer<typeof entitiesSchema>;
};

export class WorldDatabase {
  #db: Database | null = null;
  #queryBuilder: QueryBuilder<Table> | null = null;
  #schemaBuilder: SchemaBuilder | null = null;
  #migrationManager: MigrationManager | null = null;

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
    this.#migrationManager = new MigrationManager(this.#db);

    await this.#migrationManager.initialize();

    await this.#migrationManager.runMigrations([migrations.Setup_0001]);

    let entities = await this.queryBuilder.table("entities").all();

    if (entities.length === 0) {
      const entityData: Table["entities"] = {
        id: 1,
        name: "Test Entity",
        description: "This is a test entity.",
        type: "item",
        path: "/",
        tags: ["test"],
        metadata: {},
        image: "https://picsum.photos/200/300",
        createdBy: "system",
        createdAt: new Date().toISOString(),
        permissions: ["owner"],
      };

      await this.queryBuilder.table("entities").insert(entityData).execute();

      entities = await this.queryBuilder.table("entities").all();
    }

    entities = entities.map((entity) => {
      return entitiesSchema.parse(entity);
    });

    Logger.info({
      entities,
    });

    console.log(JSON.stringify(entities));

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
