import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../../API_middleware/errorHandler";
import withAuth from "../../../../API_middleware/withAuth";
import { prisma } from "../../../../utils/primsa";

interface Data {
  message: string;
  response: string | Array<object>;
}

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        query: { userId, info },
      } = req;
      if (!info) throw new Error("Please specify info (id or full)");
      switch (method) {
        case "GET":
          if (info === "full") {
            const savedPets = await prisma.likedPets.findMany({
              where: {
                userId: userId as string,
              },
              include: {
                pet: {
                  include: {
                    petAdoptionStatus: {
                      select: {
                        status: true,
                      },
                    },
                  },
                },
              },
            });
            return res
              .status(200)
              .json({ message: "success", response: savedPets });
          } else if (info === "id") {
            const savedPets = await prisma.likedPets.findMany({
              where: {
                userId: userId as string,
              },
            });
            return res
              .status(200)
              .json({ message: "success", response: savedPets });
          }
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
