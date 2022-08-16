import type { NextApiRequest, NextApiResponse } from "next";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth from "../../../API_middleware/withAuth";
import { generateUploadUrl } from "../../../utils/s3";

interface Data {
  message: string;
  response: string;
}

export default errorHandler(
  withAuth(
    async (req: NextApiRequest, res: NextApiResponse<Data>) => {
      const {
        method,
        query: { filename, path },
      } = req;
      switch (method) {
        case "GET":
          const url = await generateUploadUrl(
            ((path as string) + filename) as string
          );
          return res.status(200).json({ message: "success", response: url });
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
