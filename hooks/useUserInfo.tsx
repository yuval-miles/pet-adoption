import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { UserResponse } from "../types/types";
import axiosClient from "../utils/axiosClient";
import { useEffect } from "react";

const useUserInfo = () => {
  const { data, status } = useSession();
  const {
    data: userData,
    error,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useQuery<{ message: string; response: UserResponse }, AxiosError>(
    ["userData"],
    async () => {
      if (data) return (await axiosClient.get(`/users/${data.id}`)).data;
      else throw new Error("Session data is undefined");
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );
  useEffect(() => {
    if (status === "authenticated") refetch();
  }, [status, refetch]);
  return {
    userData,
    error,
    isError,
    isLoading,
    isSuccess,
    status,
    data,
    refetch,
  };
};
export default useUserInfo;
