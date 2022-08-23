import {
  LinearProgress,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { AxiosError } from "axios";
import { PetSearchResponse } from "../../types/types";
import axiosClient from "../../utils/axiosClient";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/router";

const PetsTable = () => {
  const columnHelper = createColumnHelper<PetSearchResponse>();
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("type", {
      header: "Type",
    }),
    columnHelper.accessor("breed", {
      header: "Breed",
    }),
    columnHelper.accessor("adoptionStatus", {
      header: "Adoption Status",
    }),
    columnHelper.accessor("height", {
      header: "Height",
    }),
    columnHelper.accessor("weight", {
      header: "Weight",
    }),
    columnHelper.accessor("petId", {
      header: "ID",
    }),
  ];
  const router = useRouter();
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useQuery<{ message: string; response: PetSearchResponse[] }, AxiosError>(
    ["searchResults"],
    async () => {
      return (await axiosClient.get(`/pets/search?`)).data;
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );
  const table = useReactTable({
    data: searchResults?.response ? searchResults?.response : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <>
      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableCell>
                  ))}
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Tooltip title="Edit pet">
                      <IconButton
                        size="small"
                        onClick={() => {
                          router.push(
                            `/pet/${row.getAllCells()[6].getValue()}`
                          );
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );
};

export default PetsTable;
