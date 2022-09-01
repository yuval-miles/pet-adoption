import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";
import { pusher } from "../../../utils/pusher";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  userId: z.string(),
  roomStatus: z.string(),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        body: { userId, roomStatus },
      } = req;
      BodySchema.parse(req.body);
      switch (method) {
        case "POST":
          const room = await prisma.rooms.findUnique({
            where: {
              userId,
            },
          });
          if (!room) throw new Error("The room provided dose not exist");
          await prisma.rooms.update({
            where: {
              userId,
            },
            data: {
              status: roomStatus,
            },
          });
          await pusher.trigger(`userChat-id-${userId}`, "status-event", {
            statusEvent: roomStatus,
          });
          res
            .status(200)
            .json({ message: "success", response: "status updated" });
          break;
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
