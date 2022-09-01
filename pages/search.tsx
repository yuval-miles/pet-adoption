import {
  Alert,
  Box,
  Chip,
  Collapse,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import Navigation from "../Layout/Navigation";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import type { PetSearchResponse } from "../types/types";
import { AxiosError } from "axios";
import { useDebounce } from "../hooks/useDebounce";
import PetCard from "../components/PetCard";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useGetSavedPets from "../hooks/useGetSavedPets";

interface ChipData {
  key: string;
  label: string;
}

const SearchPage = () => {
  const router = useRouter();
  const { data, status } = useSession();
  const [searchValue, setSearchValue] = useState("");
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [searchType, setSearchType] = useState("Type");
  const [adoptStatus, setAdoptStatus] = useState(
    router.query.adoptStatus ? router.query.adoptionStatus : ""
  );
  const [chipData, setChipData] = useState<ChipData[]>([]);
  const [composedQuery, setComposedQuery] = useState("");
  const [height, setHeight] = useState<number[]>([0, 20]);
  const [weight, setWeight] = useState<number[]>([0, 20]);
  const simpleSearch = useDebounce((searchValue) => {
    if (searchValue) setComposedQuery(`type=${searchValue}`);
    else setComposedQuery("");
  }, 500);
  const { savedPets } = useGetSavedPets();
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ message: string; response: PetSearchResponse[] }, AxiosError>(
    ["searchResults"],
    async () => {
      return (await axiosClient.get(`/pets/search?${composedQuery}`)).data;
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );
  const handleDeleteChip = (chipToDelete: ChipData) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };
  const handleSliderChange =
    (slider: "weight" | "height") =>
    (event: Event, newValue: number | number[]) => {
      if (slider === "height") setHeight(newValue as number[]);
      else if (slider === "weight") setWeight(newValue as number[]);
    };
  useEffect(() => {
    const queryArr = chipData.map((el) => ({
      queryType: el.key.toLocaleLowerCase(),
      query: el.label.split(":")[1].trim(),
    }));
    let query: string = "";
    queryArr.forEach((el, idx, arr) => {
      if (idx !== arr.length - 1)
        query = query.concat(`${el.queryType}=${el.query}&`);
      else query = query.concat(`${el.queryType}=${el.query}`);
    });
    if (adoptStatus) query = query.concat(`&adoptionStatus=${adoptStatus}`);
    setComposedQuery(query);
  }, [chipData, adoptStatus]);
  useEffect(() => {
    if (!advancedSearch) simpleSearch(searchValue);
  }, [searchValue, advancedSearch, simpleSearch]);
  useEffect(() => {
    refetch();
  }, [composedQuery, refetch]);
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      <Stack width={"100%"}>
        <Typography variant="h3" gutterBottom>
          Search pets
        </Typography>
        <Stack direction={"row"} alignItems="center" gap={2}>
          <Stack direction={"row"} sx={{ width: "60%" }} gap={1}>
            {advancedSearch && (
              <Select
                label="Search by"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as string)}
                sx={{ width: "190px" }}
              >
                <MenuItem value={"Type"}>Type</MenuItem>
                <MenuItem value={"Name"}>Name</MenuItem>
                <MenuItem value={"Breed"}>Breed</MenuItem>
              </Select>
            )}
            <TextField
              label={
                advancedSearch ? "Advanced Search" : "Search by pet type..."
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Stack direction="row" alignItems={"center"} gap={2}>
                    {advancedSearch && (
                      <Stack gap={2} direction="row" alignItems={"center"}>
                        <IconButton
                          sx={{ height: "100%" }}
                          onClick={() => {
                            const newChipData = chipData.filter(
                              (el) => !el.label.includes(searchType)
                            );
                            newChipData.push({
                              key: searchType,
                              label: `${searchType}: ${searchValue}`,
                            });
                            setChipData(newChipData);
                            setSearchValue("");
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Stack>
                    )}
                    <SearchIcon />
                  </Stack>
                ),
              }}
            />
          </Stack>
          <FormGroup>
            <FormControlLabel
              control={<Switch />}
              label="Advanced search"
              checked={advancedSearch}
              onChange={() => {
                if (advancedSearch) setChipData([]);
                setAdvancedSearch((state) => !state);
              }}
            />
          </FormGroup>
        </Stack>
        <Collapse in={advancedSearch}>
          <Stack
            direction={"row"}
            sx={{
              gap: "20px",
              marginLeft: "170px",
              marginTop: "10px",
            }}
            alignItems={"center"}
          >
            <FormControl>
              <FormLabel>Adoption Status</FormLabel>
              <RadioGroup
                row
                aria-labelledby="Adoption status"
                name="Adoption status"
                value={adoptStatus}
                onClick={(e) => {
                  if (!(e.target as HTMLInputElement).value) return;
                  if ((e.target as HTMLInputElement).value === adoptStatus)
                    setAdoptStatus("");
                  else setAdoptStatus((e.target as HTMLInputElement).value);
                }}
              >
                <FormControlLabel
                  value="Available"
                  control={<Radio />}
                  label="Available"
                />
                <FormControlLabel
                  value="Fostered"
                  control={<Radio />}
                  label="Fostered"
                />
                <FormControlLabel
                  value="Adopted"
                  control={<Radio />}
                  label="Adopted"
                />
              </RadioGroup>
            </FormControl>
            <Box sx={{ width: "250px" }}>
              <Stack
                direction="row"
                alignItems={"center"}
                gap={1}
                sx={{ marginBottom: "10px" }}
              >
                <Typography>Height</Typography>
                <IconButton
                  sx={{ width: "25px", height: "25px" }}
                  onClick={() => {
                    const newChipData = chipData.filter(
                      (el) => el.key !== "height"
                    );
                    newChipData.push({
                      key: "height",
                      label: `Height: ${height.join("-")}`,
                    });
                    setChipData(newChipData);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
              <Slider
                value={height}
                onChange={handleSliderChange("height")}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ width: "250px" }}>
              <Stack
                direction="row"
                alignItems={"center"}
                gap={1}
                sx={{ marginBottom: "10px" }}
              >
                <Typography>Weight</Typography>
                <IconButton
                  sx={{ width: "25px", height: "25px" }}
                  onClick={() => {
                    const newChipData = chipData.filter(
                      (el) => el.key !== "weight"
                    );
                    newChipData.push({
                      key: "weight",
                      label: `Weight: ${weight.join("-")}`,
                    });
                    setChipData(newChipData);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
              <Slider
                value={weight}
                onChange={handleSliderChange("weight")}
                valueLabelDisplay="auto"
                max={80}
              />
            </Box>
          </Stack>
        </Collapse>
        <Collapse in={chipData.length !== 0}>
          <Box
            sx={{
              width: "43%",
              display: "flex",
              flexWrap: "wrap",
              listStyle: "none",
              p: 0.5,
              m: 0,
              marginTop: "10px",
              gap: "10px",
              marginLeft: "170px",
            }}
          >
            {chipData.map((data) => (
              <Chip
                label={data.label}
                onDelete={handleDeleteChip(data)}
                key={data.key}
              />
            ))}
          </Box>
        </Collapse>
        <Divider sx={{ marginTop: "20px", marginBottom: "20px" }} />
        <Fade in={isLoading}>
          <LinearProgress />
        </Fade>
        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(345px, 1fr))",
            gap: "10px",
          }}
        >
          {searchResults?.response?.map((el) => {
            return (
              <PetCard
                key={el.petId}
                name={el.name}
                adoptionStatus={el.adoptionStatus}
                weight={el.weight}
                height={el.height}
                picture={el.picture}
                breed={el.breed}
                type={el.type}
                petId={el.petId}
                userId={
                  status === "authenticated" ? (data.id! as string) : undefined
                }
                saved={savedPets.pets?.[el.petId] ? true : false}
              />
            );
          })}
        </Stack>
        <Collapse in={isError}>
          <Alert severity="error" sx={{ marginTop: "10px" }}>
            <Stack>
              <Typography>Ooops..... an error has occurred 😰</Typography>
              <Typography>Error message: {error?.message}</Typography>
            </Stack>
          </Alert>
        </Collapse>
      </Stack>
    </Box>
  );
};

SearchPage.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default SearchPage;
