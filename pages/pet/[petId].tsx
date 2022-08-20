import React, { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { prisma } from "../../utils/primsa";
import { InferGetServerSidePropsType } from "next";
import Navigation from "../../Layout/Navigation";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Chip,
  Icon,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import { AxiosError } from "axios";

const PetPage = ({
  petData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, status } = useSession();
  const { petId } = useRouter().query;
  const [dietChips, setDietChips] = useState(
    petData?.dietaryRes ? petData.dietaryRes.split(",") : []
  );
  const [petStatus, setPetStatus] = useState<
    "Fostered" | "Adopted" | "Available" | null
  >(
    petData?.petAdoptionStatus[0]?.status
      ? petData?.petAdoptionStatus[0]?.status
      : null
  );
  const [currOwnerId, setCurrOwnerId] = useState(
    petData?.petAdoptionStatus[0]?.userId
      ? petData.petAdoptionStatus[0].userId
      : null
  );
  const { mutate: preformAction } = useMutation<
    { message: string; response: "Returned" | "Fostered" | "Adopted" },
    AxiosError,
    { petId: string; userId: string; action: "Adopt" | "Foster" | "Return" }
  >(async (data) => (await axiosClient.post("/pets/statusaction", data)).data, {
    onSuccess: (res) => {
      switch (res.response) {
        case "Returned":
          if (data) {
            setPetStatus(null);
            setCurrOwnerId(null);
          }
          break;
        case "Fostered":
          if (data) {
            setPetStatus("Fostered");
            setCurrOwnerId(data.id as string);
          }
          break;
        case "Adopted":
          if (data) {
            setPetStatus("Adopted");
            setCurrOwnerId(data.id as string);
          }
          break;
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const handlePetAction =
    (action: "Adopt" | "Foster" | "Return") =>
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (data && petId)
        preformAction({
          userId: data.id as string,
          petId: petId as string,
          action,
        });
    };
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
      <Paper sx={{ padding: "10px" }}>
        <Stack direction={"row"} gap={"10px"}>
          <Image
            src={petData.picture}
            alt={petData.type}
            width="600px"
            height="455px"
            style={{ borderRadius: "5px" }}
          />
          <Stack justifyContent={"space-between"} gap={2}>
            <Stack gap={2} sx={{ width: "400px" }}>
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"flex-end"}
              >
                <Typography variant="h3">{petData.name}</Typography>
                <Typography variant="h4">
                  {petData.type}{" "}
                  <Icon>
                    <PetsIcon />
                  </Icon>
                </Typography>
              </Stack>
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"flex-start"}
              >
                <Stack gap={1}>
                  <Typography variant="body1">
                    Height: {petData.height}cm
                  </Typography>
                  <Typography variant="body1">
                    Weight: {petData.weight}kg
                  </Typography>
                  <Typography variant="body1">
                    Breed: {petData.breed}
                  </Typography>
                  <Stack direction="row" alignItems={"center"}>
                    <Typography variant="body1">Hypoallergenic: </Typography>
                    {petData.hypoallergenic ? (
                      <DoneIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </Stack>
                  {dietChips.length ? (
                    <Stack gap={1}>
                      <Typography>Dietary restrictions: </Typography>
                      <Paper
                        sx={{
                          padding: "10px",
                          display: "flex",
                          width: "150px",
                          justifyContent: "center",
                          gap: "5px",
                        }}
                      >
                        {dietChips.map((el) => (
                          <Chip key={el} label={el} />
                        ))}
                      </Paper>
                    </Stack>
                  ) : (
                    <Typography>Dietary restrictions: none</Typography>
                  )}
                  <Paper
                    sx={{
                      maxWidth: "250px",
                      maxHeight: "140px",
                      padding: "5px",
                      overflow: "auto",
                    }}
                  >
                    <Stack>
                      <Typography>Bio: </Typography>
                      <Typography>{petData.bio}</Typography>
                    </Stack>
                  </Paper>
                </Stack>
                <Stack
                  gap={1}
                  alignItems={"flex-end"}
                  justifyContent={"space-between"}
                  height={"100%"}
                >
                  <Typography variant="body1">
                    Color: {petData.color}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            {status === "authenticated" && (
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Stack justifyContent={"flex-end"}>
                  <Button variant="outlined">Save Pet</Button>
                </Stack>
                <Stack gap={2} alignItems="flex-end">
                  <Paper
                    sx={{
                      padding: "10px",
                      backgroundColor:
                        petStatus === "Adopted"
                          ? "#2979ff"
                          : petStatus === "Fostered"
                          ? "#ff9100"
                          : "#52b202",
                      color: "white",
                    }}
                  >
                    <Typography>
                      {petStatus ? petStatus : "Available"}
                    </Typography>
                  </Paper>
                  {!petStatus ? (
                    <Stack direction={"row"} gap={1}>
                      <Button
                        onClick={handlePetAction("Foster")}
                        variant="outlined"
                      >
                        Foster
                      </Button>
                      <Button
                        onClick={handlePetAction("Adopt")}
                        variant="outlined"
                      >
                        Adopt
                      </Button>
                    </Stack>
                  ) : currOwnerId === data.id ? (
                    petStatus === "Fostered" ? (
                      <Stack direction={"row"} gap={1}>
                        <Button
                          onClick={handlePetAction("Return")}
                          variant="outlined"
                        >
                          Return
                        </Button>
                        <Button
                          onClick={handlePetAction("Adopt")}
                          variant="outlined"
                        >
                          Adopt
                        </Button>
                      </Stack>
                    ) : (
                      <Stack direction={"row"} gap={1}>
                        <Button
                          onClick={handlePetAction("Return")}
                          variant="outlined"
                        >
                          Return
                        </Button>
                      </Stack>
                    )
                  ) : (
                    <></>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
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
    include: {
      petAdoptionStatus: {
        select: {
          userId: true,
          status: true,
        },
      },
    },
  });
  if (pet) {
    return {
      props: {
        petData: { ...pet, createdAt: pet.createdAt.toLocaleTimeString() },
      },
    };
  } else
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
