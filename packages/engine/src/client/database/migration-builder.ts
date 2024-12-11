import { Logger } from "../logger";
import { DatabaseOptions, QueryResult } from "./query-builder";
import {
  ColumnDefinition,
  SchemaBuilder,
  TableOptions,
} from "./schema-builder";

type TableCallback = (table: MigrationTableBuilder) => void;

export abstract class MigrationSchema {
  protected db: DatabaseOptions;

  constructor(db: DatabaseOptions) {
    this.db = db;
  }

  abstract up(): Promise<void> | void;
  abstract down(): Promise<void> | void;

  protected createTable(
    name: string,
    callback: TableCallback,
    options?: TableOptions,
  ): Promise<QueryResult> {
    const tableBuilder = new MigrationTableBuilder(new SchemaBuilder(this.db));

    callback(tableBuilder);

    const schema = tableBuilder.getSchemaBuilder();

    schema.createTable(name, options);

    return schema.execute();
  }

  protected updateTable(
    name: string,
    callback: TableCallback,
  ): Promise<QueryResult> {
    const tableBuilder = new MigrationTableBuilder(
      new SchemaBuilder(this.db),
      name,
    );

    callback(tableBuilder);

    return tableBuilder.execute();
  }

  protected deleteTable(name: string): Promise<QueryResult> {
    return this.db.execute(`DROP TABLE IF EXISTS ${name}`);
  }

  protected executeRaw(
    query: string,
    bindValues?: unknown[],
  ): Promise<QueryResult> {
    return this.db.execute(query, bindValues);
  }
}

export class MigrationTableBuilder {
  private schema: SchemaBuilder;
  private tableName?: string;
  private pendingQueries: Array<{ query: string; bindValues?: unknown[] }> = [];

  constructor(schema: SchemaBuilder, tableName?: string) {
    this.schema = schema;
    this.tableName = tableName;
  }

  public getSchemaBuilder() {
    return this.schema;
  }

  public addColumn(definition: ColumnDefinition): this {
    this.schema.addColumn(definition);
    return this;
  }

  public executeRaw(query: string, bindValues?: unknown[]): this {
    this.pendingQueries.push({ query, bindValues });
    return this;
  }

  public async execute(): Promise<QueryResult> {
    let result: QueryResult = { rowsAffected: 0, lastInsertId: 0 };

    if (this.tableName && this.schema) {
      // If schema has columns queued, update them
      // Note: For altering a table in SQLite, you might need a workaround since SQLite's ALTER TABLE is limited.
      // For demonstration, let's assume a basic approach.
      // This would actually be more complex in real scenarios.
      // If no columns have been added using schema builder (meaning we are updating a table):
      // No direct columns update here because CREATE TABLE was already handled. For actual column adds,
      // one might run `ALTER TABLE ADD COLUMN ...` statements. Let's assume they are handled by `executeRaw`.
    }

    // Execute all pending queries
    for (const q of this.pendingQueries) {
      const r = await this.schema["db"].execute(q.query, q.bindValues);
      result = r;
    }

    return result;
  }
}

type MigrationClass = { new (db: DatabaseOptions): MigrationSchema };

export class MigrationManager {
  constructor(
    private db: DatabaseOptions,
    private migrationTableName: string = "migrations",
  ) {}

  public async initialize(): Promise<void> {
    Logger.info("Initializing migrations");

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        runAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

    Logger.info("Migrations initialized");
  }

  public async runMigrations(migrations: MigrationClass[]): Promise<void> {
    Logger.debug("Running migrations");

    const applied = await this.getAppliedMigrations();

    Logger.debug(`Applied migrations: ${applied.join(", ")}`);

    for (const Migration of migrations) {
      const migrationName = Migration.name;

      if (!applied.includes(migrationName)) {
        const instance = new Migration(this.db);

        await instance.up();

        await this.markMigrationAsApplied(migrationName);
      }
    }

    Logger.debug("Migrations completed");
  }

  public async rollbackLastMigration(
    migrations: MigrationClass[],
  ): Promise<void> {
    const applied = await this.getAppliedMigrations();

    if (applied.length === 0) return;

    const lastMigrationName = applied[applied.length - 1];

    if (!lastMigrationName) return;

    const Migration = migrations.find((m) => m.name === lastMigrationName);

    if (!Migration) return;

    const instance = new Migration(this.db);

    await instance.down();

    await this.removeAppliedMigration(lastMigrationName);
  }

  private async getAppliedMigrations(): Promise<string[]> {
    const rows = await this.db.select<{ name: string }[]>(
      `SELECT name FROM ${this.migrationTableName}`,
    );
    return rows.map((r) => r.name);
  }

  private async markMigrationAsApplied(name: string): Promise<QueryResult> {
    return this.db.execute(
      `INSERT INTO ${this.migrationTableName} (name) VALUES (?)`,
      [name],
    );
  }

  private async removeAppliedMigration(name: string): Promise<QueryResult> {
    return this.db.execute(
      `DELETE FROM ${this.migrationTableName} WHERE name = ?`,
      [name],
    );
  }
}
