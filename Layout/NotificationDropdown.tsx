import { Alert, Paper, Stack, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { Dispatch, useEffect, useState } from "react";
import { useNotifications } from "../store/notifications";
import { DateTime } from "luxon";
import { Box } from "@mui/system";

const NotificationDropdown = ({
  showNotifications,
  setNewNotifications,
}: {
  showNotifications: boolean;
  setNewNotifications: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { status, data } = useSession();
  const [seenNotifications, setSeenNotifications] = useState(0);
  const { addNotification, notifications, clearNotifications } =
    useNotifications((state) => ({
      addNotification: state.addNotification,
      notifications: state.notifications,
      clearNotifications: state.clearNotifications,
    }));
  useEffect(() => {
    if (showNotifications) setSeenNotifications(notifications.length);
    if (!showNotifications && seenNotifications < notifications.length)
      setNewNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNotifications, notifications.length]);
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: "eu",
    });
    if (status === "authenticated" && data.role === "admin") {
      const channel = pusher.subscribe("admin-notification");
      channel.bind(
        "admin-notification",
        ({
          type,
          createdAt,
          userName,
          petId,
          statusAction,
        }: {
          type: "addedPet" | "userChat" | "petStatusChange";
          createdAt: string;
          userName: string;
          petId: string;
          statusAction: "Adopted" | "Returned" | "Fostered";
        }) => {
          console.log("test");
          if (!showNotifications) setNewNotifications(true);
          addNotification({
            type,
            createdAt,
            userName,
            petId,
            statusAction,
          });
        }
      );
    } else if (status === "authenticated" && data.role === "user") {
      console.log("test");
      const channel = pusher.subscribe("user-notification");
      channel.bind(
        "user-notification",
        ({
          type,
          createdAt,
          petName,
        }: {
          type: "addedPet" | "userChat" | "petStatusChange";
          createdAt: string;
          petName: string;
        }) => {
          addNotification({
            type,
            createdAt,
            petName,
          });
        }
      );
    }
    return () => {
      pusher.allChannels().map((el) => {
        pusher.unsubscribe(el.name);
      });
      if (status === "unauthenticated") clearNotifications();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <Paper
      sx={{
        width: "300px",
        maxHeight: showNotifications ? "400px" : 0,
        position: "absolute",
        right: 0,
        top: 66,
        overflow: "auto",
        transition: "max-height 0.3s ease-in",
      }}
    >
      <Stack sx={{ padding: "10px" }} gap={2}>
        {notifications.length ? (
          <>
            {notifications.map((el, idx) => (
              <Paper key={el.createdAt + idx}>
                {el.type === "userChat" ? (
                  <>
                    <Alert severity="info">
                      <Stack gap={1}>
                        <Typography>
                          {el.userName} has sent a message
                        </Typography>
                        <Typography>
                          {DateTime.fromISO(el.createdAt).toFormat("DD:HH:mm")}
                        </Typography>
                      </Stack>
                    </Alert>
                  </>
                ) : el.type === "petStatusChange" ? (
                  <>
                    <Alert severity="info">
                      <Stack gap={1}>
                        <Typography>
                          {el.userName} has {el.statusAction}
                        </Typography>
                        <Typography>{el.petId}</Typography>
                        <Typography>
                          {DateTime.fromISO(el.createdAt).toFormat("DD:HH:mm")}
                        </Typography>
                      </Stack>
                    </Alert>
                  </>
                ) : (
                  <>
                    <Alert severity="info">
                      <Stack gap={1}>
                        <Typography>
                          A new pet has been added!: {el.petName}
                        </Typography>
                        <Typography>
                          {DateTime.fromISO(el.createdAt).toFormat("DD:HH:mm")}
                        </Typography>
                      </Stack>
                    </Alert>
                  </>
                )}
              </Paper>
            ))}
          </>
        ) : (
          <>
            <Typography>You currently have no notifications</Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
};
export default NotificationDropdown;
