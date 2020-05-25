import type {
  JsonResult,
  JsonAccounts,
  Account,
  JsonTransaction,
} from "../interfaces/JsonResult";
import type { KidResult } from "../interfaces/KidResult";
import { shortMonths } from "../constants/shortMonths";
import { Context } from '../interfaces/Context';

export function nameReplacements(name: string): string {
  switch (name.toLowerCase()) {
    case "persephone":
      return "Sephie";
    default:
      return name;
  }
}

export function accountReplacements(name: string, regex: {[regex: string]: string}): string {
  return Object.keys(regex).reduce(
    (name, pattern) => {
      const search = RegExp(pattern, "gi");
      return search.test(name) ? name.replace(search, regex[pattern]) : name;
    },
    name
  );
}

export function translateTotals(accounts: JsonAccounts): number {
  return Object.keys(accounts).reduce((acc, bank) => {
    const accountTotal = accounts[bank].reduce((tot, account) => {
      return tot + account.credit;
    }, 0);
    return acc + accountTotal;
  }, 0);
}

export function translateAccountNames(accounts: JsonAccounts, regex: {[regex: string]: string}): Account[] {
  return Object.keys(accounts).reduce(
    (acc, bank) =>
      acc.concat(
        accounts[bank].map((account) => ({
          ...account,
          name: accountReplacements(account.name, regex),
        }))
      ),
    [] as Account[]
  );
}

export function addNiceDateToTransaction(
  transaction: JsonTransaction
): JsonTransaction {
  return {
    ...transaction,
    date: `${shortMonths[new Date(transaction.date).getMonth()]} ${new Date(
      transaction.date
    ).getDate()}`,
  };
}

export function filterRecentTransaction(
  accounts: JsonAccounts
): undefined | JsonTransaction {
  return Object.keys(accounts).reduce((acc, bank) => {
    const jsonAccounts = accounts[bank];
    const transaction = jsonAccounts.reduce((trans, account) => {
      if (!account.recentTransaction) {
        return trans;
      }
      if (trans == null) {
        return account.recentTransaction;
      }
      const transDate = new Date(trans.date);
      const accDate = new Date(account.recentTransaction.date);
      return transDate > accDate ? trans : account.recentTransaction;
    }, null as JsonTransaction | null);

    if (!transaction) {
      return acc;
    }

    if (!acc) {
      return addNiceDateToTransaction(transaction);
    }

    const accDate = new Date(acc.date);
    const transDate = new Date(transaction.date);

    return transDate > accDate ? addNiceDateToTransaction(transaction) : acc;
  }, undefined as undefined | JsonTransaction);
}

export function kidsObjectToAccountsList(results: JsonResult, regex: {[regex: string]: string}): KidResult[] {
  return Object.keys(results).map((name) => ({
    name: nameReplacements(name),
    fullTotal: translateTotals(results[name]),
    accounts: translateAccountNames(results[name], regex),
    recentTransaction: filterRecentTransaction(results[name]),
  }));
}

export function AccountValuesService({}: Context): (results: JsonResult, regex: {[regex: string]: string}) => KidResult[] {
  return (results, regex) => {
    return kidsObjectToAccountsList(results, regex);
  };
}
