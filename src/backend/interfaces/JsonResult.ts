export type JsonTransaction = {
  amount: number;
  name: string;
  date: string;
};
export type Account = {
  name: string;
  credit: number;
  recentTransaction?: JsonTransaction;
};
export type JsonAccounts = {
  [account: string]: Account[];
};
export type JsonResult = {
  [name: string]: JsonAccounts;
};
