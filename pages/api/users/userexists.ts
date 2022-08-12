import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import { z } from "zod";
import { prisma } from "../../../utils/primsa";
interface Data {
  message: string;
  response: string | object;
}

const QuerySchema = z
  .object({
    email: z.string(),
  })
  .partial()
  .strict();

export default errorHandler(
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
      method,
      query: { email },
    } = req;
    QuerySchema.parse(req.query);
    switch (method) {
      case "GET":
        const exists = await prisma.user.findFirst({
          where: {
            email: email as string,
          },
        });
        if (exists) {
          res.status(200).json({
            message: "success",
            response: { emailExists: true },
          });
        } else
          res.status(200).json({
            message: "success",
            response: { emailExists: false },
          });
        break;
      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({
          message: "failed",
          response: `Method ${method} Not Allowed`,
        });
    }
  }
);
