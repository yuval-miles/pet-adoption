import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  userId: z.string(),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const { method, body } = req;
      BodySchema.parse(body);
      switch (method) {
        case "POST":
          await prisma.user.update({
            where: {
              id: body.userId,
            },
            data: {
              role: "admin",
            },
          });
          res
            .status(200)
            .json({
              message: "success",
              response: "User role changed to admin",
            });
        default:
          res.setHeader("Allow", ["POST"]);
          res.status(405).json({
            message: "failed",
            response: `Method ${method} Not Allowed`,
          });
      }
    },
    { admin: true }
  )
);
