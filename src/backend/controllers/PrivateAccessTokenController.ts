import type { SaveTokenService } from "../services/SaveTokenService";
import { RequestHandler } from "express";
import { TokenFeedback } from "../interfaces/TokenFeedback";

export const PrivateAccessTokenController: (
  service: ReturnType<typeof SaveTokenService>
) => RequestHandler<any, null | { error: any }, TokenFeedback> = (
  service
) => async (request, response) => {
  const { kid, token } = request.body;
  try {
    await service(kid, token);
    response.statusCode = 200;
    response.end();
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.json({ error });
    response.end();
  }
};
