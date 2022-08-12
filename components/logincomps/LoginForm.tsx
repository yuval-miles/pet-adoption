import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Collapse,
  Alert,
} from "@mui/material";
import { signIn } from "next-auth/react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";

const LoginForm = ({ handleCloseModal }: { handleCloseModal: () => void }) => {
  const [input, setInput] = useState<{
    password: string;
    email: string;
    showPassword: boolean;
    showError: boolean;
  }>({
    password: "",
    email: "",
    showPassword: false,
    showError: false,
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await signIn("credentials", {
      redirect: false,
      email: input.email,
      password: input.password,
    });
    if (!response?.error) handleCloseModal();
    else {
      if (response.error === "CredentialsSignin")
        setInput((state) => ({ ...state, showError: true }));
    }
  };
  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput({
        ...input,
        [field as keyof typeof input]: e.target.value,
        showError: false,
      });
    };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack gap={2}>
        <TextField
          required
          label="Email"
          value={input.email}
          onChange={handleChange("email")}
        ></TextField>
        <TextField
          required
          type={input.showPassword ? "text" : "password"}
          label="Password"
          value={input.password}
          style={{ minHeight: "80px" }}
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
        <Collapse in={input.showError}>
          <Alert severity="error">Email or password is incorrect</Alert>
        </Collapse>
        <Button type="submit" variant="contained">
          Login
        </Button>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{ textTransform: "unset" }}
        >
          Login With Google
        </Button>
        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          variant="outlined"
          startIcon={<GitHubIcon />}
          sx={{ textTransform: "unset" }}
        >
          Login with github
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginForm;
