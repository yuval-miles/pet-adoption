import {
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import Navigation from "../Layout/Navigation";
import Chip from "@mui/material/Chip";
import ImageIcon from "@mui/icons-material/Image";
import AddIcon from "@mui/icons-material/Add";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";

interface ChipData {
  key: number;
  label: string;
}

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const inputSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(15),
  color: z.string().min(1).max(50),
  breed: z.string().min(1).max(50),
  adoptionStatus: z.string().min(1),
  hypoallergenic: z.string().min(1),
  dietInput: z.string(),
  bio: z.string().min(1),
  height: z.number().positive(),
  weight: z.number().positive(),
});

const AddpetPage: NextPage = () => {
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [inputs, setInputs] = useState({
    name: "",
    type: "",
    color: "",
    height: 0,
    weight: 0,
    breed: "",
    adoptionStatus: "",
    hypoallergenic: "",
    dietInput: "",
    bio: "",
  });
  const [petId, setPetId] = useState<string>("test");
  const [chipData, setChipData] = useState<ChipData[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const {
    data: uploadUrl,
    refetch: getUploadUrl,
    isSuccess,
    isError,
  } = useQuery(
    ["getUploadUrl"],
    async () => (await axiosClient.get(`/admin/s3url/${petId}`)).data,
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );
  const handleChange =
    (field: string) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
      setInputs((state) => ({ ...state, [field]: e.target.value }));
    };
  const handleDeleteChip = (chipToDelete: ChipData) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };
  const handleSubmit = async () => {
    try {
      //   inputSchema.parse(inputs);
      getUploadUrl();
    } catch {}
  };
  useEffect(() => {
    if (isSuccess) console.log(uploadUrl);
  }, [isSuccess, uploadUrl]);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      <Stack gap={3} alignItems={"center"}>
        <Box sx={{ width: "500px" }}>
          <Stack gap={1}>
            {selectedImage ? (
              <Image
                src={URL.createObjectURL(selectedImage)}
                width={"500px"}
                height={"300px"}
                alt={"pet img"}
                style={{ borderRadius: "5px" }}
              />
            ) : (
              <Box
                sx={{
                  backgroundColor: "#D3D3D3",
                  height: "300px",
                  borderRadius: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ImageIcon style={{ fontSize: "5rem", color: "white" }} />
              </Box>
            )}
            <Button variant="contained" component="label">
              Upload Image
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
            <Collapse in={selectedImage !== null} sx={{ width: "100%" }}>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => setSelectedImage(null)}
              >
                Remove Image
              </Button>
            </Collapse>
          </Stack>
        </Box>
        <Stack direction={"row"} gap={3}>
          <Stack gap={3}>
            <TextField
              label="Name"
              onChange={handleChange("name")}
              value={inputs.name}
              required
            />
            <TextField
              label="Type"
              onChange={handleChange("type")}
              value={inputs.type}
              required
            />
            <TextField
              label="Color"
              onChange={handleChange("color")}
              value={inputs.color}
              required
            />
            <TextField
              label="Height"
              onChange={handleChange("height")}
              value={inputs.height}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">kg</InputAdornment>
                ),
              }}
              required
            />
            <TextField
              label="Weight"
              onChange={handleChange("weight")}
              value={inputs.weight}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">cm</InputAdornment>
                ),
              }}
              required
            />
            <TextField
              label="Breed"
              onChange={handleChange("breed")}
              value={inputs.breed}
              required
            />
          </Stack>
          <Stack gap={3} width={"300px"}>
            <TextField
              label="Dietary Restrictions"
              onChange={handleChange("dietInput")}
              value={inputs.dietInput}
              onKeyPress={(e) => {
                if (e.key === "Enter" && inputs.dietInput) {
                  setChipData((state) => [
                    ...state,
                    { key: state.length + 1, label: inputs.dietInput },
                  ]);
                  setInputs((state) => ({ ...state, dietInput: "" }));
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setChipData((state) => [
                          ...state,
                          { key: state.length + 1, label: inputs.dietInput },
                        ]);
                        setInputs((state) => ({ ...state, dietInput: "" }));
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Collapse in={chipData.length !== 0}>
              <Paper
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  listStyle: "none",
                  p: 0.5,
                  m: 0,
                }}
                component="ul"
              >
                {chipData.map((data) => (
                  <ListItem key={data.key}>
                    <Chip
                      label={data.label}
                      onDelete={handleDeleteChip(data)}
                    />
                  </ListItem>
                ))}
              </Paper>
            </Collapse>
            <InputLabel required>Adoption Status</InputLabel>
            <Select
              value={inputs.adoptionStatus}
              label="Adoption Status"
              onChange={handleChange("adoptionStatus")}
              required
            >
              <MenuItem value={"Available"}>Available</MenuItem>
              <MenuItem value={"Adopted"}>Adopted</MenuItem>
              <MenuItem value={"Fostered"}>Fostered</MenuItem>
            </Select>
            <InputLabel required>Hypoallergenic</InputLabel>
            <Select
              required
              value={inputs.hypoallergenic}
              label="Adoption Status"
              onChange={handleChange("hypoallergenic")}
            >
              <MenuItem value={"Yes"}>Yes</MenuItem>
              <MenuItem value={"No"}>No</MenuItem>
            </Select>
          </Stack>
          <TextField
            multiline
            minRows={8}
            label={"Bio"}
            sx={{ width: "300px" }}
            required
            value={inputs.bio}
            onChange={handleChange("bio")}
          />
        </Stack>
        <Button onClick={handleSubmit}>Test</Button>
      </Stack>
    </Box>
  );
};

AddpetPage.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default AddpetPage;
