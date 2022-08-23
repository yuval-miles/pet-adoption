import { NextApiRequest, NextApiResponse } from "next/types";
import errorHandler from "../../../../API_middleware/errorHandler";
import withAuth from "../../../../API_middleware/withAuth";
import { prisma } from "../../../../utils/primsa";
import { object, z } from "zod";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.string().min(1).max(15).optional(),
  color: z.string().min(1).max(50).optional(),
  breed: z.string().min(1).max(50).optional(),
  hypoallergenic: z.string().min(1).optional(),
  dietInput: z.string().optional(),
  bio: z.string().min(1).optional(),
  height: z.string().min(1).optional(),
  weight: z.string().min(1).optional(),
  picture: z.string().optional(),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        body,
        query: { petId },
      } = req;
      console.log(body);
      BodySchema.parse(body);
      switch (method) {
        case "PUT":
          const queryArr = Object.entries(body);
          await prisma.pet.update({
            where: {
              id: petId as string,
            },
            data: {
              [queryArr[0][0]]:
                queryArr[0][0] === "weight" || queryArr[0][0] === "height"
                  ? parseFloat(queryArr[0][1] as string)
                  : queryArr[0][1],
            },
          });
          return res.status(200).json({
            message: "success",
            response: `Pet field ${queryArr[0][0]} was updated to ${queryArr[0][1]}`,
          });
        default:
          res.setHeader("Allow", ["PUT"]);
          res.status(405).json({
            message: "failed",
            response: `Method ${method} Not Allowed`,
          });
      }
    },
    { admin: true }
  )
);
