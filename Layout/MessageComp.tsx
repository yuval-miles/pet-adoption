import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import MessageIcon from "@mui/icons-material/Message";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import { AxiosError } from "axios";
import useUserInfo from "../hooks/useUserInfo";
import SendIcon from "@mui/icons-material/Send";
import type { MessageType, RoomResponse } from "../types/types";

const MessageComp = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    {
      message: string;
      userName: string;
      createdAt: string;
      roomId: string;
      senderId: string;
      id: string;
    }[]
  >([]);
  const { userData, isSuccess: fetchedUserData, data } = useUserInfo();
  const { mutate: sendMessage } = useMutation<
    { message: string; response: string },
    AxiosError,
    { message: string; userName: string; userId: string; roomName: string }
  >(async (data) => (await axiosClient.post("/users/chat", data)).data);
  const handleSendMessage = () => {
    if (!userData?.response) return;
    sendMessage({
      userId,
      message: input,
      userName: userData.response?.firstName
        ? `${userData.response.firstName} ${userData.response.lastName}`
        : userData.response.name,
      roomName: `userChat-id-${userId}`,
    });
    setInput("");
  };
  const {
    isError,
    error,
    refetch: getUserRoom,
  } = useQuery<{ message: string; response: RoomResponse }, AxiosError>(
    ["userRoom"],
    async () => (await axiosClient.get(`/users/${data!.id}/getroom`)).data,
    {
      enabled: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.response) setMessages(data.response.messages);
      },
    }
  );
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: "eu",
    });
    const channel = pusher.subscribe(`userChat-id-${userId}`);
    channel.bind(
      "chat-event",
      ({ message, userName, createdAt, id, senderId, roomId }: MessageType) => {
        setMessages((state) => [
          { userName, message, createdAt, id, senderId, roomId },
          ...state,
        ]);
      }
    );
    return () => {
      pusher.unsubscribe(`userChat-id-${userId}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (fetchedUserData) getUserRoom();
  }, [fetchedUserData, getUserRoom]);
  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        bottom: "0px",
        right: "0px",
        height: open ? "450px" : "50px",
        width: "320px",
        overflowY: "hidden",
        transition: "height 0.3s ease-in",
      }}
    >
      <Stack
        direction={"row"}
        justifyContent={"flex-end"}
        gap={2}
        marginTop={"5px"}
        marginRight={"10px"}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography>Ask a question</Typography>
        </Box>
        <IconButton onClick={() => setOpen((state) => !state)}>
          <MessageIcon />
        </IconButton>
      </Stack>
      <Divider sx={{ marginTop: "5px" }} />
      <Stack sx={{ height: "100%" }}>
        {data && (
          <Stack
            sx={{
              height: "360px",
              padding: "10px",
              gap: "5px",
              overflowY: "auto",
              flexDirection: "column-reverse",
            }}
          >
            {messages.map((el) => (
              <Box
                key={el.id}
                sx={{
                  backgroundColor:
                    el.senderId === data.id ? "#e5e5ea" : "#067ffe",
                  color: el.senderId === data.id ? "black" : "white",
                  padding: "8px",
                  borderRadius: "5px",
                  width: "fit-content",
                  alignSelf:
                    el.senderId === data.id ? "flex-end" : "flex-start",
                }}
              >
                <Typography>{el.userName}</Typography>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {el.message}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
        <TextField
          placeholder="Message..."
          size="small"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && userData?.response) handleSendMessage();
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSendMessage}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Paper>
  );
};

export default MessageComp;
