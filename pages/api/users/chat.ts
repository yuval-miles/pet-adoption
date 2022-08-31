import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";
import { z } from "zod";
import { pusher } from "../../../utils/pusher";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  userName: z.string(),
  message: z.string().min(1),
  userId: z.string().min(1),
  roomName: z.string().min(1),
});

export default errorHandler(
  withAuth(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
      method,
      body: { userName, message, userId, roomName },
    } = req;
    BodySchema.parse(req.body);
    switch (method) {
      case "POST":
        let room = await prisma.rooms.findUnique({
          where: {
            userId: roomName.split("-")[2],
          },
        });
        if (!room)
          room = await prisma.rooms.create({
            data: {
              userId,
            },
          });
        const messageDB = await prisma.messages.create({
          data: {
            senderId: userId,
            roomId: room.userId,
            userName,
            message,
          },
        });
        await pusher.trigger(roomName, "chat-event", {
          message,
          userName,
          createdAt: new Date().toISOString(),
          id: messageDB.id,
          roomId: messageDB.roomId,
          senderId: messageDB.senderId,
        });
        res.status(200).json({ message: "success", response: "message sent" });
        break;
      default:
        res.setHeader("Allow", ["POST"]);
        res.status(405).json({
          message: "failed",
          response: `Method ${method} Not Allowed`,
        });
    }
  })
);
