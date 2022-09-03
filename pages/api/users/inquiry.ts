import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";
import { z } from "zod";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  reason: z.string().min(1),
  letter: z.string().min(1),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        body: { reason, letter, userId },
      } = req;
      BodySchema.parse(req.body);
      switch (method) {
        case "POST":
          await prisma.inquiry.create({
            data: {
              userId,
              reason,
              letter,
            },
          });
          res
            .status(200)
            .json({ message: "success", response: "Inquiry sent" });
          break;
        default:
          res.setHeader("Allow", ["POST"]);
          res.status(405).json({
            message: "failed",
            response: `Method ${method} Not Allowed`,
          });
      }
    },
    { privateRoute: true }
  )
);
