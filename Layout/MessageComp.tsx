import {
  Box,
  Button,
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
import { v4 as uuid } from "uuid";
import SendIcon from "@mui/icons-material/Send";

interface RoomResponse {
  createdAt: string;
  messages: {
    createdAt: string;
    id: string;
    message: string;
    userName: string;
    roomId: string;
    senderId: string;
  }[];
  status: "Open" | "Closed" | "Banned";
  updatedAt: string;
  userId: string;
}

const MessageComp = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { message: string; userName: string; createdAt: string }[]
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
        const prevMessages = data.response.messages.map((el) => ({
          message: el.message,
          userName: el.userName,
          createdAt: el.createdAt,
        }));
        setMessages(prevMessages);
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
      ({
        message,
        userName,
        createdAt,
      }: {
        message: string;
        userName: string;
        createdAt: string;
      }) => {
        setMessages((state) => [...state, { userName, message, createdAt }]);
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
        <Stack sx={{ height: "360px", padding: "10px", gap: "5px" }}>
          {messages.map((el) => (
            <Box
              key={uuid()}
              sx={{
                backgroundColor: "#ececec",
                color: "black",
                padding: "8px",
                borderRadius: "5px",
                width: "fit-content",
              }}
            >
              <Typography>{el.userName}</Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                {el.message}
              </Typography>
            </Box>
          ))}
        </Stack>
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
