import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import shallow from "zustand/shallow";
import { useSavedPets } from "../store/savedPets";
import axiosClient from "../utils/axiosClient";
import { useEffect } from "react";
import { PetType } from "../store/userPets";

interface SavedPetsResponseType extends PetType {
  petAdoptionStatus: { status: string }[];
}

const useGetSavedPets = () => {
  const { data, status } = useSession();
  const { setSavedPets, clearSavedPets, setHasFetched, savedPets } =
    useSavedPets(
      (state) => ({
        setSavedPets: state.setSavedPets,
        savedPets: state.savedPets,
        clearSavedPets: state.clearSavedPets,
        setHasFetched: state.setHasFetched,
      }),
      shallow
    );
  const { refetch: getSavedPets } = useQuery<
    {
      message: string;
      response: {
        userId: string;
        petId: string;
        createdAt: Date;
        pet: SavedPetsResponseType;
      }[];
    },
    AxiosError
  >(
    ["getSavedPets"],
    async () => {
      return (
        await axiosClient.get(`/users/${data!.id}/getsavedpets?info=full`)
      ).data;
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const state: { [key: string]: PetType } = {};
        data.response.forEach((el) => {
          const petObj: PetType = {
            picture: el.pet.picture,
            id: el.petId,
            height: el.pet.height,
            weight: el.pet.weight,
            name: el.pet.name,
            adoptionStatus: el.pet.petAdoptionStatus[0]?.status
              ? el.pet.petAdoptionStatus[0]?.status
              : "Available",
            breed: el.pet.breed,
            type: el.pet.type,
          };
          state[el.petId] = petObj;
        });
        setSavedPets(state);
        setHasFetched(true);
      },
    }
  );
  useEffect(() => {
    if (status === "authenticated" && !savedPets?.hasFetched) getSavedPets();
    else if (status === "unauthenticated") {
      clearSavedPets();
      setHasFetched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, getSavedPets, clearSavedPets]);
  return { getSavedPets, clearSavedPets, savedPets };
};

export default useGetSavedPets;
