import {
  LinearProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import Navigation from "../Layout/Navigation";
import Divider from "@mui/material/Divider";
import { useState } from "react";
import { useSession } from "next-auth/react";
import useUserPets from "../hooks/useUserPets";
import PetCard from "../components/PetCard";
import useGetSavedPets from "../hooks/useGetSavedPets";
import { useRouter } from "next/router";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const { data, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [filter, setFilter] = useState("adoptedPets");
  const { savedPets } = useGetSavedPets();
  const { usersPets, isLoading } = useUserPets();
  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };
  return (
    <>
      <Stack width={"100%"}>
        <Stack gap={2}>
          <Typography variant="h2" alignSelf={"center"}>
            My Pets :{" "}
          </Typography>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleToggle}
            aria-label="filter"
            sx={{ display: "flex", justifyContent: "center" }}
            color={"primary"}
          >
            <ToggleButton value="adoptedPets" aria-label="left aligned">
              Adopted Pets
            </ToggleButton>
            <ToggleButton value="fosteredPets" aria-label="left aligned">
              Fostered Pets
            </ToggleButton>
            <ToggleButton value="savedPets" aria-label="centered">
              Saved pets
            </ToggleButton>
          </ToggleButtonGroup>
          <Divider sx={{ marginTop: "20px", marginBottom: "20px" }} />
        </Stack>
        {isLoading ? (
          <LinearProgress />
        ) : (
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(345px, 1fr))",
              gap: "10px",
            }}
          >
            {filter === "adoptedPets" ? (
              <>
                {Object.keys(usersPets.adoptedPets).length ? (
                  <>
                    {Object.values(usersPets.adoptedPets).map((el) => {
                      return (
                        <PetCard
                          key={el.id}
                          name={el.name}
                          adoptionStatus={el.adoptionStatus}
                          weight={el.weight}
                          height={el.height}
                          picture={el.picture}
                          breed={el.breed}
                          type={el.type}
                          petId={el.id}
                          userId={
                            status === "authenticated"
                              ? (data.id! as string)
                              : undefined
                          }
                          saved={savedPets.pets?.[el.id] ? true : false}
                        />
                      );
                    })}
                  </>
                ) : (
                  <Typography>You do not have any adopted pets</Typography>
                )}
              </>
            ) : filter === "fosteredPets" ? (
              <>
                {Object.keys(usersPets.fosteredPets).length ? (
                  <>
                    {Object.values(usersPets.fosteredPets).map((el) => {
                      return (
                        <PetCard
                          key={el.id}
                          name={el.name}
                          adoptionStatus={el.adoptionStatus}
                          weight={el.weight}
                          height={el.height}
                          picture={el.picture}
                          breed={el.breed}
                          type={el.type}
                          petId={el.id}
                          userId={
                            status === "authenticated"
                              ? (data.id! as string)
                              : undefined
                          }
                          saved={savedPets.pets?.[el.id] ? true : false}
                        />
                      );
                    })}
                  </>
                ) : (
                  <Typography>You do not have any fostered pets</Typography>
                )}
              </>
            ) : (
              <>
                {Object.keys(savedPets.pets).length ? (
                  <>
                    {Object.values(savedPets.pets).map((el) => {
                      return (
                        <PetCard
                          key={el.id}
                          name={el.name}
                          adoptionStatus={el.adoptionStatus}
                          weight={el.weight}
                          height={el.height}
                          picture={el.picture}
                          breed={el.breed}
                          type={el.type}
                          petId={el.id}
                          userId={
                            status === "authenticated"
                              ? (data.id! as string)
                              : undefined
                          }
                          saved={savedPets.pets?.[el.id] ? true : false}
                        />
                      );
                    })}
                  </>
                ) : (
                  <Typography>You do not have any saved pets</Typography>
                )}
              </>
            )}
          </Stack>
        )}
      </Stack>
    </>
  );
};

SearchPage.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default SearchPage;
