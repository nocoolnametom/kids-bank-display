import type { KidPlaidAccount } from "./KidPlaidAccount";

export interface FrontendConfig {
  publicKey: string;
  env: string;
  products: string[];
  countryCodes: string[];
  accounts: KidPlaidAccount[];
  pushUrl: string;
}
