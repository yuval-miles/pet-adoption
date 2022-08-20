import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import axiosClient from "../utils/axiosClient";

const useSavePet = () => {
  const [alertStatus, setAlertStatus] = useState<{
    show: boolean;
    type: "error" | "success";
    message: string | AxiosError;
  }>({ show: false, type: "success", message: "" });
  const { mutate: savePet, isLoading } = useMutation<
    { message: string; response: string },
    AxiosError,
    { petId: string; userId: string }
  >(async (data) => (await axiosClient.post("/pets/savepet", data)).data, {
    onSuccess: (data) => {
      setAlertStatus({ show: true, type: "success", message: data.response });
      setTimeout(
        () =>
          setAlertStatus({
            show: false,
            type: "success",
            message: "",
          }),
        3000
      );
    },
    onError: (error) => {
      setAlertStatus({ show: true, type: "error", message: error });
    },
  });
  return { alertStatus, setAlertStatus, savePet, isLoading };
};

export default useSavePet;
