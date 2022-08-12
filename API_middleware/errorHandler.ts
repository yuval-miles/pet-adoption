import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => Promise<void>;

export default function errorHandler(handler: Handler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return handler(req, res).catch((error) => {
      console.error(error);
      switch (true) {
        case error instanceof Error:
          if (error.message === "Unauthorized")
            return res.status(403).send(error.message);
          return res.status(500).send(error.message);
        case error instanceof ZodError:
          res.status(400).json({ message: "failed", response: error.errors });
        default:
          res.status(500).json({ message: "failed", response: error });
      }
    });
  };
}
