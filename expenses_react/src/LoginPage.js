import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { login, register } from "./api";

export default function LoginPage({ setAuthToken, setAlert }) {
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [alert, setLocalAlert] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const handleAlertClose = () =>
    setLocalAlert((prev) => ({ ...prev, open: false }));

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          variant="filled"
          onClose={handleAlertClose}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom mb={4}>
          {authMode === "login" ? "Login" : "Register"}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={async () => {
              try {
                if (authMode === "login") {
                  const { token } = await login(username, password);
                  setAuthToken(token);
                  localStorage.setItem("token", token);
                  setLocalAlert({
                    open: true,
                    message: "Login successful!",
                    severity: "success",
                  });
                } else {
                  await register(username, password);
                  setAuthMode("login");
                  setLocalAlert({
                    open: true,
                    message: "Registration successful! Please login.",
                    severity: "success",
                  });
                }
                setAuthError("");
              } catch (err) {
                setLocalAlert({
                  open: true,
                  message: err?.response?.data?.error || "Auth failed",
                  severity: "error",
                });
                setAuthError(err?.response?.data?.error || "Auth failed");
              }
            }}
          >
            {authMode === "login" ? "Login" : "Register"}
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthError("");
            }}
          >
            {authMode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
