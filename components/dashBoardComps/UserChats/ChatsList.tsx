import {
  Button,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { RoomResponse } from "../../../types/types";
import CircleIcon from "@mui/icons-material/Circle";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const ChatList = ({
  rooms,
  setCurrentChat,
}: {
  rooms: RoomResponse[];
  setCurrentChat: Dispatch<SetStateAction<number | null>>;
}) => {
  const [page, setPage] = useState<"Banned" | "Open" | "Closed">("Open");
  const [currentRooms, setCurrentRooms] = useState<RoomResponse[]>([]);
  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: "Open" | "Closed" | "Banned"
  ) => {
    if (newFilter !== null) {
      setPage(newFilter);
    }
  };
  useEffect(() => {
    setCurrentRooms(rooms.filter((el) => el.status === page));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  return (
    <>
      <ToggleButtonGroup
        value={page}
        exclusive
        onChange={handleToggle}
        aria-label="filter"
        color={"primary"}
      >
        <ToggleButton value="Open" aria-label="open">
          <Stack direction={"row"} gap={2}>
            <Typography>Open Chats</Typography>
          </Stack>
        </ToggleButton>
        <ToggleButton value="Closed" aria-label="closed">
          <Stack direction={"row"} gap={2}>
            <Typography>Closed Chats</Typography>
          </Stack>
        </ToggleButton>
        <ToggleButton value="Banned" aria-label="banned">
          <Stack direction={"row"} gap={2}>
            <Typography>Banned Users</Typography>
          </Stack>
        </ToggleButton>
      </ToggleButtonGroup>
      {currentRooms.length ? (
        <>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(345px, 1fr))",
              gap: "10px",
            }}
          >
            {currentRooms?.map((el, idx) => (
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
                    onClick={() =>
                      setCurrentChat(
                        rooms.findIndex((room) => room.userId === el.userId)
                      )
                    }
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
          <Typography>
            No current {page.toLocaleLowerCase()} user rooms
          </Typography>
        </>
      )}
    </>
  );
};
export default ChatList;
