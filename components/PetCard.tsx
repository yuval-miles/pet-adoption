import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Collapse,
  Fade,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import React from "react";
import useSavePet from "../hooks/useSavePet";
import { useSavedPets } from "../store/savedPets";
import type { PetSearchResponse } from "../types/types";

interface PetCardProps extends PetSearchResponse {
  userId?: string;
  saved: boolean;
}

const PetCard = ({
  adoptionStatus,
  picture,
  breed,
  height,
  weight,
  type,
  name,
  petId,
  userId,
}: PetCardProps) => {
  const router = useRouter();
  const { setAlertStatus, alertStatus, savePet, isLoading } = useSavePet();
  const { isSaved } = useSavedPets((state) => ({
    isSaved: state.savedPets.pets?.[petId] ? true : false,
  }));
  return (
    <Card sx={{ height: "500px", overflow: "auto" }}>
      <Stack height={"100%"} justifyContent={"space-between"}>
        <Stack>
          <CardMedia component="img" height="230" image={picture} alt={name} />
          <CardContent>
            <Stack direction="row" justifyContent={"space-between"}>
              <Typography gutterBottom variant="h5" component="div">
                {name}
              </Typography>
              <Typography gutterBottom variant="h5" component="div">
                {type}
              </Typography>
            </Stack>
            <Typography>Height: {height}</Typography>
            <Typography>Weight: {weight}</Typography>
            <Typography>Breed: {breed}</Typography>
          </CardContent>
        </Stack>
        <Stack>
          <CardActions>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              sx={{ width: "100%" }}
              alignItems={"flex-end"}
            >
              <Stack gap={1}>
                <Collapse in={alertStatus.show}>
                  <Alert severity={alertStatus.type}>
                    {alertStatus.type === "success" ? (
                      (alertStatus.message as string)
                    ) : (
                      <Stack>
                        <Typography>Ohh no an error has occurred</Typography>
                        <Typography>
                          Error message:{" "}
                          {alertStatus.message instanceof AxiosError &&
                            alertStatus.message.message}
                        </Typography>
                      </Stack>
                    )}
                  </Alert>
                </Collapse>
                <Stack direction={"row"} gap={1}>
                  <Button
                    size="small"
                    onClick={() => router.push(`/pet/${petId}`)}
                    variant="outlined"
                  >
                    More info
                  </Button>
                  {userId && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        savePet({
                          petId,
                          userId,
                          petData: {
                            adoptionStatus,
                            picture,
                            breed,
                            height,
                            weight,
                            type,
                            name,
                            petId,
                          },
                        })
                      }
                    >
                      {isSaved ? "Un-Save pet" : "Save pet"}
                    </Button>
                  )}
                  <Fade in={isLoading}>
                    <CircularProgress size={"30px"} />
                  </Fade>
                </Stack>
              </Stack>
              <Paper
                sx={{
                  padding: "10px",
                  backgroundColor:
                    adoptionStatus === "Adopted"
                      ? "#2979ff"
                      : adoptionStatus === "Fostered"
                      ? "#ff9100"
                      : "#52b202",
                  color: "white",
                }}
              >
                <Typography>{adoptionStatus}</Typography>
              </Paper>
            </Stack>
          </CardActions>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PetCard;
