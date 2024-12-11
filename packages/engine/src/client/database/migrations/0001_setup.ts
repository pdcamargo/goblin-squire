import { MigrationSchema } from "../migration-builder";

export class Setup_0001 extends MigrationSchema {
  protected tableName = "entities";

  public override async up() {
    await this.createTable(this.tableName, (table) => {
      table
        .addColumn({
          name: "id",
          type: "INTEGER",
          primaryKey: true,
          autoIncrement: true,
        })
        .addColumn({ name: "name", type: "TEXT", notNull: true })
        .addColumn({ name: "description", type: "TEXT", notNull: false })
        .addColumn({ name: "image", type: "TEXT", notNull: false })
        .addColumn({
          name: "type",
          type: "TEXT",
          notNull: true,
          check: "type IN ('item', 'character', 'location', 'organization')",
        })
        .addColumn({ name: "path", type: "TEXT", notNull: true })
        .addColumn({
          name: "tags",
          type: "JSON",
          notNull: true,
          default: "[]",
          check: "json_valid(tags)",
        })
        .addColumn({
          name: "metadata",
          type: "JSON",
          notNull: true,
          default: "{}",
          check: "json_valid(metadata)",
        })
        .addColumn({ name: "createdBy", type: "TEXT", notNull: true })
        .addColumn({
          name: "permissions",
          type: "JSON",
          notNull: true,
          // permissions tells us who can read/write this entity
          // possible values are: "owner", "all" or an array of user ids
          default: '["owner"]',
          check: "json_valid(permissions)",
        })
        .addColumn({
          name: "positionX",
          type: "REAL",
          notNull: true,
          default: 0,
        })
        .addColumn({
          name: "positionY",
          type: "REAL",
          notNull: true,
          default: 0,
        })
        .addColumn({
          name: "rotation",
          type: "REAL",
          notNull: true,
          default: 0,
        })
        .addColumn({
          name: "createdAt",
          type: "DATETIME",
          notNull: true,
          default: "CURRENT_TIMESTAMP",
        });
    });
  }

  public override async down() {
    await this.deleteTable(this.tableName);
  }
}
