import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import shallow from "zustand/shallow";
import { useChatStore } from "../store/chat";
import { useNotifications } from "../store/notifications";
import { RoomResponse, MessageType } from "../types/types";
import axiosClient from "../utils/axiosClient";
import { pusher } from "../utils/clientPusher";

const useChat = () => {
  const { data: userData, status } = useSession();
  const addNotification = useNotifications((state) => state.addNotification);
  const {
    setAdminRooms,
    setUserRoom,
    addMessage,
    addMessageToRoom,
    changeRoomStatus,
    changeAdminRoomState,
    changeUserRoomState,
    clearUserRoom,
    setRefetchUserRoom,
  } = useChatStore(
    (state) => ({
      setUserRoom: state.setUserRoom,
      addMessage: state.addMessage,
      changeRoomStatus: state.changeRoomStatus,
      addMessageToRoom: state.addMessageToRoom,
      setAdminRooms: state.setAdminRooms,
      changeUserRoomState: state.changeUserRoomState,
      changeAdminRoomState: state.changeAdminRoomState,
      clearUserRoom: state.clearUserRoom,
      setRefetchUserRoom: state.setRefeshUserRoom,
    }),
    shallow
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
        if (pusher.allChannels().length)
          pusher.allChannels().map((el) => pusher.unsubscribe(el.name));
        setAdminRooms(data.response);
        setRefetchUserRoom(getAdminRooms);
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
            if (message.senderId !== userData!.id)
              addNotification({
                type: "userChat",
                userName: message.userName,
                createdAt: message.createdAt,
              });
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
    else if (status === "unauthenticated") {
      pusher.allChannels().map((el) => pusher.unsubscribe(el.name));
      clearUserRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  useEffect(() => {
    return () => {
      pusher.allChannels().map((el) => {
        pusher.unsubscribe(el.name);
      });
    };
  }, []);
};

export default useChat;
