import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";

interface Data {
  message: string;
  response: object | string;
}

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const { method } = req;
      switch (method) {
        case "GET":
          const inquiries = await prisma.inquiry.findMany({
            include: {
              user: {
                select: {
                  name: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });
          res.status(200).json({ message: "success", response: inquiries });
          break;
        default:
          res.setHeader("Allow", ["GET"]);
          res.status(405).json({
            message: "failed",
            response: `Method ${method} Not Allowed`,
          });
      }
    },
    { admin: true }
  )
);
