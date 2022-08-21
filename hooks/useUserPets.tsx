import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import shallow from "zustand/shallow";
import { PetType, UserPetsType, useUsersPets } from "../store/userPets";
import axiosClient from "../utils/axiosClient";

export type UserPetsResponseType = Array<{
  status: "Adopted" | "Fostered";
  pet: PetType;
}>;

const useUserPets = () => {
  const { data, status } = useSession();
  const { usersPets, setUsersPets, clearUsersPets } = useUsersPets(
    (state) => ({
      usersPets: state.usersPets,
      setUsersPets: state.setUsersPets,
      clearUsersPets: state.clearUsersPets,
    }),
    shallow
  );
  const { isLoading, refetch } = useQuery<
    {
      message: string;
      response: UserPetsResponseType;
    },
    AxiosError
  >(
    ["usersPets"],
    async () => (await axiosClient.get(`/users/${data!.id}/getuserspets`)).data,
    {
      enabled: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const userPetObj: UserPetsType = {
          adoptedPets: {},
          fosteredPets: {},
          hasFetched: true,
        };
        data.response.forEach((el) => {
          if (el.status === "Adopted")
            userPetObj.adoptedPets[el.pet.id] = {
              ...el.pet,
              adoptionStatus: el.status,
            };
          else
            userPetObj.fosteredPets[el.pet.id] = {
              ...el.pet,
              adoptionStatus: el.status,
            };
        });
        setUsersPets(userPetObj);
      },
    }
  );
  useEffect(() => {
    if (status === "authenticated" && !usersPets.hasFetched) refetch();
    else if (status === "unauthenticated") {
      clearUsersPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, refetch, clearUsersPets]);
  return { usersPets, isLoading };
};

export default useUserPets;
