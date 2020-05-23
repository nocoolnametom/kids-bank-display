import * as React from "react";
import { usePlaidLink } from "react-plaid-link";

export interface PlaidMetadata {
  public_token: string;
  link_session_id: string;
  institution: {
    name: string;
    insitution_id: string;
  };
  accounts: {
    id: string;
    name: string;
    mask: string;
    type: "loan" | "depository" | "credit" | "investment";
    subtype: string;
  }[];
}

export interface IProps {
  onSuccess?: (token: string, metadata: PlaidMetadata) => void;
  env: string;
  product: string[];
  publicKey: string;
  countryCodes: string[];
  publicToken: string | null;
}

export const PlaidLink = ({
  env,
  product = [],
  publicKey,
  countryCodes = [],
  publicToken: token,
  onSuccess: successFunc,
}: IProps) => {
  const onSuccess = React.useCallback(
    (token: string, metadata: PlaidMetadata) => {
      if (typeof successFunc === "function") {
        successFunc(token, metadata);
      }
    },
    []
  );

  const config: Parameters<typeof usePlaidLink>[0] = {
    clientName: "RP0-BankBox",
    env,
    product,
    publicKey,
    countryCodes,
    onSuccess,
    // ...
  };

  if (token) {
    config.token = token;
  }

  const { open, ready, error } = usePlaidLink(config);

  return !error ? (
    <button onClick={() => open()} disabled={!ready}>
      {token ? 'Reconnect' : 'Connect a'} bank account
    </button>
  ) : (
    <div>
      Please check adblocker and privacy badger and allow cdn.plaid.com!
    </div>
  );
};
