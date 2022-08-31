import { Messages, Rooms } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";
import { pusher } from "../../../utils/pusher";

type RoomReturnType = (Rooms & { messages: Messages[]; online?: boolean })[];
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
          const pusherRes = await pusher.get({ path: "/channels" });
          if (pusherRes.status !== 200)
            throw new Error("Unable to connect to pusher");
          const body = await pusherRes.json();
          const channelsInfo = body.channels;
          const rooms: RoomReturnType = await prisma.rooms.findMany({
            where: {
              status: "Open",
            },
            include: {
              messages: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          });
          for (const room of rooms)
            if (channelsInfo?.[`userChat-id-${room.userId}`])
              room.online = true;
            else room.online = false;
          res.status(200).json({ message: "success", response: rooms });
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
