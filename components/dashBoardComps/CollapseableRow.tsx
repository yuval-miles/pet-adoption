import React, { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Row, flexRender } from "@tanstack/react-table";
import { UserColumn } from "./UsersTable";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import { UserPetsResponseType } from "../../hooks/useUserPets";
import { AxiosError } from "axios";
import LinearProgress from "@mui/material/LinearProgress";
import PetCard from "../PetCard";
import { useSession } from "next-auth/react";
import useGetSavedPets from "../../hooks/useGetSavedPets";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const CollapseableRow = ({ row }: { row: Row<UserColumn> }) => {
  const { data: userInfo, status } = useSession();
  const { savedPets } = useGetSavedPets();
  const [hasFetched, setHasFetched] = useState(false);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useQuery<
    {
      message: string;
      response: UserPetsResponseType;
    },
    AxiosError
  >(
    [row.getAllCells()[5].getValue()],
    async () =>
      (
        await axiosClient.get(
          `/users/${row.getAllCells()[5].getValue()}/getuserspets`
        )
      ).data,
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );
  const {
    isSuccess: adminSuccess,
    isLoading: adminLoading,
    isError: adminError,
    mutate: makeAdmin,
  } = useMutation<
    {
      message: string;
      response: { message: string; response: string };
    },
    AxiosError,
    string
  >(
    async (userId: string) =>
      (await axiosClient.post(`/admin/giveadminrole`, { userId })).data
  );
  const handleMakeAdmin = (userId: string) => () => {
    if (!adminSuccess) makeAdmin(userId);
  };
  useEffect(() => {
    if (!hasFetched && open) {
      refetch();
      setHasFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <React.Fragment key={row.id}>
      <TableRow>
        <TableCell>
          <Tooltip title="Show pets">
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Tooltip>
        </TableCell>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
        <TableCell>
          <Tooltip
            title={
              adminSuccess
                ? "Success"
                : adminError
                ? "Error"
                : "Give user admin"
            }
          >
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={handleMakeAdmin(
                row.getVisibleCells()[5].getValue() as string
              )}
              disabled={adminLoading}
            >
              <AdminPanelSettingsIcon
                color={
                  adminSuccess ? "primary" : adminError ? "error" : "action"
                }
              />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                width: "100%",
                margin: "10px",
                border: "1px solid grey",
                borderRadius: "5px",
                padding: "10px",
                overflowX: "auto",
              }}
            >
              {isLoading ? (
                <>
                  <LinearProgress />
                </>
              ) : (
                <>
                  <Stack direction={"row"} gap={2}>
                    {data?.response.length ? (
                      <>
                        {data?.response.map((el) => {
                          return (
                            <PetCard
                              key={el.pet.id}
                              name={el.pet.name}
                              adoptionStatus={el.status}
                              weight={el.pet.weight}
                              height={el.pet.height}
                              picture={el.pet.picture}
                              breed={el.pet.breed}
                              type={el.pet.type}
                              petId={el.pet.id}
                              userId={
                                status === "authenticated"
                                  ? (userInfo.id! as string)
                                  : undefined
                              }
                              saved={savedPets.pets?.[el.pet.id] ? true : false}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Typography>
                            This user dose not have any pets...{" "}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Stack>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default CollapseableRow;
