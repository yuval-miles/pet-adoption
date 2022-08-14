import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => Promise<void>;

const withAuth = (
  handler: Handler,
  options?: { admin?: true; privateRoute?: boolean }
) => {
  return async (req: NextApiRequest, res: NextApiResponse<any>) => {
    const token = await getToken({ req });
    if (token) {
      if (options?.privateRoute) {
        if (req.query.userId !== (token.id as string)) {
          throw new Error("Unauthorized");
        }
      }
      if (options?.admin) {
        if (token.role !== "admin") throw new Error("Unauthorized");
      }
      return handler(req, res);
    } else throw new Error("Unauthorized");
  };
};

export default withAuth;
