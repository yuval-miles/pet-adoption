import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import { prisma } from "../../../utils/primsa";
import { z } from "zod";
import * as bcrypt from "bcrypt";

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

export default errorHandler(
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { method, body } = req;
    bodySchema.parse(body);
    const { email, password, phoneNumber, firstName, lastName } = req.body;
    switch (method) {
      case "POST":
        if (
          !emailValidator.test(email) ||
          !phoneNumberValidator.test(phoneNumber)
        )
          throw new Error("Validation Failed");
        const hashPass = bcrypt.hashSync(password, 10);
        req.body.password = hashPass;
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
  }
);
