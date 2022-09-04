import { getToken, JWT } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => Promise<void>;

export interface ResponseWithToken extends NextApiRequest {
  token?: JWT;
}

const withAuth = (
  handler: Handler,
  options?: { admin?: true; privateRoute?: boolean }
) => {
  return async (req: ResponseWithToken, res: NextApiResponse<any>) => {
    const token = await getToken({ req });
    console.log(token);
    if (token) {
      if (options?.privateRoute && token.role !== "admin") {
        if (req.method === "GET") {
          if (req.query.userId !== (token.id as string)) {
            throw new Error("Unauthorized");
          }
        } else {
          if (req.body.userId !== (token.id as string)) {
            throw new Error("Unauthorized");
          }
        }
      }
      if (options?.admin) {
        if (token.role !== "admin") throw new Error("Unauthorized");
      }
      req.token = token;
      return handler(req, res);
    } else throw new Error("Unauthorized");
  };
};

export default withAuth;
