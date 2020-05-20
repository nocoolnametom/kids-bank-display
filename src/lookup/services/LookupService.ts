import type { Account } from "../interfaces/Account";
import type { KidsAccountsJson } from "../interfaces/KidsAccountsJson";
import { accountTypes } from "../constants/accountTypes";
import { famzooPuppet } from "./famzooPuppet";
import { plaidLookup } from "./plaidLookup";
import { DB } from "../Database";
import { Client } from "plaid";

export function LookupService(
  db: DB,
  client: Client,
  isNixos: boolean,
  chromiumPath: string,
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

        for (const kid of accountNames) {
          try {
            switch (account) {
              case accountTypes.FamZoo:
                kidAccounts[kid] = await famzooPuppet(
                  isNixos,
                  chromiumPath,
                  famzooFamily,
                  famzooMember,
                  famzooPassword,
                  kid
                );
                break;
              case accountTypes.Plaid:
                kidAccounts[kid] = await plaidLookup(db, client, kid);
                break;
              default:
                break;
            }
          } catch (err) {
            console.error(err);
            kidAccounts[kid] = [];
          }
        }

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
