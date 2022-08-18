import React from "react";
import { GetServerSidePropsContext } from "next";
import { prisma } from "../../utils/primsa";
import { InferGetServerSidePropsType } from "next";
import Navigation from "../../Layout/Navigation";
import { useRouter } from "next/router";
import { Alert, Box, Paper, Stack } from "@mui/material";
import Image from "next/image";

const PetPage = ({
  petData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { petId } = useRouter().query;
  if (!petData || typeof petId !== "string")
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
          <Alert severity="error">404: We cannot find a pet with that id</Alert>
        </Box>
      </>
    );
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 120px)",
      }}
    >
      <Paper>
        <Stack direction={"row"}>
          <Image
            src={petData.picture}
            alt={petData.type}
            width="500px"
            height="350px"
            style={{ borderRadius: "5px" }}
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export const getServerSideProps = async ({
  query: { petId },
}: GetServerSidePropsContext) => {
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId as string,
    },
  });
  if (pet)
    return {
      props: {
        petData: pet,
      },
    };
  else
    return {
      props: {
        petData: null,
      },
    };
};

PetPage.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default PetPage;
