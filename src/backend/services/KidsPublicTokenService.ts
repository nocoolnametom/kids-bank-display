import type { KidPlaidAccount } from "../interfaces/KidPlaidAccount";
import { existsSync, readFileSync } from "fs";
import { KidsAccountsJson } from "../interfaces/KidsAccountsJson";
import { Context } from '../interfaces/Context';

export function getKidsWithPlaidAccounts(): string[] {
  try {
    const resultsFile = __dirname + "/../../../kids_accounts.json";
    const kids_accounts = existsSync(resultsFile)
      ? (JSON.parse(readFileSync(resultsFile, "utf-8")) as KidsAccountsJson)
      : (() => {
          console.error("You are missing a `kids_accounts.json` file!");
          return {};
        })();
    return Object.keys(kids_accounts).filter((kid) =>
      kids_accounts[kid].some((account) => account.toLowerCase() === "plaid")
    );
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function KidsPublicTokenService({db}: Context): () => KidPlaidAccount[] {
  return () => {
    return getKidsWithPlaidAccounts().map((kid) => {
      const publicToken = db.getPublicTokenForKid(kid) || undefined; // @TODO Look this up!
      return { kid, publicToken };
    });
  };
}
