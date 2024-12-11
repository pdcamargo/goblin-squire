// QueryBuilder.ts
export type ClauseOperator =
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "LIKE"
  | "IN";

export type WhereClause = {
  column: string;
  operator: ClauseOperator;
  value: unknown;
};

export type OrderByClause = {
  column: string;
  direction: "ASC" | "DESC";
};

export type JoinClause = {
  type: "INNER" | "LEFT" | "RIGHT" | "FULL";
  table: string;
  firstColumn: string;
  operator: ClauseOperator;
  secondColumn: string;
};

export type QueryResult = {
  /** The number of rows affected by the query. */
  rowsAffected: number;
  /**
   * The last inserted `id`.
   *
   * This value is always `0` when using the Postgres driver. If the
   * last inserted id is required on Postgres, the `select` function
   * must be used, with a `RETURNING` clause
   * (`INSERT INTO todos (title) VALUES ($1) RETURNING id`).
   */
  lastInsertId: number;
};

export type DatabaseOptions = {
  execute(query: string, bindValues?: unknown[]): Promise<QueryResult>;
  select<T>(query: string, bindValues?: unknown[]): Promise<T>;
};

type TableType = Record<string, Record<string, unknown>>;

type SelectedRow<
  Tables,
  TableName extends keyof Tables,
  ColumnNames extends keyof Tables[TableName],
> = {
  [K in ColumnNames]: Tables[TableName][K];
};

export class QueryBuilder<
  Tables extends TableType,
  TableName extends keyof Tables = keyof Tables,
> {
  private queryType: "select" | "insert" | "update" | "delete" = "select";
  private tableName: TableName = "" as TableName;
  public columns: Array<keyof Tables[TableName]> = ["*"];
  private values: Record<string, unknown> = {};
  private whereClauses: WhereClause[] = [];
  private orderByClauses: OrderByClause[] = [];
  private joinClauses: JoinClause[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  constructor(private db: DatabaseOptions) {}

  public table(tableName: TableName): this {
    this.tableName = tableName;
    return this;
  }

  // SELECT method
  public select(...columns: Array<keyof Tables[TableName]>): this {
    this.queryType = "select";
    this.columns = columns.length > 0 ? columns : ["*"];
    return this;
  }

  // INSERT method
  public insert(data: Record<string, unknown>): this {
    this.queryType = "insert";
    this.values = data;
    return this;
  }

  // UPDATE method
  public update(data: Record<string, unknown>): this {
    this.queryType = "update";
    this.values = data;
    return this;
  }

  // DELETE method
  public delete(): this {
    this.queryType = "delete";
    return this;
  }

  // WHERE clause
  public where(column: string, operator: ClauseOperator, value: unknown): this {
    this.whereClauses.push({ column, operator, value });
    return this;
  }

  // ORDER BY clause
  public orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.orderByClauses.push({ column, direction });
    return this;
  }

  // JOIN clause
  public join(
    table: string,
    firstColumn: string,
    operator: ClauseOperator,
    secondColumn: string,
    type: "INNER" | "LEFT" | "RIGHT" | "FULL" = "INNER",
  ): this {
    this.joinClauses.push({ type, table, firstColumn, operator, secondColumn });
    return this;
  }

  // LIMIT clause
  public limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  // OFFSET clause
  public offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  // Execute method for INSERT, UPDATE, DELETE
  public async execute(): Promise<QueryResult> {
    const { query, bindValues } = this.buildQuery();
    if (this.queryType === "select") {
      throw new Error(
        "Cannot use 'execute' method for SELECT queries. Use 'first()' or 'all()' instead.",
      );
    }
    const ex = await this.db.execute(query, bindValues);

    // clean up inner states so this reference can be reused
    this.clearState();

    return ex;
  }

  // Retrieve a single record
  public async first(): Promise<
    | (this["columns"] extends Array<keyof Tables[TableName]>
        ? SelectedRow<Tables, TableName, this["columns"][number]>
        : Tables[TableName])
    | null
  > {
    if (this.queryType !== "select") {
      throw new Error(
        "The 'first' method can only be used with SELECT queries.",
      );
    }

    this.limitValue = 1; // Ensure only one record is fetched

    const { query, bindValues } = this.buildQuery();

    const results = (await this.db.select(query, bindValues)) as Array<any>;

    const finalRes = results.length > 0 ? results[0] : null;

    // clean up inner states so this reference can be reused
    this.clearState();

    return finalRes;
  }

  // Retrieve all matching records
  public async all(): Promise<
    Array<
      this["columns"] extends Array<keyof Tables[TableName]>
        ? SelectedRow<Tables, TableName, this["columns"][number]>
        : Tables[TableName]
    >
  > {
    if (this.queryType !== "select") {
      throw new Error("The 'all' method can only be used with SELECT queries.");
    }

    const { query, bindValues } = this.buildQuery();

    const res = await this.db.select(query, bindValues);

    // clean up inner states so this reference can be reused
    this.clearState();

    return res as any;
  }

  private clearState() {
    this.columns = ["*"];
    this.whereClauses = [];
    this.orderByClauses = [];
    this.joinClauses = [];
    this.limitValue = undefined;
    this.offsetValue = undefined;
  }

  // Build the SQL query and bind values
  private buildQuery(): { query: string; bindValues: unknown[] } {
    let query = "";
    const bindValues: unknown[] = [];

    switch (this.queryType) {
      case "select":
        query = `SELECT ${this.columns.join(
          ", ",
        )} FROM ${this.tableName.toString()}`;
        break;
      case "insert":
        const columns = Object.keys(this.values);
        const placeholders = columns.map(() => "?");
        bindValues.push(...Object.values(this.values));

        query = `INSERT INTO ${this.tableName.toString()} (${columns.join(
          ", ",
        )}) VALUES (${placeholders.join(", ")})`;
        break;
      case "update":
        const setClauses = Object.keys(this.values).map((column) => {
          bindValues.push(this.values[column]);
          return `${column} = ?`;
        });

        query = `UPDATE ${this.tableName.toString()} SET ${setClauses.join(
          ", ",
        )}`;
        break;
      case "delete":
        query = `DELETE FROM ${this.tableName.toString()}`;
        break;
    }

    // Handle joins
    if (this.joinClauses.length > 0 && this.queryType === "select") {
      this.joinClauses.forEach((clause) => {
        query += ` ${clause.type} JOIN ${clause.table} ON ${clause.firstColumn} ${clause.operator} ${clause.secondColumn}`;
      });
    }

    // Handle where clauses
    if (this.whereClauses.length > 0) {
      const whereStatements = this.whereClauses.map((clause) => {
        bindValues.push(clause.value);
        return `${clause.column} ${clause.operator} ?`;
      });
      query += ` WHERE ${whereStatements.join(" AND ")}`;
    }

    // Handle order by clauses
    if (this.orderByClauses.length > 0) {
      const orderByStatements = this.orderByClauses.map(
        (clause) => `${clause.column} ${clause.direction}`,
      );
      query += ` ORDER BY ${orderByStatements.join(", ")}`;
    }

    // Handle limit and offset
    if (this.limitValue !== undefined) {
      query += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue !== undefined) {
      query += ` OFFSET ${this.offsetValue}`;
    }

    return { query, bindValues };
  }
}
