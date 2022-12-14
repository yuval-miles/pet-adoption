import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { z } from "zod";
import { prisma } from "../../../utils/primsa";
import { pusher } from "../../../utils/pusher";

interface Data {
  message: string;
  response: object | string;
}

const bodySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(15),
  color: z.string().min(1).max(50),
  breed: z.string().min(1).max(50),
  adoptionStatus: z.string().min(1),
  hypoallergenic: z.string().min(1),
  dietInput: z.string(),
  bio: z.string().min(1),
  height: z.string().min(1),
  weight: z.string().min(1),
  picture: z.string(),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const { method, body } = req;
      bodySchema.parse(body);
      switch (method) {
        case "POST":
          const uploadData = {
            ...body,
            hypoallergenic: body.hypoallergenic === "Yes" ? true : false,
            weight: parseInt(body.weight),
            height: parseInt(body.height),
            dietaryRes: body.dietInput,
          };
          delete uploadData.dietInput;
          delete uploadData.userId;
          delete uploadData.adoptionStatus;
          const pet = await prisma.pet.create({
            data: uploadData,
          });
          if (body.adoptionStatus !== "Available") {
            await prisma.petAdoptionStatus.create({
              data: {
                status: body.adoptionStatus,
                userId: body.userId,
                petId: body.id,
              },
            });
            await prisma.petLogs.create({
              data: {
                status: body.adoptionStatus,
                userId: body.userId,
                petId: body.id,
              },
            });
          } else {
            await prisma.petLogs.create({
              data: {
                status: "Available",
                userId: null,
                petId: body.id,
              },
            });
          }
          await pusher.trigger("user-notification", "user-notification", {
            type: "addedPet",
            createdAt: new Date().toISOString(),
            petName: body.name,
          });
          return res.status(200).json({ message: "success", response: pet });
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
