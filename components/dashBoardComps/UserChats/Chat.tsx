import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { RoomResponse } from "../../../types/types";
import { Dispatch, SetStateAction, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import useUserInfo from "../../../hooks/useUserInfo";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import { AxiosError } from "axios";

const Chat = ({
  chatRoom,
  setCurrentChat,
}: {
  chatRoom: RoomResponse;
  setCurrentChat: Dispatch<SetStateAction<number | null>>;
}) => {
  const [input, setInput] = useState("");
  const { userData, data } = useUserInfo();
  const { mutate: sendMessage } = useMutation<
    { message: string; response: string },
    AxiosError,
    { message: string; userName: string; userId: string; roomName: string }
  >(async (data) => (await axiosClient.post("/users/chat", data)).data);
  const handleSendMessage = () => {
    if (!userData?.response) return;
    sendMessage({
      userId: data!.id as string,
      message: input,
      userName: userData.response?.firstName
        ? `${userData.response.firstName} ${userData.response.lastName}`
        : userData.response.name,
      roomName: `userChat-id-${chatRoom.userId}`,
    });
    setInput("");
  };
  return (
    <>
      <Paper sx={{ width: "100%", height: "calc(100vh - 300px)" }}>
        <Stack
          direction={"row"}
          sx={{ padding: "15px" }}
          justifyContent={"space-between"}
        >
          <Stack direction={"row"} gap={3} alignItems={"center"}>
            <CircleIcon color={chatRoom.online ? "success" : "error"} />
            <Typography variant="h4">{`User: ${
              chatRoom.messages[chatRoom.messages.length - 1].userName
            }`}</Typography>
          </Stack>
          <Stack direction={"row"} gap={2}>
            <Button onClick={() => setCurrentChat(null)} variant="outlined">
              Close Chat
            </Button>
            <Button onClick={() => setCurrentChat(null)} variant="outlined">
              Ban User
            </Button>
            <Button onClick={() => setCurrentChat(null)} variant="contained">
              Back
            </Button>
          </Stack>
        </Stack>
        <Divider />
        <Stack height={"88.8%"} justifyContent={"space-between"}>
          <Stack sx={{ overflowY: "auto" }}>
            {data && (
              <Stack
                sx={{
                  padding: "10px",
                  gap: "5px",
                  overflowY: "auto",
                  flexDirection: "column-reverse",
                }}
              >
                {chatRoom.messages.map((el) => (
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
          </Stack>
          <TextField
            placeholder="Message..."
            autoComplete="off"
            value={input}
            fullWidth
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
    </>
  );
};

export default Chat;
