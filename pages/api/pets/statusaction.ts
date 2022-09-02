import { NextApiResponse } from "next/types";
import errorHandler from "../../../API_middleware/errorHandler";
import withAuth, { ResponseWithToken } from "../../../API_middleware/withAuth";
import { prisma } from "../../../utils/primsa";
import { z } from "zod";
import { pusher } from "../../../utils/pusher";

interface Data {
  message: string;
  response: string;
}

const BodySchema = z.object({
  petId: z.string(),
  userId: z.string(),
  action: z.enum(["Return", "Foster", "Adopt"]),
  userName: z.string(),
});

export default errorHandler(
  withAuth(
    async (req: ResponseWithToken, res: NextApiResponse<Data>) => {
      if (!req.token) throw new Error("Unauthorized");
      const { method, body } = req;
      BodySchema.parse(body);
      switch (method) {
        case "POST":
          const petStatus = await prisma.petAdoptionStatus.findUnique({
            where: {
              petId: body.petId,
            },
          });
          switch (body.action) {
            case "Return":
              if (!petStatus)
                throw new Error(
                  "Cannot return pet, Pet not adopted or fostered"
                );
              else {
                if (petStatus.userId !== req.token.id)
                  throw new Error("Unauthorized");
                await prisma.petAdoptionStatus.delete({
                  where: {
                    petId: body.petId,
                  },
                });
                await prisma.petLogs.create({
                  data: {
                    status: "Available",
                    petId: body.petId,
                  },
                });
                sendNotification("Returned", body.userName, body.petId);
                return res
                  .status(200)
                  .json({ message: "success", response: "Returned" });
              }
            case "Adopt":
              if (!petStatus) {
                await prisma.petAdoptionStatus.create({
                  data: {
                    userId: body.userId,
                    petId: body.petId,
                    status: "Adopted",
                  },
                });
                await prisma.petLogs.create({
                  data: {
                    status: "Adopted",
                    petId: body.petId,
                    userId: body.userId,
                  },
                });
                sendNotification("Adopted", body.userName, body.petId);
                return res
                  .status(200)
                  .json({ message: "success", response: "Adopted" });
              } else {
                if (petStatus.userId !== req.token.id)
                  throw new Error("Unauthorized");
                await prisma.petAdoptionStatus.update({
                  where: {
                    petId: body.petId,
                  },
                  data: {
                    status: "Adopted",
                  },
                });
                await prisma.petLogs.create({
                  data: {
                    status: "Adopted",
                    petId: body.petId,
                    userId: body.userId,
                  },
                });
                sendNotification("Adopted", body.userName, body.petId);
                return res
                  .status(200)
                  .json({ message: "success", response: "Adopted" });
              }
            case "Foster":
              if (!petStatus) {
                await prisma.petAdoptionStatus.create({
                  data: {
                    userId: body.userId,
                    petId: body.petId,
                    status: "Fostered",
                  },
                });
                await prisma.petLogs.create({
                  data: {
                    status: "Fostered",
                    petId: body.petId,
                    userId: body.userId,
                  },
                });
                sendNotification("Fostered", body.userName, body.petId);
                return res
                  .status(200)
                  .json({ message: "success", response: "Fostered" });
              } else {
                if (petStatus.userId !== req.token.id)
                  throw new Error("Unauthorized");
                if (petStatus.status === "Adopted")
                  throw new Error(
                    "Cannot return to fostered after you have already adopted a pet"
                  );
                await prisma.petAdoptionStatus.update({
                  where: {
                    petId: body.petId,
                  },
                  data: {
                    status: "Fostered",
                  },
                });
                await prisma.petLogs.create({
                  data: {
                    status: "Fostered",
                    petId: body.petId,
                    userId: body.userId,
                  },
                });
                sendNotification("Fostered", body.userName, body.petId);
                return res
                  .status(200)
                  .json({ message: "success", response: "Fostered" });
              }
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

const sendNotification = async (
  statusAction: string,
  userName: string,
  petId: string
) => {
  await pusher.trigger("admin-notification", "admin-notification", {
    type: "petStatusChange",
    createdAt: new Date().toISOString(),
    userName,
    petId,
    statusAction,
  });
};
