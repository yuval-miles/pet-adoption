import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { pusher } from "../../../utils/pusher";

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
          if (pusherRes.status === 200) {
            const body = await pusherRes.json();
            const channelsInfo = body.channels;
            res
              .status(200)
              .json({ message: "success", response: channelsInfo });
          } else throw new Error("Unable to connect to pusher");
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
