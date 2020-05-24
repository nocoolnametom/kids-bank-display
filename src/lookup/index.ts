import type { ClientOptions } from "plaid";
import type { LaunchOptions } from 'puppeteer';
import envvar from "envvar";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { Client, environments } from "plaid";
import { DB } from "./Database";
import { LookupService } from "./services/LookupService";
import puppeteer from 'puppeteer';

const PLAID_CLIENT_ID = envvar.string("PLAID_CLIENT_ID");
const PLAID_SECRET = envvar.string("PLAID_SECRET");
const PLAID_PUBLIC_KEY = envvar.string("PLAID_PUBLIC_KEY");
const PLAID_ENV = envvar.string("PLAID_ENV", "sandbox");
const IS_NIXOS = !(!envvar.number("__NIXOS_SET_ENVIRONMENT_DONE", 0));
const CHROMIUM = envvar.string("CHROMIUM", IS_NIXOS ? `${__dirname}/../../.node/bin/chromium` : "/usr/bin/chromium-browser");
const FZ_FAM = envvar.string("FZ_FAM", "doggett");
const FZ_MEM = envvar.string("FZ_MEM", "tom");
const FZ_PASS = envvar.string("FZ_PASS", "<famzooPassword>");
const TOKEN_DB_NAME = envvar.string("TOKEN_DB_NAME", `${__dirname}/../../kid_tokens.db`);

const APP_NAME = 'RP0-BankBox';

const launchOptions: LaunchOptions = {
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true
};

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
    if (!!IS_NIXOS || CHROMIUM) {
      launchOptions.executablePath = CHROMIUM;
    }

    puppeteer.launch(launchOptions).then(async (browser) => {
      const data = await LookupService(
        db,
        client,
        browser,
        FZ_FAM,
        FZ_MEM,
        FZ_PASS
      )(kids);
        writeFileSync(__dirname + "/../../results.json", JSON.stringify(data), { encoding: "utf8" });
        await browser.close();
    });
  } catch (err) {
    console.error(err);
  }
}
