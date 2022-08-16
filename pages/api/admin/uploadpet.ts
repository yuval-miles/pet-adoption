import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { z } from "zod";
import { prisma } from "../../../utils/primsa";

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
          const pet = await prisma.pet.create({
            data: uploadData,
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
