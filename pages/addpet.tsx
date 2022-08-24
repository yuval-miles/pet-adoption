import {
  Alert,
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
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Navigation from "../Layout/Navigation";
import Chip from "@mui/material/Chip";
import ImageIcon from "@mui/icons-material/Image";
import AddIcon from "@mui/icons-material/Add";
import { z, ZodError } from "zod";
import LinearProgress from "@mui/material/LinearProgress";
import { v4 as uuidv4 } from "uuid";
import { useS3Upload } from "../hooks/useS3Upload";
import { useSearchUser } from "../hooks/useSearchUser";
import { useDebounce } from "../hooks/useDebounce";

interface ChipData {
  key: number;
  label: string;
}

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const inputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(15),
  color: z.string().min(1).max(50),
  breed: z.string().min(1).max(50),
  adoptionStatus: z.string().min(1),
  hypoallergenic: z.string().min(1),
  dietInput: z.string(),
  bio: z.string().min(1),
  height: z.string(),
  weight: z.string(),
  picture: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
});

type PetDataType = z.infer<typeof inputSchema>;

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
    height: "",
    weight: "",
    breed: "",
    adoptionStatus: "",
    hypoallergenic: "",
    dietInput: "",
    bio: "",
  });
  const [userSearch, setUserSearch] = useState("");
  const [petId, setPetId] = useState<string>("");
  const [chipData, setChipData] = useState<ChipData[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const { s3Upload, setAlertStatus, progress, alertStatus } = useS3Upload<
    {
      inputs: PetDataType;
      chipData: Array<{ key: number; label: string }>;
      selectedUser: string;
    },
    PetDataType
  >(
    "pet-photo/",
    petId,
    selectedImage,
    "/admin/uploadpet",
    "post",
    { inputs, chipData, selectedUser },
    (data, uploadUrl) => {
      const chipArr = data.chipData.map((el) => el.label);
      const petData: PetDataType = {
        ...data.inputs,
        picture: uploadUrl?.response.split("?")[0],
        id: petId,
        dietInput: chipArr.join(","),
      };
      if (selectedUser) petData.userId = selectedUser;
      return petData;
    },
    "Pet Uploaded!",
    () => setPetId("")
  );
  const { users, searchUsers } = useSearchUser("firstName", userSearch);
  const handleSearch = useDebounce(() => searchUsers(), 500);
  const handleChange =
    (field: string) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
      setInputs((state) => ({ ...state, [field]: e.target.value }));
      setAlertStatus({ show: false, type: "success", message: "" });
    };
  const handleDeleteChip = (chipToDelete: ChipData) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      inputSchema.parse(inputs);
      if (inputs.adoptionStatus !== "Available" && !selectedUser)
        throw new Error("Please select a user that the pet is assigned to to");
      if (!selectedImage) throw new Error("Please provide and image");
      setPetId(uuidv4());
    } catch (err) {
      if (err instanceof Error)
        setAlertStatus({ show: true, type: "error", message: err.message });
      else if (err instanceof ZodError) {
        console.error(err);
        setAlertStatus({ show: true, type: "error", message: err.name });
      }
    }
  };
  useEffect(() => {
    if (petId) s3Upload();
  }, [petId, s3Upload]);
  useEffect(() => {
    if (inputs.adoptionStatus === "Available") setSelectedUser("");
  }, [inputs.adoptionStatus]);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      <Stack
        gap={3}
        alignItems={"center"}
        component="form"
        onSubmit={handleSubmit}
      >
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
            <Collapse in={progress.show} sx={{ width: "100%" }}>
              <LinearProgress variant="determinate" value={progress.value} />
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
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">cm</InputAdornment>
                ),
              }}
              required
            />
            <TextField
              label="Weight"
              onChange={handleChange("weight")}
              type="number"
              value={inputs.weight}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">kg</InputAdornment>
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
            <Collapse
              in={
                inputs.adoptionStatus === "Adopted" ||
                inputs.adoptionStatus === "Fostered"
              }
            >
              <TextField
                label="Belonging to user?"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  handleSearch();
                }}
                fullWidth
              />
              <Collapse
                in={
                  users?.response.length !== 0 && users?.response !== undefined
                }
              >
                <Paper
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    listStyle: "none",
                    p: 0.5,
                    m: 0,
                    marginTop: "15px",
                    maxHeight: "100px",
                    overflow: "auto",
                  }}
                  component="ul"
                >
                  {users?.response.map((el) => (
                    <ListItem
                      key={el.email}
                      onClick={() => setSelectedUser(el.id!)}
                    >
                      <Chip
                        label={el.firstName}
                        sx={{
                          backgroundColor:
                            selectedUser === el.id ? "lightblue" : "grey",
                        }}
                      />
                    </ListItem>
                  ))}
                </Paper>
              </Collapse>
            </Collapse>
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
          <Stack gap={3}>
            <TextField
              multiline
              minRows={8}
              label={"Bio"}
              sx={{ width: "300px" }}
              required
              value={inputs.bio}
              onChange={handleChange("bio")}
            />
            <Button type="submit" variant="contained">
              Add Pet
            </Button>
            <Collapse in={alertStatus.show}>
              <Alert severity={alertStatus.type}>{alertStatus.message}</Alert>
            </Collapse>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

AddpetPage.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default AddpetPage;
