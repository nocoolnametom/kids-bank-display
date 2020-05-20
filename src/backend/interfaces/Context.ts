import { Client } from "plaid";
import { DB } from '../Database';

export interface Context {
  client: Client;
  db: DB;
}