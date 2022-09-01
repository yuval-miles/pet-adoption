import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect, useMemo } from "react";
import shallow from "zustand/shallow";
import { useChatStore } from "../store/chat";
import { RoomResponse, MessageType } from "../types/types";
import axiosClient from "../utils/axiosClient";

const useChat = () => {
  const { data: userData, status } = useSession();
  const {
    setAdminRooms,
    setUserRoom,
    addMessage,
    addMessageToRoom,
    changeRoomStatus,
    changeAdminRoomState,
    changeUserRoomState,
  } = useChatStore(
    (state) => ({
      setUserRoom: state.setUserRoom,
      addMessage: state.addMessage,
      changeRoomStatus: state.changeRoomStatus,
      addMessageToRoom: state.addMessageToRoom,
      setAdminRooms: state.setAdminRooms,
      changeUserRoomState: state.changeUserRoomState,
      changeAdminRoomState: state.changeAdminRoomState,
    }),
    shallow
  );
  const pusher = useMemo(
    () =>
      new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
        cluster: "eu",
      }),
    []
  );
  const { refetch: getAdminRooms } = useQuery<
    {
      message: string;
      response: RoomResponse[];
    },
    AxiosError
  >(
    ["adminRooms"],
    async () => (await axiosClient.get("/admin/getchats")).data,
    {
      refetchOnWindowFocus: false,
      enabled: false,
      onSuccess: (data) => {
        setAdminRooms(data.response);
        data.response.forEach((room, idx) => {
          const channel = pusher.subscribe(`userChat-id-${room.userId}`);
          channel.bind(
            "pusher:subscription_count",
            ({ subscription_count }: { subscription_count: number }) => {
              let status;
              if (subscription_count > 1) status = true;
              else status = false;
              changeRoomStatus(status, idx);
            }
          );
          channel.bind("chat-event", (message: MessageType) => {
            addMessageToRoom(message, idx);
          });
          channel.bind(
            "status-event",
            ({
              statusEvent,
            }: {
              statusEvent: "Open" | "Closed" | "Banned";
            }) => {
              changeAdminRoomState(statusEvent, idx);
            }
          );
        });
      },
    }
  );
  const { refetch: getUserRoom } = useQuery<
    { message: string; response: RoomResponse },
    AxiosError
  >(
    ["userRoom"],
    async () => (await axiosClient.get(`/users/${userData!.id}/getroom`)).data,
    {
      enabled: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.response) setUserRoom(data.response);
        const channel = pusher.subscribe(`userChat-id-${userData!.id}`);
        channel.bind("chat-event", (message: MessageType) => {
          addMessage(message);
        });
        channel.bind(
          "status-event",
          ({ statusEvent }: { statusEvent: "Open" | "Closed" | "Banned" }) => {
            changeUserRoomState(statusEvent);
          }
        );
      },
    }
  );
  useEffect(() => {
    if (status === "authenticated" && userData.role === "admin")
      getAdminRooms();
    else if (status === "authenticated" && userData.role === "user")
      getUserRoom();
    else if (status === "unauthenticated")
      pusher.allChannels().map((el) => pusher.unsubscribe(el.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  useEffect(() => {
    return () => {
      pusher.allChannels().map((el) => {
        pusher.unsubscribe(el.name);
      });
    };
  }, [pusher]);
};

export default useChat;
