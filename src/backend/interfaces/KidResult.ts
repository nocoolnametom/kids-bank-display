import type { Account, JsonTransaction } from "./JsonResult";

export interface KidResult {
  name: string;
  fullTotal: number;
  accounts: Account[];
  recentTransaction?: JsonTransaction;
}
