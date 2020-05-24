import type { Account } from "../interfaces/Account";
import type { KidsAccountsJson } from "../interfaces/KidsAccountsJson";
import type { DB } from "../Database";
import type { Client } from "plaid";
import type { Browser } from "puppeteer";
import { accountTypes } from "../constants/accountTypes";
import { famzooPuppet } from "./famzooPuppet";
import { plaidLookup } from "./plaidLookup";

export function LookupService(
  db: DB,
  client: Client,
  browser: Browser,
  famzooFamily: string,
  famzooMember: string,
  famzooPassword: string
): (
  kids: KidsAccountsJson
) => Promise<{
  [x: string]: {
    [account: string]: Account[];
  };
}> {
  return (kids: KidsAccountsJson) => {
    const names = Object.keys(kids);

    const accountsToRetrieve = [
      ...new Set(
        names.reduce((acc: string[], kid) => acc.concat(kids[kid]), [])
      ),
    ];
    return Promise.all(
      accountsToRetrieve.map(async (account) => {
        const kidAccounts: { [kid: string]: Account[] } = {};

        const accountNames = names.filter(
          (kid) => kids[kid].indexOf(account) !== -1
        );

        async function doLookup(
          kid: string,
          iterations: number = 3
        ): Promise<Account[]> {
          if (iterations <= 0) {
            console.error(`Full failure ${kid} ${account}`);
            return [];
          }
          try {
            switch (account) {
              case accountTypes.FamZoo:
                const context = await browser.createIncognitoBrowserContext();
                const page = await context.newPage();
                const fiveMinutes = 1000 * 60 * 5; // 5 Minutes for a SLOOOOOW Raspberry Pi Zero W
                page.setDefaultNavigationTimeout(fiveMinutes);
                page.setDefaultTimeout(fiveMinutes);
                try {
                  const result = await famzooPuppet(
                    page,
                    famzooFamily,
                    famzooMember,
                    famzooPassword,
                    kid
                  );
                  await page.close();
                  await context.close();
                  return result;
                } catch (err) {
                  page.close();
                  context.close();
                  throw err;
                }
              case accountTypes.Plaid:
                return await plaidLookup(db, client, kid);
              default:
                return [];
            }
          } catch (err) {
            return await doLookup(kid, iterations - 1);
          }
        }

        const kidResults = await Promise.all(
          accountNames.map((kid) => doLookup(kid))
        );

        accountNames.forEach((kid, index) => {
          kidAccounts[kid] = kidResults[index];
        });

        return kidAccounts;
      })
    )
      .then((accounts) =>
        accounts.reduce(
          (acc: { [account: string]: any }, curr, i) => ({
            ...acc,
            [accountsToRetrieve[i]]: curr,
          }),
          {}
        )
      )
      .then((accounts) => {
        const names = [
          ...new Set(
            Object.keys(accounts).reduce(
              (acc: string[], account) =>
                acc.concat(Object.keys(accounts[account])),
              []
            )
          ),
        ];
        const kidAccounts = names.reduce(
          (acc: { [kid: string]: { [account: string]: Account[] } }, kid) => ({
            ...acc,
            [kid]: Object.keys(accounts).reduce(
              (acc: { [account: string]: Account[] }, account) => {
                if (Object.keys(accounts[account]).indexOf(kid) !== -1) {
                  return {
                    ...acc,
                    [account]: accounts[account][kid],
                  };
                }
                return acc;
              },
              {}
            ),
          }),
          {}
        );
        return kidAccounts;
      });
  };
}
