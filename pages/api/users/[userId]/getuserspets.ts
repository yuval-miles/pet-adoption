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
        query: { userId },
      } = req;
      switch (method) {
        case "GET":
          const pets = await prisma.petAdoptionStatus.findMany({
            where: {
              userId: userId as string,
            },
            include: {
              pet: true,
            },
          });
          return res.status(200).json({ message: "success", response: pets });
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
