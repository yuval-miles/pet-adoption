import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import MessageIcon from "@mui/icons-material/Message";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import { AxiosError } from "axios";
import useUserInfo from "../hooks/useUserInfo";
import SendIcon from "@mui/icons-material/Send";
import { useChatStore } from "../store/chat";
import { DateTime } from "luxon";

const MessageComp = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { userRoom } = useChatStore((state) => ({
    userRoom: state.chatState.userRoom,
  }));
  const { userData, data } = useUserInfo();
  const { mutate: sendMessage } = useMutation<
    { message: string; response: string },
    AxiosError,
    { message: string; userName: string; userId: string; roomName: string }
  >(async (data) => (await axiosClient.post("/users/chat", data)).data);
  const { mutate: reopenChat } = useMutation<
    { message: string; response: string },
    AxiosError,
    { userId: string }
  >(
    async (data) =>
      (await axiosClient.post(`/users/${data.userId}/openchat`, data)).data
  );
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
            {"status" in userRoom && userRoom.status !== "Open" && (
              <>
                <Alert
                  severity={
                    "status" in userRoom && userRoom.status === "Closed"
                      ? "success"
                      : "error"
                  }
                >
                  {"status" in userRoom && userRoom.status === "Closed" ? (
                    <>
                      <Stack>
                        <Typography>An admin has closed this chat</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            reopenChat({ userId: data!.id as string })
                          }
                        >
                          Re-Open Chat
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    "You have been banned from using the chat"
                  )}
                </Alert>
              </>
            )}
            {"messages" in userRoom && (
              <>
                {userRoom?.messages.map((el, idx, arr) => (
                  <Stack key={el.id} gap={1}>
                    {idx === arr.length - 1 ? (
                      <Chip
                        sx={{ width: "fit-content", alignSelf: "center" }}
                        label={`${DateTime.fromISO(el.createdAt).monthLong} ${
                          DateTime.fromISO(el.createdAt).day
                        }`}
                      />
                    ) : DateTime.fromISO(arr[idx + 1]?.createdAt).day !==
                      DateTime.fromISO(arr[idx].createdAt).day ? (
                      <>
                        <Chip
                          sx={{ width: "fit-content", alignSelf: "center" }}
                          label={`${
                            DateTime.fromISO(arr[idx]?.createdAt).monthLong
                          } ${DateTime.fromISO(arr[idx]?.createdAt).day}`}
                        />
                      </>
                    ) : (
                      <></>
                    )}
                    <Box
                      sx={{
                        backgroundColor:
                          el.senderId === data.id ? "#067ffe" : "#e5e5ea",
                        color: el.senderId === data.id ? "white" : "black",
                        padding: "8px",
                        borderRadius: "5px",
                        width: "fit-content",
                        alignSelf:
                          el.senderId === data.id ? "flex-end" : "flex-start",
                      }}
                    >
                      <Stack direction={"row"} gap={1}>
                        <Stack>
                          <Typography>{el.userName}</Typography>
                          <Typography sx={{ wordBreak: "break-word" }}>
                            {el.message}
                          </Typography>
                        </Stack>
                        <Stack justifyContent={"flex-end"}>
                          {DateTime.fromISO(el.createdAt).toFormat("HH:mm")}
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                ))}
              </>
            )}
          </Stack>
        )}
        <TextField
          placeholder="Message..."
          size="small"
          disabled={"status" in userRoom && userRoom.status !== "Open"}
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
