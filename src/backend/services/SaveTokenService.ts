import { Context } from '../interfaces/Context';

export function SaveTokenService({db, client}: Context) {
  return async (kid: string, publicToken: string) => {
    db.savePublicTokenForKid(kid, publicToken);
    const { access_token } = await client.exchangePublicToken(publicToken);
    db.savePrivateTokenForKid(kid, access_token);
  };
}
