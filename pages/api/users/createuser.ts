import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface Data {
  message: string;
  response: string | object;
}

const bodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  password: z.string(),
});

const emailValidator: RegExp =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const phoneNumberValidator: RegExp =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { method, body } = req;
    bodySchema.parse(body);
    const { email, password, phoneNumber, firstName, lastName } = req.body;
    switch (method) {
      case "POST":
        if (
          !emailValidator.test(email) ||
          !phoneNumberValidator.test(phoneNumber)
        )
          res
            .status(400)
            .json({ message: "failed", response: "Validation failed" });
        const hashPass = bcrypt.hashSync(password, 10);
        req.body.password = hashPass;
        req.body.name = firstName + " " + lastName;
        const newUser = await prisma.user.create({ data: body });
        res.status(200).json({ message: "success", response: newUser });
        break;
      default:
        res.setHeader("Allow", ["POST"]);
        res.status(405).json({
          message: "failed",
          response: `Method ${method} Not Allowed`,
        });
    }
  } catch (err) {
    if (err instanceof ZodError)
      res.status(400).json({ message: "failed", response: err.errors });
    else if (err instanceof Error)
      res.status(500).json({ message: "failed", response: err.message });
    else res.status(500).json({ message: "failed", response: "Unknown error" });
  }
}
