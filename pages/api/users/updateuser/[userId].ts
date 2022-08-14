import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../../API_middleware/errorHandler";
import withAuth from "../../../../API_middleware/withAuth";
import { prisma } from "../../../../utils/primsa";
import { z } from "zod";
import * as bcrypt from "bcrypt";

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

type BodyType = z.infer<typeof bodySchema>;

const emailValidator: RegExp =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const phoneNumberValidator: RegExp =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        query: { userId },
        body,
      } = req;
      console.log(body);
      bodySchema.parse(body);
      if (
        (!emailValidator.test(body.email) && body.email) ||
        (!phoneNumberValidator.test(body.phoneNumber) && body.phoneNumber)
      )
        throw new Error("Validation Failed");
      switch (method) {
        case "PUT":
          const newBody: BodyType = { ...body };
          if (newBody.password)
            newBody.password = bcrypt.hashSync(newBody.password, 10);
          await prisma.user.update({
            where: {
              id: userId as string,
            },
            data: { ...newBody },
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
