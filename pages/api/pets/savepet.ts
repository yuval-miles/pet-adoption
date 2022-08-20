import { NextApiRequest, NextApiResponse } from "next/types";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";
import { z } from "zod";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  petId: z.string(),
  userId: z.string(),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const { method, body } = req;
      BodySchema.parse(body);
      switch (method) {
        case "POST":
          const alreadySaved = await prisma.likedPets.findUnique({
            where: {
              userId_petId: {
                userId: body.userId,
                petId: body.petId,
              },
            },
          });
          if (alreadySaved) {
            await prisma.likedPets.delete({
              where: {
                userId_petId: {
                  userId: body.userId,
                  petId: body.petId,
                },
              },
            });
            return res
              .status(200)
              .json({ message: "success", response: "Pet Un-saved" });
          } else {
            await prisma.likedPets.create({
              data: {
                userId: body.userId,
                petId: body.petId,
              },
            });
            return res
              .status(200)
              .json({ message: "success", response: "Pet Saved" });
          }
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
