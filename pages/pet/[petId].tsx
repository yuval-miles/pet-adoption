import React, { useEffect, useState } from "react";
import { GetServerSidePropsContext } from "next";
import { prisma } from "../../utils/primsa";
import { InferGetServerSidePropsType } from "next";
import Navigation from "../../Layout/Navigation";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
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
import useGetSavedPets from "../../hooks/useGetSavedPets";
import { useSavedPets } from "../../store/savedPets";
import useSavePet from "../../hooks/useSavePet";
import { useUsersPets } from "../../store/userPets";
import shallow from "zustand/shallow";
import PetInfo from "../../components/PetInfo";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import DietChips from "../../components/DietChips";
import { useS3Upload } from "../../hooks/useS3Upload";

const PetPage = ({
  petData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, status } = useSession();
  const { petId } = useRouter().query;
  const [petDataState, setPetDataState] = useState({ ...petData });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [updateAlertStatus, setUpdateAlertStatus] = useState<{
    show: boolean;
    type: "error" | "success";
    message: string | AxiosError;
  }>({ show: false, type: "success", message: "" });
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
  useGetSavedPets();
  const { alertStatus, savePet } = useSavePet();
  const { isSaved } = useSavedPets((state) => ({
    isSaved: petData && state.savedPets.pets?.[petData.id] ? true : false,
  }));
  const { addPet, removePet } = useUsersPets(
    (state) => ({ addPet: state.addPet, removePet: state.removePet }),
    shallow
  );
  const { mutate: preformAction } = useMutation<
    { message: string; response: "Returned" | "Fostered" | "Adopted" },
    AxiosError,
    { petId: string; userId: string; action: "Adopt" | "Foster" | "Return" }
  >(async (data) => (await axiosClient.post("/pets/statusaction", data)).data, {
    onSuccess: (res, { petId }) => {
      switch (res.response) {
        case "Returned":
          if (data) {
            setPetStatus(null);
            setCurrOwnerId(null);
            if (petData?.petAdoptionStatus[0]?.status) {
              removePet(
                petData.petAdoptionStatus[0].status === "Adopted"
                  ? "adoptedPets"
                  : "fosteredPets",
                petId
              );
            }
          }
          break;
        case "Fostered":
          if (data) {
            setPetStatus("Fostered");
            setCurrOwnerId(data.id as string);
            if (petData)
              addPet("fosteredPets", petId, {
                ...petData,
                adoptionStatus: "Fostered",
              });
          }
          break;
        case "Adopted":
          if (data) {
            setPetStatus("Adopted");
            setCurrOwnerId(data.id as string);
            if (petData)
              addPet("adoptedPets", petId, {
                ...petData,
                adoptionStatus: "Adopted",
              });
          }
          break;
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const { mutate: updateHypo } = useMutation<
    { message: string; response: string },
    AxiosError,
    { [key: string]: boolean }
  >(
    async (data) =>
      (await axiosClient.put(`/admin/${petId}/updatepet`, data)).data,
    {
      onSuccess: () => {
        setPetDataState((state) => ({
          ...state,
          hypoallergenic: !state.hypoallergenic,
        }));
        setUpdateAlertStatus({
          show: true,
          type: "success",
          message: "Pet Updated",
        });
        setTimeout(
          () =>
            setUpdateAlertStatus({ show: false, type: "success", message: "" }),
          3000
        );
      },
      onError: (error) => {
        setUpdateAlertStatus({
          show: true,
          type: "error",
          message: error,
        });
        setTimeout(
          () =>
            setUpdateAlertStatus({ show: false, type: "success", message: "" }),
          3000
        );
      },
    }
  );
  const {
    s3Upload,
    progress,
    alertStatus: pictureAlert,
  } = useS3Upload<{}, { picture: string }>(
    "pet-photo/",
    petData?.id!,
    selectedImage,
    `/admin/${petData?.id!}/updatepet`,
    "put",
    {},
    (_, uploadUrl) => {
      const uploadObj: { picture: string } = {
        picture: uploadUrl?.response.split("?")[0],
      };
      return uploadObj;
    },
    "Picture updated",
    (uploadUrl) =>
      setPetDataState((state) => ({ ...state, picture: uploadUrl }))
  );
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
  useEffect(() => {
    if (selectedImage !== null) s3Upload();
  }, [selectedImage, s3Upload]);
  console.log(selectedImage);
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
      <Stack gap={2}>
        <Paper sx={{ padding: "10px" }}>
          <Stack direction={"row"} gap={"10px"}>
            <Stack gap={2}>
              <Image
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : petDataState.picture!
                }
                alt={petDataState.type!}
                width="600px"
                height="455px"
                layout="fixed"
                style={{ borderRadius: "5px" }}
              />
              {data && data.role === "admin" && (
                <>
                  <Button variant="contained" component="label">
                    Update image
                    <input
                      type="file"
                      hidden
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          setSelectedImage(e.target.files?.[0]);
                      }}
                    />
                  </Button>
                  <Collapse in={progress.show} sx={{ width: "100%" }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress.value}
                    />
                  </Collapse>
                </>
              )}
            </Stack>
            <Stack justifyContent={"space-between"} gap={2}>
              <Stack gap={2} sx={{ width: "400px" }}>
                <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"flex-end"}
                >
                  <PetInfo
                    value={petDataState.name!}
                    variant="h3"
                    textFieldWidth={150}
                    fontSize={2.5}
                    stateName="name"
                    stateSetter={setPetDataState}
                    petId={petData.id}
                    alertSetter={setUpdateAlertStatus}
                  />
                  <Stack direction="row" gap={2}>
                    <PetInfo
                      value={petDataState.type!}
                      variant="h4"
                      textFieldWidth={60}
                      fontSize={2}
                      stateName="type"
                      stateSetter={setPetDataState}
                      petId={petData.id}
                      alertSetter={setUpdateAlertStatus}
                    />
                    <PetsIcon />
                  </Stack>
                </Stack>
                <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"flex-start"}
                >
                  <Stack gap={1}>
                    <PetInfo
                      label="Height"
                      value={petDataState.height!}
                      suffix="cm"
                      fontSize={1}
                      stateName="height"
                      stateSetter={setPetDataState}
                      petId={petData.id}
                      alertSetter={setUpdateAlertStatus}
                    />
                    <PetInfo
                      label="Weight"
                      value={petDataState.weight!}
                      suffix="kg"
                      fontSize={1}
                      stateName="weight"
                      stateSetter={setPetDataState}
                      petId={petData.id}
                      alertSetter={setUpdateAlertStatus}
                    />
                    <PetInfo
                      label="Breed"
                      value={petDataState.breed!}
                      fontSize={1}
                      stateName="breed"
                      stateSetter={setPetDataState}
                      petId={petData.id}
                      alertSetter={setUpdateAlertStatus}
                    />
                    <Stack direction="row" alignItems={"center"}>
                      <Typography variant="body1">Hypoallergenic: </Typography>
                      {petDataState.hypoallergenic ? (
                        <DoneIcon color="success" />
                      ) : (
                        <CloseIcon color="error" />
                      )}
                      {data && data.role === "admin" ? (
                        <Tooltip title="Reverse">
                          <IconButton
                            onClick={() =>
                              updateHypo({
                                hypoallergenic: !petDataState.hypoallergenic,
                              })
                            }
                          >
                            <FlipCameraAndroidIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <></>
                      )}
                    </Stack>
                    <DietChips
                      initChips={
                        petData?.dietaryRes ? petData.dietaryRes.split(",") : []
                      }
                      petId={petData.id}
                      alertSetter={setUpdateAlertStatus}
                    />
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
                        <PetInfo
                          value={petDataState.bio!}
                          fontSize={1}
                          multiline
                          textFieldWidth={150}
                          stateName="bio"
                          stateSetter={setPetDataState}
                          petId={petData.id}
                          alertSetter={setUpdateAlertStatus}
                        />
                      </Stack>
                    </Paper>
                  </Stack>
                  <Stack
                    gap={1}
                    alignItems={"flex-end"}
                    justifyContent={"space-between"}
                    height={"100%"}
                  >
                    <PetInfo
                      label="Color"
                      value={petDataState.color!}
                      fontSize={1}
                      stateName="color"
                      stateSetter={setPetDataState}
                      petId={petData.id}
                      alertSetter={setUpdateAlertStatus}
                    />
                  </Stack>
                </Stack>
              </Stack>
              {status === "authenticated" ? (
                <Stack direction={"row"} justifyContent={"space-between"}>
                  <Stack justifyContent={"flex-end"}>
                    <Stack gap={1}>
                      <Collapse in={alertStatus.show}>
                        <Alert severity={alertStatus.type}>
                          {alertStatus.type === "success" ? (
                            (alertStatus.message as string)
                          ) : (
                            <Stack>
                              <Typography>
                                Ohh no an error has occurred
                              </Typography>
                              <Typography>
                                Error message:{" "}
                                {alertStatus.message instanceof AxiosError &&
                                  alertStatus.message.message}
                              </Typography>
                            </Stack>
                          )}
                        </Alert>
                      </Collapse>
                      <Button
                        variant="outlined"
                        sx={{ width: "150px" }}
                        onClick={() => {
                          if (data)
                            savePet({
                              petId: petData.id,
                              userId: data.id as string,
                              petData: {
                                ...petData,
                                petId: petData.id,
                                adoptionStatus: petStatus as string,
                              },
                            });
                        }}
                      >
                        {isSaved ? "Un-save Pet" : "Save Pet"}
                      </Button>
                    </Stack>
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
              ) : (
                <>
                  <Stack alignItems={"flex-end"}>
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
                  </Stack>
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
        <Collapse in={updateAlertStatus.show}>
          <Alert severity={updateAlertStatus.type}>
            {updateAlertStatus.type === "success" ? (
              (updateAlertStatus.message as string)
            ) : (
              <Stack>
                <Typography>Ohh no an error has occurred</Typography>
                <Typography>
                  Error message:
                  {updateAlertStatus.message instanceof AxiosError &&
                    updateAlertStatus.message.message}
                </Typography>
              </Stack>
            )}
          </Alert>
        </Collapse>
        <Collapse in={pictureAlert.show}>
          <Alert severity={pictureAlert.type}>
            {pictureAlert.type === "success" ? (
              (pictureAlert.message as string)
            ) : (
              <Stack>
                <Typography>Ohh no an error has occurred</Typography>
                <Typography>
                  Error message:
                  {pictureAlert.message}
                </Typography>
              </Stack>
            )}
          </Alert>
        </Collapse>
      </Stack>
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
