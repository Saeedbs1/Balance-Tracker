import { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Button,
  LinearProgress,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { expenseCategories } from "../constants";
import { fetchBudgets, saveBudget, setToken } from "../api";

export default function Budgets({
  selectedDate,
  setAlert,
  entries,
  convertToBase,
  budgetCurrency = "USD",
  authToken,
}) {
  const [budgets, setBudgets] = useState({});
  const [budgetsLoaded, setBudgetsLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const alertedRef = useRef({});

  useEffect(() => {
    if (!authToken || budgetsLoaded) return;
    setToken(authToken);
    const loadBudgets = async () => {
      try {
        const data = await fetchBudgets(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1
        );
        const obj = {};
        data.forEach(({ category, amount }) => {
          obj[category] = amount;
        });
        setBudgets(obj);
        setBudgetsLoaded(true);
        alertedRef.current = {};
      } catch {
        setAlert({
          open: true,
          message: "Failed to fetch budgets",
          severity: "error",
        });
      }
    };
    loadBudgets();
  }, [selectedDate, setAlert, authToken, budgetsLoaded]);

  const handleBudgetChange = (category, value) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: value === "" ? "" : Number(value),
    }));
  };

  const budgetProgress = useMemo(() => {
    const progress = {};
    for (const cat of expenseCategories) {
      const spent = entries
        .filter(
          (e) =>
            e.type === "expense" &&
            e.category === cat &&
            e.date.getMonth() === selectedDate.getMonth() &&
            e.date.getFullYear() === selectedDate.getFullYear()
        )
        .reduce((sum, e) => sum + convertToBase(e.amount, e.currency), 0);

      const budget = Number(budgets[cat]) || 0;
      const percent = budget > 0 ? (spent / budget) * 100 : 0;

      progress[cat] = { spent, budget, percent };
    }
    return progress;
  }, [entries, budgets, selectedDate, convertToBase]);

  useEffect(() => {
    if (!budgetsLoaded || editMode) return;
    for (const [cat, { percent, budget, spent }] of Object.entries(
      budgetProgress
    )) {
      if (budget <= 0 || isNaN(percent) || spent <= 0) continue;
      const prevAlert = alertedRef.current[cat] || null;
      if (percent > 100 && prevAlert !== "exceeded") {
        setAlert({
          open: true,
          message: `Budget exceeded for ${cat}!`,
          severity: "error",
        });
        alertedRef.current[cat] = "exceeded";
      } else if (
        percent > 80 &&
        percent <= 100 &&
        prevAlert !== "approaching"
      ) {
        setAlert({
          open: true,
          message: `Budget approaching limit for ${cat}`,
          severity: "warning",
        });
        alertedRef.current[cat] = "approaching";
      } else if (percent <= 80 && prevAlert !== null) {
        alertedRef.current[cat] = null;
      }
    }
  }, [budgetProgress, setAlert, budgetsLoaded, editMode]);

  return (
    <Box>
      {!editMode ? (
        <>
          <TableContainer
            sx={{
              mb: 4,
              boxShadow: 3,
              borderRadius: 2,
              background: (theme) => theme.palette.background.paper,
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 600,
                "& th, & td": { padding: "16px 16px" },
                "& thead th": {
                  background: (theme) => theme.palette.grey[100],
                  fontWeight: 600,
                  fontSize: "1rem",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Budget ({budgetCurrency})</TableCell>
                  <TableCell align="right">Spent (USD)</TableCell>
                  <TableCell align="right" sx={{ minWidth: 200 }}>
                    Progress
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenseCategories
                  .filter((cat) => Number(budgets[cat]) > 0)
                  .map((cat) => {
                    const {
                      spent = 0,
                      budget = 0,
                      percent = 0,
                    } = budgetProgress[cat] || {};
                    return (
                      <TableRow
                        key={cat}
                        sx={{
                          "&:nth-of-type(even)": {
                            background: (theme) => theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>{cat}</TableCell>
                        <TableCell align="right">
                          {budget > 0 ? budget.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {spent > 0 ? spent.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: 200 }}>
                          {budget > 0 ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(percent, 100)}
                                sx={{
                                  height: 18,
                                  borderRadius: 5,
                                  flex: 1,
                                  minWidth: 120,
                                }}
                                color={
                                  percent > 100
                                    ? "error"
                                    : percent > 80
                                    ? "warning"
                                    : "primary"
                                }
                              />
                              <Typography
                                variant="body2"
                                sx={{ minWidth: 48, textAlign: "right" }}
                              >
                                {percent.toFixed(1)}%
                              </Typography>
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="outlined" onClick={() => setEditMode(true)}>
            Edit Budgets
          </Button>
        </>
      ) : (
        <>
          {expenseCategories.map((cat) => (
            <Box key={cat} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{cat}</Typography>
              <TextField
                type="number"
                value={budgets[cat] || ""}
                onChange={(e) => handleBudgetChange(cat, e.target.value)}
                fullWidth
                inputProps={{ min: 0 }}
                helperText={`Budget amount in ${budgetCurrency}`}
              />
            </Box>
          ))}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={async () => {
                try {
                  await Promise.all(
                    Object.entries(budgets).map(([category, amount]) =>
                      saveBudget({
                        category,
                        year: selectedDate.getFullYear(),
                        month: selectedDate.getMonth() + 1,
                        amount,
                      })
                    )
                  );
                  setAlert({
                    open: true,
                    message: "Budgets saved!",
                    severity: "success",
                  });
                  setEditMode(false);
                } catch {
                  setAlert({
                    open: true,
                    message: "Failed to save budgets",
                    severity: "error",
                  });
                }
              }}
            >
              Save Budgets
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
