import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import type { PetSearchResponse } from "../types/types";

const PetCard = ({
  adoptionStatus,
  picture,
  breed,
  height,
  weight,
  type,
  name,
  petId,
}: PetSearchResponse) => {
  const router = useRouter();
  return (
    <Card>
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
      <CardActions>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          sx={{ width: "100%" }}
        >
          <Stack direction={"row"} gap={1}>
            <Button size="small" onClick={() => router.push(`/pet/${petId}`)}>
              More info
            </Button>
            <Button size="small">Save pet</Button>
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
    </Card>
  );
};

export default PetCard;
