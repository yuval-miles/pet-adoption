import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  Collapse,
  Tooltip,
  Typography,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
import axiosClient from "../utils/axiosClient";
import { signIn } from "next-auth/react";
import { UserResponse } from "../types/userTypes";
import PasswordFields from "./logincomps/PasswordFields";
import { AxiosError } from "axios";

const emailValidator: RegExp =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const passwordValidator: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const phoneNumberValidator: RegExp =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export interface Input {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  password: string;
  confirmPassword: string;
  email: string | null | undefined;
  emailValid: boolean;
  passwordValid: boolean;
  showPassword: boolean;
  passwordsMatch: boolean;
  phoneNumber: string | null | undefined;
  phoneNumberValid: boolean;
  showError: boolean;
}

interface UpdateType {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
}

const CreateUserForm = ({
  handleCloseModal,
  isEditForm,
  userData,
  userId,
  provider,
}: {
  handleCloseModal?: () => void;
  isEditForm?: boolean;
  userData?: UserResponse;
  userId?: string;
  provider?: string;
}) => {
  const [changePassword, setChangePassword] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [input, setInput] = useState<Input>(
    !isEditForm
      ? {
          firstName: "",
          lastName: "",
          password: "",
          confirmPassword: "",
          email: "",
          emailValid: true,
          passwordValid: true,
          showPassword: false,
          passwordsMatch: true,
          phoneNumber: "",
          phoneNumberValid: true,
          showError: false,
        }
      : {
          firstName: userData?.firstName ? userData.firstName : "",
          lastName: userData?.lastName ? userData.lastName : "",
          password: "",
          confirmPassword: "",
          email: userData?.email,
          phoneNumber: userData?.phoneNumber ? userData.phoneNumber : "",
          emailValid: true,
          passwordValid: true,
          showPassword: false,
          passwordsMatch: true,
          phoneNumberValid: true,
          showError: false,
        }
  );
  const { mutate: createUser, isSuccess } = useMutation(
    (userData: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      password: string;
    }): Promise<object> => axiosClient.post("/users/createuser", userData)
  );
  const {
    mutate: updateUser,
    isSuccess: updateSuccess,
    isError: updateError,
    error: updateErrorObj,
  } = useMutation<
    { message: string; response: string },
    AxiosError,
    UpdateType
  >((updateData) => axiosClient.put(`/users/updateuser/${userId}`, updateData));
  const { data: isUserValid, refetch } = useQuery(
    ["userExists"],
    async () =>
      (await axiosClient.get(`/users/userexists?email=${input.email}`)).data,
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );
  useEffect(() => {
    if (isSuccess)
      (async () => {
        await signIn("credentials", {
          redirect: false,
          email: input.email,
          password: input.password,
        });
        if (handleCloseModal) handleCloseModal();
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);
  useEffect(() => {
    if (updateError || updateSuccess) {
      setShowUpdateAlert(true);
      setTimeout(() => setShowUpdateAlert(false), 3000);
    }
    if (updateSuccess && userData) {
      if (userData.firstName && input.firstName)
        userData.firstName = input.firstName;
      if (userData.lastName && input.lastName)
        userData.lastName = input.lastName;
      if (userData.phoneNumber && input.phoneNumber)
        userData.phoneNumber = input.phoneNumber;
      if (userData.email && input.email) userData.email = input.email;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateError, updateSuccess]);
  const getIsUserValid = useDebounce(() => refetch(), 500);
  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !input.firstName ||
      !input.lastName ||
      !input.password ||
      !input.email ||
      !input.emailValid ||
      !input.passwordValid ||
      !input.passwordsMatch ||
      !input.phoneNumberValid ||
      !input.phoneNumber ||
      (typeof isUserValid?.response !== "string" &&
        isUserValid?.response.emailExists)
    ) {
      setInput((state) => ({ ...state, showError: true }));
      return;
    }
    createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      email: input.email,
      password: input.password,
    });
  };
  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData || !userId) return;
    if (
      !input.emailValid ||
      !input.passwordValid ||
      !input.passwordsMatch ||
      !input.phoneNumberValid ||
      (typeof isUserValid?.response !== "string" &&
        isUserValid?.response.emailExists &&
        input.email !== userData?.email) ||
      (changePassword && !input.password)
    ) {
      setInput((state) => ({ ...state, showError: true }));
      return;
    }
    const updateObj: { [key: string]: string | null | undefined | boolean } =
      {};
    for (const [key, value] of Object.entries(userData)) {
      if (input[key as keyof Input] && input[key as keyof Input] !== value) {
        updateObj[key] = input[key as keyof Input];
      }
    }
    if (changePassword) updateObj.password = input.password;
    if (Object.keys(updateObj).length) {
      updateUser(
        updateObj as {
          firstName?: string;
          lastName?: string;
          phoneNumber?: string;
          email?: string;
          password?: string;
        }
      );
    }
  };
  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (field === "email" && e.target.value) {
        setInput({
          ...input,
          email: e.target.value,
          emailValid: emailValidator.test(e.target.value),
          showError: false,
        });
        getIsUserValid();
      } else if (field === "firstName" && e.target.value)
        setInput({
          ...input,
          firstName: e.target.value,
          showError: false,
        });
      else if (field === "lastName" && e.target.value)
        setInput({
          ...input,
          lastName: e.target.value,
          showError: false,
        });
      else if (field === "phoneNumber" && e.target.value)
        setInput({
          ...input,
          phoneNumber: e.target.value,
          phoneNumberValid: phoneNumberValidator.test(e.target.value),
          showError: false,
        });
      else if (field === "password" && e.target.value)
        setInput({
          ...input,
          password: e.target.value,
          passwordValid: passwordValidator.test(e.target.value),
          showError: false,
        });
      else if (field === "confirmPassword")
        setInput({
          ...input,
          confirmPassword: e.target.value,
          passwordsMatch: input.password === e.target.value,
          showError: false,
        });
      else
        setInput({ ...input, [field as keyof typeof input]: e.target.value });
    };
  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
        !isEditForm ? handleCreateUser(e) : handleEditUser(e)
      }
    >
      <Stack gap={3}>
        <Stack gap={1} style={{ minWidth: "400px" }}>
          <TextField
            required={!isEditForm}
            label="First Name"
            value={input.firstName}
            style={{ minHeight: "80px" }}
            onChange={handleChange("firstName")}
          />
          <TextField
            required={!isEditForm}
            label="Last Name"
            value={input.lastName}
            style={{ minHeight: "80px" }}
            onChange={handleChange("lastName")}
          />
          <TextField
            required={!isEditForm}
            label="Phone number"
            value={input.phoneNumber}
            error={!input.phoneNumberValid && input.phoneNumber !== ""}
            helperText={
              !input.phoneNumberValid && input.phoneNumber !== ""
                ? "Please enter a valid phone number"
                : ""
            }
            style={{ minHeight: "80px" }}
            onChange={handleChange("phoneNumber")}
          />
          <TextField
            error={!input.emailValid}
            required={!isEditForm}
            label="Email"
            style={{ minHeight: "80px" }}
            value={input.email}
            onChange={handleChange("email")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {input.email && typeof isUserValid?.response !== "string" ? (
                    (!isUserValid?.response.emailExists && input.emailValid) ||
                    input.email === userData?.email ? (
                      <DoneIcon color="success" />
                    ) : (
                      <Tooltip title="Email already in use">
                        <CloseIcon color="error" />
                      </Tooltip>
                    )
                  ) : (
                    <></>
                  )}
                </InputAdornment>
              ),
            }}
          ></TextField>
          {isEditForm && !provider ? (
            <Stack gap={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setChangePassword((state) => !state);
                  setInput((state) => ({
                    ...state,
                    password: "",
                    confirmPassword: "",
                    showPassword: false,
                    passwordsMatch: true,
                    passwordValid: true,
                  }));
                }}
              >
                Change password
              </Button>
              <Collapse in={changePassword}>
                <PasswordFields
                  input={input}
                  setInput={setInput}
                  handleChange={handleChange}
                  isEditForm
                />
              </Collapse>
            </Stack>
          ) : isEditForm && provider ? (
            <></>
          ) : (
            <PasswordFields
              input={input}
              setInput={setInput}
              handleChange={handleChange}
            />
          )}
          <Collapse in={input.showError}>
            <Alert severity="error">Please provide valid information</Alert>
          </Collapse>
          <Button type="submit" variant="contained">
            {!isEditForm ? "Create User" : "Edit Profile"}
          </Button>
        </Stack>
        <Collapse in={showUpdateAlert}>
          <Alert severity={updateSuccess ? "success" : "error"}>
            {updateSuccess ? (
              "Update successful!"
            ) : updateError ? (
              <Stack>
                <Typography>Ohh no an error has occuerd</Typography>
                <Typography>
                  Error status: {updateErrorObj.status}, Error message:{" "}
                  {updateErrorObj.message}
                </Typography>
              </Stack>
            ) : (
              <></>
            )}
          </Alert>
        </Collapse>
      </Stack>
    </Box>
  );
};

export default CreateUserForm;
