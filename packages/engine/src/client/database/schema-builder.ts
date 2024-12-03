import { z } from "zod";

import { DatabaseOptions, QueryResult } from "./query-builder";

const columnTypeSchema = z.enum([
  "INTEGER",
  "REAL",
  "TEXT",
  "BLOB",
  "NUMERIC",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "JSON",
]);

const columnDefinitionSchema = z.object({
  name: z.string(),
  type: columnTypeSchema,
  primaryKey: z.boolean().optional(),
  autoIncrement: z.boolean().optional(),
  notNull: z.boolean().optional(),
  unique: z.boolean().optional(),
  default: z.any().optional(),
  check: z.string().optional(),
  references: z
    .object({
      table: z.string(),
      column: z.string(),
      onDelete: z
        .enum(["CASCADE", "SET NULL", "RESTRICT", "NO ACTION", "SET DEFAULT"])
        .optional(),
      onUpdate: z
        .enum(["CASCADE", "SET NULL", "RESTRICT", "NO ACTION", "SET DEFAULT"])
        .optional(),
    })
    .optional(),
  collation: z.string().optional(),
  generatedAs: z.string().optional(),
  stored: z.boolean().optional(),
});

const tableOptionsSchema = z.object({
  ifNotExists: z.boolean().optional(),
});

export type ColumnDefinition = z.infer<typeof columnDefinitionSchema>;
export type TableOptions = z.infer<typeof tableOptionsSchema>;

export class SchemaBuilder {
  private tableName: string = "";
  private columns: ColumnDefinition[] = [];
  private tableOptions: TableOptions = {};

  constructor(private db: DatabaseOptions) {}

  public createTable(tableName: string, options?: TableOptions): this {
    z.string().parse(tableName);
    tableOptionsSchema.parse(options || {});

    this.tableName = tableName;
    this.tableOptions = options || {};
    return this;
  }

  public addColumn(column: ColumnDefinition): this {
    columnDefinitionSchema.parse(column);

    this.columns.push(column);
    return this;
  }

  public async execute(): Promise<QueryResult> {
    const { query, bindValues } = this.buildQuery();
    return this.db.execute(query, bindValues);
  }

  private buildQuery(): { query: string; bindValues: unknown[] } {
    if (!this.tableName || this.columns.length === 0) {
      throw new Error("Table name and columns must be specified.");
    }

    const queryParts: string[] = [];
    const bindValues: unknown[] = [];

    const tableClause = `CREATE TABLE${
      this.tableOptions.ifNotExists ? " IF NOT EXISTS" : ""
    } ${this.tableName}`;

    const columnDefinitions = this.columns.map((col) => {
      let colDef = `${col.name} ${col.type}`;

      if (col.primaryKey) {
        colDef += " PRIMARY KEY";
        if (col.autoIncrement) {
          colDef += " AUTOINCREMENT";
        }
      }

      if (col.notNull) {
        colDef += " NOT NULL";
      }

      if (col.unique) {
        colDef += " UNIQUE";
      }

      if (col.default !== undefined) {
        colDef += " DEFAULT ";
        if (typeof col.default === "string") {
          colDef += `'${col.default}'`;
        } else {
          colDef += `${col.default}`;
        }
      }

      if (col.check) {
        colDef += ` CHECK (${col.check})`;
      }

      if (col.references) {
        colDef += ` REFERENCES ${col.references.table}(${col.references.column})`;

        if (col.references.onDelete) {
          colDef += ` ON DELETE ${col.references.onDelete}`;
        }

        if (col.references.onUpdate) {
          colDef += ` ON UPDATE ${col.references.onUpdate}`;
        }
      }

      return colDef;
    });

    queryParts.push(tableClause);
    queryParts.push(`(${columnDefinitions.join(", ")})`);

    const query = queryParts.join(" ");

    return { query, bindValues };
  }
}
