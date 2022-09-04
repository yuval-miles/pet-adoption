import {
  Alert,
  Box,
  Button,
  Collapse,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import Navigation from "../Layout/Navigation";
import axiosClient from "../utils/axiosClient";

const ContactUs = () => {
  const router = useRouter();
  const { data, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [inputs, setInputs] = useState({ reason: "", letter: "" });
  const [alert, setAlert] = useState<{
    status: "success" | "error";
    message: string;
    show: boolean;
  }>({
    status: "success",
    message: "",
    show: false,
  });
  const { mutate: sendInquiry } = useMutation<
    { message: string; response: string },
    AxiosError,
    { userId: string; reason: string; letter: string }
  >(async (data) => (await axiosClient.post("/users/inquiry", data)).data, {
    onSuccess: (data) => {
      setAlert({ show: true, message: data.response, status: "success" });
      setTimeout(
        () => setAlert({ show: false, message: "", status: "success" }),
        3000
      );
    },
    onError: (error) => {
      setAlert({ show: true, message: error.message, status: "error" });
    },
  });
  const handleChange =
    (field: "reason" | "letter") =>
    (
      event:
        | SelectChangeEvent
        | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (field === "reason")
        setInputs((state) => ({
          ...state,
          reason: event.target.value as string,
        }));
      else if (field === "letter")
        setInputs((state) => ({
          ...state,
          letter: event.target.value as string,
        }));
      setAlert((state) => ({ ...state, show: false }));
    };
  const handleSumbit = () => {
    sendInquiry({
      userId: data!.id as string,
      reason: inputs.reason,
      letter: inputs.letter,
    });
    setInputs({ reason: "", letter: "" });
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 120px)",
        }}
      >
        <Box sx={{ width: "60%" }}>
          <Stack gap={3}>
            <Stack gap={2}>
              <InputLabel required>Reason for inquiry</InputLabel>
              <Select
                value={inputs.reason}
                label="Reason for inquiry"
                onChange={handleChange("reason")}
                required
              >
                <MenuItem value={"Adoptions"}>Adoptions</MenuItem>
                <MenuItem value={"Returning a pet"}>Returning a pet</MenuItem>
                <MenuItem value={"Pet details"}>Pet details</MenuItem>
                <MenuItem value={"Other"}>Other</MenuItem>
              </Select>
            </Stack>
            <TextField
              multiline
              minRows={12}
              label={"Inquiry..."}
              required
              value={inputs.letter}
              onChange={handleChange("letter")}
            />
            <Stack direction="row" justifyContent={"flex-end"} gap={2}>
              <Collapse in={alert.show}>
                <Alert severity={alert.status}>{alert.message}</Alert>
              </Collapse>
              <Button
                variant="contained"
                sx={{ width: "200px" }}
                onClick={handleSumbit}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

ContactUs.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default ContactUs;
