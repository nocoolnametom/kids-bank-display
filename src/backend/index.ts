import type { ClientOptions } from "plaid";
import type { Context } from './interfaces/Context';
import bodyParser from "body-parser";
import envvar from "envvar";
import express from "express";
import { Client, environments } from "plaid";
import { AccountValuesController } from "./controllers/AccountValuesController";
import { PlaidLoginController } from "./controllers/PlaidLoginController";
import { PrivateAccessTokenController } from "./controllers/PrivateAccessTokenController";
import { DB } from "./Database";
import { AccountValuesService } from "./services/AccountValuesService";
import { KidsPublicTokenService } from "./services/KidsPublicTokenService";
import { SaveTokenService } from "./services/SaveTokenService";

const APP_PORT = envvar.number("APP_PORT", 8090);
const PLAID_CLIENT_ID = envvar.string("PLAID_CLIENT_ID");
const PLAID_SECRET = envvar.string("PLAID_SECRET");
const PLAID_PUBLIC_KEY = envvar.string("PLAID_PUBLIC_KEY");
const PLAID_ENV = envvar.string("PLAID_ENV", "sandbox");
const PLAID_PRODUCTS = envvar.string("PLAID_PRODUCTS", "transactions");
const PLAID_COUNTRY_CODES = envvar.string("PLAID_COUNTRY_CODES", "US");
const TOKEN_DB_NAME = envvar.string("TOKEN_DB_NAME", `${__dirname}/../../kid_tokens.db`);

const APP_NAME = 'RP0-BankBox';

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
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

const db = new DB(TOKEN_DB_NAME);

const context: Context = {
  client,
  db
};

const scripts: { [target: string]: string } = {
  "require.js": "requirejs/require.js",
  "jquery.js": "jquery/dist/jquery.js",
  "react.js": "react/umd/react.development.js",
  "react-dom.js": "react-dom/umd/react-dom.development.js",
  "tslib.js": "tslib/tslib.js",
  "react-plaid-link.js": "react-plaid-link/dist/index.umd.min.js",
};

const app = express();
app.use(express.static(__dirname + "../../public"));
app.use("/js", express.static(__dirname + "/../../dest/frontend/"));
Object.keys(scripts).forEach((target) => {
  app.use(
    `/scripts/${target}`,
    express.static(__dirname + "/../../node_modules/" + scripts[target])
  );
});
app.set("view engine", "ejs");
app.set('views', __dirname + '/../../views');
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

const ROOT_URL = "/";
const LOGIN_URL = "/login";
const ADD_TOKEN_URL = "/addToken";

/**
 * Returns a dashboard of the current account results
 */
app.get(ROOT_URL, AccountValuesController(AccountValuesService(context)));

/**
 * Returns a Plaid Link widget for each plaid kid account
 */
app.get(
  LOGIN_URL,
  PlaidLoginController(ADD_TOKEN_URL, {
    publicKey: PLAID_PUBLIC_KEY,
    env: PLAID_ENV,
    products: PLAID_PRODUCTS.split(','),
    countryCodes: PLAID_COUNTRY_CODES.split(','),
  }, KidsPublicTokenService(context))
);

/**
 * Receives the public token for an account and a kid and gets the private token
 */
app.post(
  ADD_TOKEN_URL,
  PrivateAccessTokenController(SaveTokenService(context))
);

app.listen(APP_PORT, () => {
  console.log(`${APP_NAME} server listening on port ${APP_PORT}`);
});
