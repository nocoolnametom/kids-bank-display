import { Context } from '../interfaces/Context';

export function SaveTokenService({db, client}: Context) {
  return async (kid: string, publicToken?: string|null|undefined) => {
    db.savePublicTokenForKid(kid, publicToken || null);
    const { access_token } = publicToken ? await client.exchangePublicToken(publicToken) : { access_token: null };
    db.savePrivateTokenForKid(kid, access_token);
  };
}
