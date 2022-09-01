import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import errorHandler from "../../../../API_middleware/errorHandler";
import withAuth from "../../../../API_middleware/withAuth";
import { prisma } from "../../../../utils/primsa";
import { pusher } from "../../../../utils/pusher";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  userId: z.string().min(1),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        body: { userId },
      } = req;
      switch (method) {
        case "POST":
          await prisma.rooms.update({
            where: {
              userId,
            },
            data: {
              status: "Open",
            },
          });
          await pusher.trigger(`userChat-id-${userId}`, "status-event", {
            statusEvent: "Open",
          });
          res.status(200).json({ message: "success", response: "chat opened" });
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
