import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import { AxiosError } from "axios";

type VariantType =
  | "button"
  | "caption"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "inherit"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "overline"
  | undefined;

const PetInfo = ({
  label,
  value,
  suffix,
  variant,
  textFieldWidth,
  fontSize,
  multiline,
  petId,
  stateName,
  stateSetter,
  alertSetter,
}: {
  label?: string;
  value: string | number;
  suffix?: string;
  variant?: VariantType;
  textFieldWidth?: number;
  fontSize: number;
  multiline?: boolean;
  petId: string;
  stateName: string;
  stateSetter: React.Dispatch<React.SetStateAction<object>>;
  alertSetter: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      type: "error" | "success";
      message: string | AxiosError;
    }>
  >;
}) => {
  const { data } = useSession();
  const [edit, setEdit] = useState(false);
  const [input, setInput] = useState(value);
  const { mutate } = useMutation<
    { message: string; response: string },
    AxiosError,
    { [key: string]: string | number }
  >(
    async (data) =>
      (await axiosClient.put(`/admin/${petId}/updatepet`, data)).data,
    {
      onSuccess: () => {
        stateSetter((state) => ({ ...state, [stateName]: input }));
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
          type: "success",
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
      {data ? (
        <>
          {data.role === "admin" ? (
            <>
              <Stack direction="row" alignItems={"center"} gap={1}>
                {edit ? (
                  <>
                    <Stack direction={"row"} gap={1}>
                      {label && <Typography>{label}: </Typography>}
                      <TextField
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        variant="standard"
                        size={!textFieldWidth ? undefined : "small"}
                        multiline={multiline}
                        minRows={multiline ? 3 : undefined}
                        sx={{
                          width: textFieldWidth
                            ? `${textFieldWidth}px`
                            : "50px",
                        }}
                        InputProps={
                          suffix
                            ? {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {suffix}
                                  </InputAdornment>
                                ),
                                style: {
                                  fontSize: `${fontSize}rem`,
                                },
                              }
                            : {
                                style: {
                                  fontSize: `${fontSize}rem`,
                                },
                              }
                        }
                      />
                    </Stack>
                  </>
                ) : (
                  <>
                    <Typography variant={variant}>
                      {label && `${label}: `}
                      {value}
                      {suffix && suffix}
                    </Typography>
                  </>
                )}
                {edit && (
                  <Tooltip title="Submit">
                    <IconButton
                      size="small"
                      onClick={() => mutate({ [stateName]: input })}
                    >
                      <DoneIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Edit field">
                  <IconButton
                    size="small"
                    onClick={() => setEdit((state) => !state)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant={variant}>
                {label && `${label}: `}
                {value}
                {suffix && suffix}
              </Typography>
            </>
          )}
        </>
      ) : (
        <>
          <Typography variant={variant}>
            {label && `${label}: `}
            {value}
            {suffix && suffix}
          </Typography>
        </>
      )}
    </>
  );
};

export default PetInfo;
