import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import type { MessageType, RoomResponse } from "../../../types/types";
import { useEffect, useState } from "react";
import ChatList from "./ChatsList";
import Chat from "./Chat";
import Pusher from "pusher-js";

const ChatsComp = () => {
  const [currentChat, setCurrentChat] = useState<number | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const { data, isSuccess, isLoading, isError, error } = useQuery<{
    message: string;
    response: RoomResponse[];
  }>(
    ["getRooms"],
    async () => (await axiosClient.get("/admin/getchats")).data,
    {
      refetchOnWindowFocus: false,
    }
  );
  useEffect(() => {
    if (!isSuccess) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: "eu",
    });
    setRooms(data.response);
    data.response.forEach((room, idx) => {
      const channel = pusher.subscribe(`userChat-id-${room.userId}`);
      channel.bind(
        "pusher:subscription_count",
        ({ subscription_count }: { subscription_count: number }) => {
          setRooms((state) => {
            const newState = [...state];
            if (subscription_count > 1) newState[idx].online = true;
            else newState[idx].online = false;
            return newState;
          });
        }
      );
      channel.bind(
        "chat-event",
        ({
          message,
          userName,
          createdAt,
          id,
          senderId,
          roomId,
        }: MessageType) => {
          setRooms((state) => {
            const newState = [...state];
            newState[idx].messages.unshift({
              message,
              userName,
              createdAt,
              id,
              senderId,
              roomId,
            });
            return newState;
          });
        }
      );
    });
    return () => {
      pusher.allChannels().map((el) => {
        pusher.unsubscribe(el.name);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);
  return (
    <>
      {currentChat !== null ? (
        <Chat chatRoom={rooms[currentChat]} setCurrentChat={setCurrentChat} />
      ) : (
        <ChatList rooms={rooms} setCurrentChat={setCurrentChat} />
      )}
    </>
  );
};
export default ChatsComp;
