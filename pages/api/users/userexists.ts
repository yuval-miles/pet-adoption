import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";

const prisma = new PrismaClient();

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
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
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ message: "failed", response: err });
    else if (err instanceof ZodError)
      res.status(400).json({ message: "failed", response: err.errors });
    else res.status(500).json({ message: "failed", response: "Unknown error" });
  }
}
