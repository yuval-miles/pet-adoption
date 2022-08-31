import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../../API_middleware/errorHandler";
import withAuth from "../../../../API_middleware/withAuth";
import { prisma } from "../../../../utils/primsa";

interface Data {
  message: string;
  response: object | null | string;
}

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        query: { userId },
      } = req;
      switch (method) {
        case "GET":
          const room = await prisma.rooms.findUnique({
            where: {
              userId: userId as string,
            },
            include: {
              messages: {
                where: {
                  roomId: userId as string,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          });
          res.status(200).json({ message: "success", response: room });
          break;
        default:
          res.setHeader("Allow", ["GET"]);
          res.status(405).json({
            message: "failed",
            response: `Method ${method} Not Allowed`,
          });
      }
    },
    { privateRoute: true }
  )
);
