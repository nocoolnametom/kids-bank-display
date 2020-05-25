import type { Account } from "../interfaces/Account";
import type { Client, Transaction } from "plaid";
import type { DB } from "../Database";
import type { JsonTransaction } from "../interfaces/JsonResult";
import moment from "moment";

export function getRecentTransaction(
  accountId: string,
  transactions: Transaction[]
): undefined|JsonTransaction {
  return transactions
    .filter(
      ({ account_id, amount }) =>
        account_id === accountId && amount && amount > 0
    )
    .map(({ name: transactionName, amount, date }) => ({
      amount: 0 - (amount || 0),
      name: transactionName || "",
      date: date || "",
    }))
    .shift();
}

export const plaidLookup: (
  db: DB,
  client: Client,
  kid: string
) => Promise<Account[]> = async (db, client, kid) => {
  const accessToken = db.getPrivateTokenForKid(kid);
  if (!accessToken) {
    return [];
  }
  const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");
  const { accounts, transactions } = await client.getTransactions(
    accessToken,
    startDate,
    endDate,
    { count: 20, offset: 0 }
  );
  const result = accounts
    .filter(
      (account) => account.type === "depository" && account.balances.available
    )
    .map(
      ({name: accountName, balances, account_id}) =>
        ({
          name: accountName,
          credit: balances.available || 0,  // Transactions are in cents, but balances are in dollars!
          recentTransaction: getRecentTransaction(account_id, transactions),
        } as Account)
    );
  return result;
};
