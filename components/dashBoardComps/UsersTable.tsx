import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useSearchUser } from "../../hooks/useSearchUser";
import CollapseableRow from "./CollapseableRow";

export interface UserColumn {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  id: string;
}

const UsersTable = () => {
  const [userSearch, setUserSearch] = useState("");
  const [usersInfo, setUsersInfo] = useState<UserColumn[]>([]);
  const { users, searchUsers } = useSearchUser("firstName", userSearch);
  const columnHelper = createColumnHelper<UserColumn>();
  const columns = [
    columnHelper.accessor("firstName", {
      header: "First Name",
    }),
    columnHelper.accessor("lastName", {
      header: "Last Name",
    }),
    columnHelper.accessor("name", {
      header: "Provider Username",
    }),
    columnHelper.accessor("email", {
      header: "Email",
    }),
    columnHelper.accessor("phoneNumber", {
      header: "Phone Number",
    }),
    columnHelper.accessor("id", {
      header: "ID",
    }),
  ];
  const table = useReactTable({
    data: usersInfo,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    const userArr = users?.response.map((el) => {
      return {
        firstName: el.firstName ? el.firstName : "Unassigned",
        lastName: el.lastName ? el.lastName : "Unassigned",
        name: el.name ? el.name : "Unassigned",
        email: el.email,
        phoneNumber: el.phoneNumber ? el.phoneNumber : "Unassigned",
        id: el.id ? el.id : "not found",
      };
    });
    if (userArr) setUsersInfo(userArr);
  }, [users]);
  useEffect(() => {
    searchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch]);
  return (
    <Table>
      <TableHead>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            <TableCell />
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
            <TableCell />
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <CollapseableRow row={row} key={row.id} />
        ))}
      </TableBody>
    </Table>
  );
};
export default UsersTable;
