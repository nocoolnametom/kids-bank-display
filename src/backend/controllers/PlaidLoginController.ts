import type { RequestHandler } from "express";
import type { FrontendConfig } from "../interfaces/FrontendConfig";
import type { KidsPublicTokenService } from "../services/KidsPublicTokenService";

export const PlaidLoginController: (
  pushUrl: string,
  plaidConfig: {
    publicKey: string,
    env: string,
    products: string[],
    countryCodes: string[],
  },
  service: ReturnType<typeof KidsPublicTokenService>
) => RequestHandler<{}> = (pushUrl, {publicKey, env, products, countryCodes}, service) => ({}, response) => {
  const accounts = service();

  const frontendConfig: FrontendConfig = {
    publicKey,
    env,
    products,
    countryCodes,
    accounts,
    pushUrl,
  };

  response.render("login.ejs", {
    frontendConfig: JSON.stringify(frontendConfig),
  });
};
