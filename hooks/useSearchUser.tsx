import { useQuery } from "@tanstack/react-query";
import { UserResponse } from "../types/userTypes";
import axiosClient from "../utils/axiosClient";

type QueryType = "firstName" | "lastName" | "name" | "email" | "id";

export const useSearchUser = (queryType: QueryType, query: string) => {
  const { data: users, refetch: searchUsers } = useQuery<{
    message: string;
    response: UserResponse[];
  }>(
    ["userSearch"],
    async () => {
      return (
        await axiosClient.get(
          `/admin/usersearch?querytype=${queryType}&query=${query}`
        )
      ).data;
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );
  return { users, searchUsers };
};
