import React, { useState, useEffect } from "react";
import { Box, Button, Stack, TextField, InputAdornment } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDebounce } from "../../hooks/useDebounce";
import axiosClient from "../../utils/axiosClient";
import { signIn } from "next-auth/react";

const emailValidator: RegExp =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const passwordValidator: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const phoneNumberValidator: RegExp =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

const CreateUserForm = ({
  handleCloseModal,
}: {
  handleCloseModal: () => void;
}) => {
  const [input, setInput] = useState<{
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    emailValid: boolean;
    showPassword: boolean;
    confirmPassword: string;
    passwordValid: boolean;
    passwordsMatch: boolean;
    phoneNumber: string;
    phoneNumberValid: boolean;
  }>({
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
    phoneNumberValid: false,
  });
  const { mutate: createUser, isSuccess } = useMutation(
    (userData: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      password: string;
    }): Promise<object> => axiosClient.post("/users/createuser", userData)
  );
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
        handleCloseModal();
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);
  const getIsUserValid = useDebounce(() => refetch(), 500);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    )
      return;
    createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      email: input.email,
      password: input.password,
    });
  };
  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (field === "email" && e.target.value)
        setInput({
          ...input,
          email: e.target.value,
          emailValid: emailValidator.test(e.target.value),
        });
      else if (field === "firstName" && e.target.value)
        setInput({
          ...input,
          firstName: e.target.value,
        });
      else if (field === "lastName" && e.target.value)
        setInput({
          ...input,
          lastName: e.target.value,
        });
      else if (field === "phoneNumber" && e.target.value)
        setInput({
          ...input,
          phoneNumber: e.target.value,
          phoneNumberValid: phoneNumberValidator.test(e.target.value),
        });
      else if (field === "password" && e.target.value)
        setInput({
          ...input,
          password: e.target.value,
          passwordValid: passwordValidator.test(e.target.value),
        });
      else if (field === "confirmPassword")
        setInput({
          ...input,
          confirmPassword: e.target.value,
          passwordsMatch: input.password === e.target.value,
        });
      else
        setInput({ ...input, [field as keyof typeof input]: e.target.value });

      getIsUserValid();
    };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack gap={1} style={{ minWidth: "400px" }}>
        <TextField
          required
          label="First Name"
          value={input.firstName}
          style={{ minHeight: "80px" }}
          onChange={handleChange("firstName")}
        />
        <TextField
          required
          label="Last Name"
          value={input.lastName}
          style={{ minHeight: "80px" }}
          onChange={handleChange("lastName")}
        />
        <TextField
          required
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
          required
          type={input.showPassword ? "text" : "password"}
          label="Password"
          value={input.password}
          style={{ minHeight: "80px" }}
          error={!input.passwordValid && input.password !== ""}
          helperText={
            !input.passwordValid && input.password !== ""
              ? "Minimum eight characters, at least one letter and one number"
              : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {input.showPassword ? (
                  <Visibility
                    cursor={"pointer"}
                    onClick={() =>
                      setInput((state) => ({
                        ...state,
                        showPassword: !state.showPassword,
                      }))
                    }
                  />
                ) : (
                  <VisibilityOff
                    cursor={"pointer"}
                    onClick={() =>
                      setInput((state) => ({
                        ...state,
                        showPassword: !state.showPassword,
                      }))
                    }
                  />
                )}
              </InputAdornment>
            ),
          }}
          onChange={handleChange("password")}
        ></TextField>
        <TextField
          required
          error={!input.passwordsMatch && input.confirmPassword !== ""}
          helperText={
            !input.passwordsMatch && input.confirmPassword
              ? "Passwords don't match"
              : ""
          }
          type={input.showPassword ? "text" : "password"}
          style={{ minHeight: "80px" }}
          label="Confirm password"
          value={input.confirmPassword}
          onChange={handleChange("confirmPassword")}
        ></TextField>
        <TextField
          error={!input.emailValid}
          required
          label="Email"
          style={{ minHeight: "80px" }}
          value={input.email}
          onChange={handleChange("email")}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {input.email && typeof isUserValid?.response !== "string" ? (
                  !isUserValid?.response.emailExists && input.emailValid ? (
                    <DoneIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  )
                ) : (
                  <></>
                )}
              </InputAdornment>
            ),
          }}
        ></TextField>
        <Button type="submit" variant="contained">
          Create User
        </Button>
      </Stack>
    </Box>
  );
};

export default CreateUserForm;
