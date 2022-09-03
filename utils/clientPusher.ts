import Pusher from "pusher-js";

export const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
  cluster: "eu",
});
