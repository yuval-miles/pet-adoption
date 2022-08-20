import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import axiosClient from "../utils/axiosClient";

const useGetSavedPets = (userId: string) => {
  const [savedPets, setSavedPets] = useState<{ [key: string]: boolean }>({});
  const { refetch: getSavedPets } = useQuery<
    {
      message: string;
      response: { userId: string; petId: string; createdAt: Date }[];
    },
    AxiosError
  >(
    ["getSavedPets"],
    async () => {
      return (await axiosClient.get(`/users/${userId}/getsavedpets?info=id`))
        .data;
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        data.response.forEach((el) => {
          setSavedPets((state) => ({ ...state, [el.petId]: true }));
        });
      },
    }
  );
  return { savedPets, setSavedPets, getSavedPets };
};

export default useGetSavedPets;
