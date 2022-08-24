import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosClient from "../utils/axiosClient";

interface ChipData {
  key: string;
  label: string;
}

const DietChips = ({
  initChips,
  alertSetter,
  petId,
}: {
  initChips: Array<string>;
  alertSetter: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      type: "error" | "success";
      message: string | AxiosError;
    }>
  >;
  petId: string;
}) => {
  const { data } = useSession();
  const [input, setInput] = useState("");
  const [dietChips, setDietChips] = useState(
    initChips.map((el) => ({ key: uuidv4(), label: el }))
  );
  const handleDeleteChip = (chipToDelete: ChipData) => () => {
    setDietChips((chips) =>
      dietChips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };
  const { mutate: updateDietRes } = useMutation<
    { message: string; response: string },
    AxiosError,
    { dietaryRes: string }
  >(
    async (data) =>
      (await axiosClient.put(`/admin/${petId}/updatepet`, data)).data,
    {
      onSuccess: () => {
        alertSetter({
          show: true,
          type: "success",
          message: "Pet Updated",
        });
        setTimeout(
          () => alertSetter({ show: false, type: "success", message: "" }),
          3000
        );
      },
      onError: (error) => {
        alertSetter({
          show: true,
          type: "error",
          message: error,
        });
        setTimeout(
          () => alertSetter({ show: false, type: "success", message: "" }),
          3000
        );
      },
    }
  );
  return (
    <>
      {dietChips.length || data?.role === "admin" ? (
        <>
          {data && data.role === "admin" ? (
            <>
              <TextField
                label="Dietary Restrictions"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && input) {
                    setDietChips((state) => [
                      ...state,
                      { key: uuidv4(), label: input },
                    ]);
                    setInput("");
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setDietChips((state) => [
                            ...state,
                            { key: uuidv4(), label: input },
                          ]);
                          setInput("");
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Paper
                sx={{
                  maxWidth: "250px",
                }}
              >
                <Stack gap={1}>
                  <Collapse in={dietChips.length !== 0}>
                    <Box
                      sx={{
                        padding: "3px",
                        display: "flex",
                        gap: "5px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {dietChips?.map((el) => (
                        <Chip
                          key={el.key}
                          label={el.label}
                          onDelete={handleDeleteChip(el)}
                        />
                      ))}
                    </Box>
                  </Collapse>
                  <Button
                    onClick={() => {
                      const chipArr = dietChips.map((el) => el.label);
                      updateDietRes({ dietaryRes: chipArr.join(",") });
                    }}
                  >
                    Save
                  </Button>
                </Stack>
              </Paper>
            </>
          ) : (
            <>
              <Stack gap={1}>
                <Typography>Dietary restrictions: </Typography>
                <Paper
                  sx={{
                    padding: "10px",
                    display: "flex",
                    maxWidth: "200px",
                    justifyContent: "center",
                    gap: "5px",
                    flexWrap: "wrap",
                  }}
                >
                  {dietChips?.map((el) => (
                    <Chip key={el.key} label={el.label} />
                  ))}
                </Paper>
              </Stack>
            </>
          )}
        </>
      ) : (
        <Typography>Dietary restrictions: none</Typography>
      )}
    </>
  );
};

export default DietChips;
