import type { Database } from "better-sqlite3";
import BetterSqlite from "better-sqlite3";

const ACCOUNT_TABLE = "accounts";
const ACCOUNT_ID = "id";
const KID = "kid";
const PUBLIC_TOKEN = "public_token";
const PRIVATE_TOKEN = "private_token";

export class DB {
  private db: Database;

  public constructor(
    name: string,
    verbose: boolean = false,
    SqliteClass: null | Database = null
  ) {
    if (SqliteClass) {
      this.db = SqliteClass;
    } else {
      this.db = new BetterSqlite(name, {
        verbose: verbose ? console.log : () => null,
      });
      this.ensureTables();
    }
  }

  private ensureTables: () => void = () => {
    const tableQuery = `CREATE TABLE IF NOT EXISTS ${ACCOUNT_TABLE} (
    ${ACCOUNT_ID} INTEGER PRIMARY KEY,
    ${KID} TEXT NOT NULL UNIQUE,
    ${PUBLIC_TOKEN} TEXT,
    ${PRIVATE_TOKEN} TEXT
  )`;
    this.db.exec(tableQuery);
  };

  public getPrivateTokenForKid: (kid: string) => string | null = (kid) => {
    const stmt = this.db.prepare(
      `SELECT ${PRIVATE_TOKEN} FROM ${ACCOUNT_TABLE} WHERE ${KID} = ?`
    );
    return (stmt.get(kid.toLowerCase()) || {})[PRIVATE_TOKEN] || null;
  };

  public getPublicTokenForKid: (kid: string) => string | null = (kid) => {
    const stmt = this.db.prepare(
      `SELECT ${PUBLIC_TOKEN} FROM ${ACCOUNT_TABLE} WHERE ${KID} = ?`
    );
    return (stmt.get(kid.toLowerCase()) || {})[PUBLIC_TOKEN] || null;
  };

  public savePrivateTokenForKid: (kid: string, token: string | null) => void = (
    kid,
    token
  ) => {
    const publicToken = this.getPublicTokenForKid(kid);
    const replace = this.db.prepare(
      `REPLACE INTO ${ACCOUNT_TABLE} (${KID}, ${PUBLIC_TOKEN}, ${PRIVATE_TOKEN}) VALUES(@kid, @publicToken, @token)`
    );

    const info = replace.run({ kid: kid.toLowerCase(), token, publicToken });

    if (info.changes !== 1) {
      console.error(`Error replacing private token '${token}' for ${kid}`);
    }
  };

  public savePublicTokenForKid: (kid: string, token: string | null) => void = (
    kid,
    token
  ) => {
    const replace = this.db.prepare(
      `REPLACE INTO ${ACCOUNT_TABLE} (${KID}, ${PUBLIC_TOKEN}) VALUES(@kid, @token)`
    );

    const info = replace.run({ kid: kid.toLowerCase(), token });

    if (info.changes !== 1) {
      console.error(`Error replacing public token '${token}' for ${kid}`);
    }
  };
}
