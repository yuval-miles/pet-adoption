import { NextApiRequest, NextApiResponse } from "next/types";
import errorHandler from "../../../API_middleware/errorHandler";
import { prisma } from "../../../utils/primsa";
import { z } from "zod";
import type { PetSearchResponse } from "../../../types/types";

interface Data {
  message: string;
  response: string | PetSearchResponse[];
}

const QuerySchema = z.object({
  adoptStatus: z.string().optional(),
  type: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  name: z.string().optional(),
  breed: z.string().optional(),
});

export default errorHandler(
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { method, query } = req;
    QuerySchema.parse(query);
    switch (method) {
      case "GET":
        const queryArr = Object.entries(query);
        const queryObj: {
          [key: string]: {
            equals?: string;
            contains?: string;
            gte?: number;
            lte?: number;
          };
        } = {};
        for (const [key, value] of queryArr) {
          switch (key) {
            case "adoptionStatus":
              break;
            case "type":
              queryObj[key] = { equals: value as string };
              break;
            case "name":
            case "breed":
              queryObj[key] = { contains: value as string };
              break;
            case "weight":
            case "height":
              if (typeof value === "string")
                queryObj[key] = {
                  gte: parseInt(value.split("-")[0]),
                  lte: parseInt(value.split("-")[1]),
                };
              else throw new Error("Weight or height value invalid");
              break;
            default:
              throw new Error("Invalid query string");
          }
        }
        const pets = await prisma.pet.findMany({
          where: {
            AND: queryObj,
          },
          include: {
            petAdoptionStatus: {
              select: {
                status: true,
              },
            },
          },
        });
        let retArr = pets.map((el) => ({
          adoptionStatus: el.petAdoptionStatus[0]?.status
            ? el.petAdoptionStatus[0]?.status
            : "Available",
          picture: el.picture,
          breed: el.breed,
          height: el.height,
          weight: el.weight,
          type: el.type,
          name: el.name,
          petId: el.id,
        }));
        if (query?.adoptionStatus)
          retArr = retArr.filter(
            (el) => el.adoptionStatus === query.adoptionStatus
          );
        return res.json({ message: "success", response: retArr });
      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({
          message: "failed",
          response: `Method ${method} Not Allowed`,
        });
    }
  }
);
