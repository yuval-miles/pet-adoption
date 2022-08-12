import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { PrismaClient } from "@prisma/client";
import type { UserResponse } from "../../../types/userTypes";

const prisma = new PrismaClient();

interface Data {
  message: string;
  response: string | UserResponse;
}

export default errorHandler(
  withAuth(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
      method,
      query: { userId },
    } = req;
    switch (method) {
      case "GET":
        const user = await prisma.user.findFirst({
          where: {
            id: userId as string,
          },
        });
        if (user) {
          const response: UserResponse = {
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name as string,
            phoneNumber: user.phoneNumber,
            email: user.email as string,
            image: user.image,
          };
          res.status(200).json({
            message: "success",
            response,
          });
        } else
          res.status(200).json({
            message: "success",
            response: "User not found",
          });
        break;
      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({
          message: "failed",
          response: `Method ${method} Not Allowed`,
        });
    }
  })
);
