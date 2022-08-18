import { NextApiRequest, NextApiResponse } from "next/types";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";
import { z } from "zod";
import type { UserResponse } from "../../../types/types";

interface Data {
  message: string;
  response: string | UserResponse[];
}

const QuerySchema = z.object({
  querytype: z.string(),
  query: z.string(),
});

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        query: { querytype, query },
      } = req;
      QuerySchema.parse(req.query);
      switch (method) {
        case "GET":
          const users = await prisma.user.findMany({
            where: {
              AND: {
                [querytype as string]: {
                  contains: query,
                },
                role: "user",
              },
            },
          });
          const resArr = users.map((user) => {
            return {
              firstName: user.firstName,
              lastName: user.lastName,
              name: user.name as string,
              phoneNumber: user.phoneNumber,
              email: user.email as string,
              image: user.image,
              id: user.id,
            };
          });
          return res.status(200).json({ message: "success", response: resArr });
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
