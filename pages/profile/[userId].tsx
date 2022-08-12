import React from "react";
import { GetServerSidePropsContext } from "next";
import { PrismaClient } from "@prisma/client";
import { UserResponse } from "../../types/userTypes";
import { InferGetServerSidePropsType } from "next";
import Navigation from "../../Layout/Navigation";
import CreateUserOrEditForm from "../../components/CreateUserOrEditForm";
import { useRouter } from "next/router";

const UserProfile = ({
  userData,
  provider,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { userId } = useRouter().query;
  if (!userData || typeof userId !== "string") return <></>;
  return (
    <CreateUserOrEditForm
      isEditForm
      userData={userData}
      userId={userId}
      provider={provider ? provider : undefined}
    />
  );
};

export const getServerSideProps = async ({
  query: { userId },
}: GetServerSidePropsContext) => {
  const prisma = new PrismaClient();
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
    if (user.accounts)
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
