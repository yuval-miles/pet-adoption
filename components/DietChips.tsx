import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";

interface ChipData {
  key: string;
  label: string;
}

const DietChips = ({ initChips }: { initChips: Array<string> }) => {
  const { data } = useSession();
  const [input, setInput] = useState("");
  const [dietChips, setDietChips] = useState(
    initChips.map((el) => ({ key: uuidv4(), label: el }))
  );
  const handleDeleteChip = (chipToDelete: ChipData) => () => {
    setDietChips((chips) =>
      dietChips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };
  return (
    <>
      {dietChips.length ? (
        <>
          {data && data.role === "admin" ? (
            <>
              <TextField
                label="Dietary Restrictions"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && input) {
                    setDietChips((state) => [
                      ...state,
                      { key: uuidv4(), label: input },
                    ]);
                    setInput("");
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setDietChips((state) => [
                            ...state,
                            { key: uuidv4(), label: input },
                          ]);
                          setInput("");
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Collapse in={dietChips.length !== 0}>
                <Paper
                  sx={{
                    maxWidth: "250px",
                  }}
                >
                  <Stack gap={1}>
                    <Box
                      sx={{
                        padding: "3px",
                        display: "flex",
                        gap: "5px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {dietChips?.map((el) => (
                        <Chip
                          key={el.key}
                          label={el.label}
                          onDelete={handleDeleteChip(el)}
                        />
                      ))}
                    </Box>
                    <Button>Save</Button>
                  </Stack>
                </Paper>
              </Collapse>
            </>
          ) : (
            <>
              <Stack gap={1}>
                <Typography>Dietary restrictions: </Typography>
                <Paper
                  sx={{
                    padding: "10px",
                    display: "flex",
                    maxWidth: "200px",
                    justifyContent: "center",
                    gap: "5px",
                    flexWrap: "wrap",
                  }}
                >
                  {dietChips?.map((el) => (
                    <Chip key={el.key} label={el.label} />
                  ))}
                </Paper>
              </Stack>
            </>
          )}
        </>
      ) : (
        <Typography>Dietary restrictions: none</Typography>
      )}
    </>
  );
};

export default DietChips;
