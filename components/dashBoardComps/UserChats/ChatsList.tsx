import { Button, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { RoomResponse } from "../../../types/types";
import CircleIcon from "@mui/icons-material/Circle";
import { Dispatch, SetStateAction } from "react";

const ChatList = ({
  rooms,
  setCurrentChat,
}: {
  rooms: RoomResponse[];
  setCurrentChat: Dispatch<SetStateAction<number | null>>;
}) => {
  return (
    <>
      {rooms.length ? (
        <>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(345px, 1fr))",
              gap: "10px",
            }}
          >
            {rooms?.map((el, idx) => (
              <Paper key={el.userId} sx={{ padding: "15px" }}>
                <Stack gap={1}>
                  <Stack direction={"row"} justifyContent={"space-between"}>
                    <Stack gap={2}>
                      <Typography>
                        User: {el.messages[el.messages.length - 1].userName}
                      </Typography>
                      <Typography>
                        Room name: {`userChat-id-${el.userId}`}
                      </Typography>
                      <Typography>#Messages: {el.messages.length}</Typography>
                    </Stack>
                    <Tooltip title={el.online ? "Online" : "Offline"}>
                      <CircleIcon color={el.online ? "success" : "error"} />
                    </Tooltip>
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setCurrentChat(idx)}
                  >
                    Open Chat
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Typography>No current open user rooms</Typography>
        </>
      )}
    </>
  );
};
export default ChatList;
