import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import shallow from "zustand/shallow";
import { useSavedPets } from "../store/savedPets";
import { PetSearchResponse } from "../types/types";
import axiosClient from "../utils/axiosClient";

const useSavePet = () => {
  const [alertStatus, setAlertStatus] = useState<{
    show: boolean;
    type: "error" | "success";
    message: string | AxiosError;
  }>({ show: false, type: "success", message: "" });
  const { addSavedPet, removeSavedPet } = useSavedPets(
    (state) => ({
      addSavedPet: state.addSavedPet,
      removeSavedPet: state.removeSavedPet,
    }),
    shallow
  );
  const { mutate: savePet, isLoading } = useMutation<
    { message: string; response: string },
    AxiosError,
    { petId: string; userId: string; petData: PetSearchResponse }
  >(async (data) => (await axiosClient.post("/pets/savepet", data)).data, {
    onSuccess: (data, { petId, petData }) => {
      setAlertStatus({ show: true, type: "success", message: data.response });
      if (data.response === "Pet Saved")
        addSavedPet(petId, { ...petData, id: petData.petId });
      else removeSavedPet(petId);
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
