import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../../API_middleware/errorHandler";
import withAuth from "../../../../API_middleware/withAuth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

interface Data {
  message: string;
  response: string;
}

const bodySchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    password: z.string(),
    email: z.string(),
  })
  .partial()
  .strict();

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        query: { userId },
        body,
      } = req;
      bodySchema.parse(body);
      switch (method) {
        case "PUT":
          await prisma.user.update({
            where: {
              id: userId as string,
            },
            data: { ...body },
          });
          res
            .status(200)
            .json({ message: "success", response: "Updated successfully" });
          break;
        default:
          res.setHeader("Allow", ["PUT"]);
          res.status(405).json({
            message: "failed",
            response: `Method ${method} Not Allowed`,
          });
      }
    },
    { privateRoute: true }
  )
);
