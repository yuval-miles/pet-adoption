import React from "react";
import { GetServerSidePropsContext } from "next";
import { prisma } from "../../utils/primsa";
import { UserResponse } from "../../types/userTypes";
import { InferGetServerSidePropsType } from "next";
import Navigation from "../../Layout/Navigation";
import CreateUserOrEditForm from "../../components/CreateUserOrEditForm";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Box } from "@mui/material";

const UserProfile = ({
  userData,
  provider,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { userId } = useRouter().query;
  if (!userData || typeof userId !== "string") return <></>;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 120px)",
      }}
    >
      <CreateUserOrEditForm
        isEditForm
        userData={userData}
        userId={userId}
        provider={provider ? provider : undefined}
      />
    </Box>
  );
};

export const getServerSideProps = async ({
  query: { userId },
}: GetServerSidePropsContext) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId as string,
    },
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });
  if (user) {
    const response: UserResponse = {
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name as string,
      phoneNumber: user.phoneNumber,
      email: user.email as string,
      image: user.image,
    };
    if (user.accounts.length)
      return {
        props: {
          userData: response,
          provider: user.accounts[0].provider,
        },
      };
    return {
      props: { userData: response },
    };
  } else {
    return {
      props: { userData: null },
    };
  }
};

UserProfile.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default UserProfile;
