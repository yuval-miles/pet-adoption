import { Box, Button, Fade, Modal, Stack } from "@mui/material";
import React, { useState } from "react";
import CreateUserOrEditForm from "../CreateUserOrEditForm";
import LoginForm from "./LoginForm";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const LoginModal = ({
  openModal,
  handleCloseModal,
}: {
  openModal: boolean;
  handleCloseModal: () => void;
}) => {
  const [showLogin, setShowLogin] = useState<Boolean>(true);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowLogin((state) => !state);
  };
  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      closeAfterTransition
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Fade in={openModal}>
        <Box sx={style}>
          <Stack gap={3}>
            {showLogin ? (
              <LoginForm handleCloseModal={handleCloseModal} />
            ) : (
              <CreateUserOrEditForm handleCloseModal={handleCloseModal} />
            )}
            <Button
              variant="text"
              onClick={handleClick}
              sx={{ textTransform: "unset" }}
            >
              {showLogin ? "Dont have an account?" : "Already have an account?"}
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default LoginModal;
