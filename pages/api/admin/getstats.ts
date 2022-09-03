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
          const totalUsers = await prisma.user.findMany({
            select: {
              createdAt: true,
              name: true,
              firstName: true,
              lastName: true,
              id: true,
            },
          });
          const totalPets = await prisma.pet.count();
          const petsStatus = await prisma.petAdoptionStatus.groupBy({
            by: ["status"],
            _count: {
              status: true,
            },
          });
          const petLogs = await prisma.petLogs.findMany({
            include: {
              pet: {
                select: {
                  name: true,
                },
              },
              user: {
                select: {
                  name: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          });
          return res.status(200).json({
            message: "success",
            response: { totalUsers, totalPets, petsStatus, petLogs },
          });
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
