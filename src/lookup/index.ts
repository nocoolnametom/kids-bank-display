import type { ClientOptions } from "plaid";
import envvar from "envvar";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { Client, environments } from "plaid";
import { DB } from "./Database";
import { LookupService } from "./services/LookupService";

const PLAID_CLIENT_ID = envvar.string("PLAID_CLIENT_ID");
const PLAID_SECRET = envvar.string("PLAID_SECRET");
const PLAID_PUBLIC_KEY = envvar.string("PLAID_PUBLIC_KEY");
const PLAID_ENV = envvar.string("PLAID_ENV", "sandbox");
const IS_NIXOS = envvar.number("__NIXOS_SET_ENVIRONMENT_DONE", 0);
const CHROMIUM = envvar.string("CHROMIUM", "./.node/bin/chromium");
const FZ_FAM = envvar.string("FZ_FAM", "doggett");
const FZ_MEM = envvar.string("FZ_MEM", "tom");
const FZ_PASS = envvar.string("FZ_PASS", "<famzooPassword>");
const TOKEN_DB_NAME = envvar.string("TOKEN_DB_NAME", "kid_tokens.db");

const APP_NAME = 'RP0-BankBox';

if (existsSync(__dirname + "/../../kids_accounts.json")) {
  try {
    const kids = JSON.parse(
      readFileSync(__dirname + "/../../kids_accounts.json", { encoding: "utf8" })
    );
    const db = new DB(TOKEN_DB_NAME);
    const client = new Client(
      PLAID_CLIENT_ID,
      PLAID_SECRET,
      PLAID_PUBLIC_KEY,
      environments[PLAID_ENV],
      ({
        version: "2019-05-29",
        clientApp: APP_NAME,
      } as any) as ClientOptions
    );
    LookupService(
      db,
      client,
      !!IS_NIXOS,
      CHROMIUM,
      FZ_FAM,
      FZ_MEM,
      FZ_PASS
    )(kids).then((data) =>
      writeFileSync(__dirname + "/../../results.json", JSON.stringify(data), { encoding: "utf8" })
    );
  } catch (err) {
    console.error(err);
  }
}
