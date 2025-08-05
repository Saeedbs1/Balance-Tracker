import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Switch,
  Snackbar,
  Alert,
  Paper,
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { expenseCategories, currencies, types } from "./constants";
import EntryForm from "./components/EntryForm";
import EntryList from "./components/EntryList";
import FilterBar from "./components/FilterBar";
import Summary from "./components/Summary";
import Budgets from "./components/Budgets";
import LoginPage from "./LoginPage";

import {
  fetchEntries,
  addEntry,
  deleteEntry,
  fetchRates,
  setToken,
} from "./api";

function App() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(types[0]);
  const [category, setCategory] = useState(expenseCategories[0]);
  const [currency, setCurrency] = useState(currencies[0]);
  const [filter, setFilter] = useState("month");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "warning",
  });
  const [rates, setRates] = useState({ USD: 1 });

  const [authToken, setAuthToken] = useState(
    localStorage.getItem("token") || ""
  );
  useEffect(() => {
    if (authToken) setToken(authToken);
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    const loadData = async () => {
      try {
        const entriesData = await fetchEntries();
        setEntries(
          entriesData.map((e) => ({
            ...e,
            amount: Number(e.amount),
            date: new Date(e.date),
          }))
        );

        const ratesData = await fetchRates();
        setRates(ratesData);
      } catch {
        setAlert({
          open: true,
          message: "Failed to fetch data",
          severity: "error",
        });
      }
    };
    loadData();
  }, [authToken]);

  const formatAmount = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleAddEntry = async () => {
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setAlert({
        open: true,
        severity: "error",
        message: "Please enter valid title and amount.",
      });
      return;
    }

    const formattedDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const newEntry = {
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      currency,
      date: formattedDate,
    };

    try {
      const savedEntry = await addEntry(newEntry);
      savedEntry.amount = Number(savedEntry.amount);
      savedEntry.date = new Date(savedEntry.date);

      setEntries((prev) => [...prev, savedEntry]);
      setTitle("");
      setAmount("");
      setAlert({
        open: true,
        severity: "success",
        message: "Entry added successfully!",
      });
    } catch {
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to add entry.",
      });
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setAlert({ open: true, severity: "info", message: "Entry deleted." });
    } catch {
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to delete entry",
      });
    }
  };

  const convertToBase = (amt, curr) => (rates[curr] ? amt / rates[curr] : amt);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((e) => {
      const d = e.date;
      if (
        (filter === "day" &&
          (d.getDate() !== selectedDate.getDate() ||
            d.getMonth() !== selectedDate.getMonth() ||
            d.getFullYear() !== selectedDate.getFullYear())) ||
        (filter === "month" &&
          (d.getMonth() !== selectedDate.getMonth() ||
            d.getFullYear() !== selectedDate.getFullYear())) ||
        (filter === "year" && d.getFullYear() !== selectedDate.getFullYear())
      )
        return false;
      if (
        term &&
        !e.title.toLowerCase().includes(term) &&
        !e.category.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [entries, filter, selectedDate, search]);

  const consolidatedSummary = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        const amountInBase = convertToBase(e.amount, e.currency);
        if (e.type === "income") acc.income += amountInBase;
        else acc.expense += amountInBase;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [entries, rates]);

  const monthlySummary = useMemo(() => {
    return Array(12)
      .fill(0)
      .map((_, i) => {
        const monthEntries = entries.filter(
          (e) =>
            e.date.getFullYear() === selectedDate.getFullYear() &&
            e.date.getMonth() === i
        );
        const income = monthEntries
          .filter((e) => e.type === "income")
          .reduce((sum, e) => sum + convertToBase(e.amount, e.currency), 0);
        const expense = monthEntries
          .filter((e) => e.type === "expense")
          .reduce((sum, e) => sum + convertToBase(e.amount, e.currency), 0);
        return {
          month: new Date(selectedDate.getFullYear(), i).toLocaleString(
            "default",
            { month: "short" }
          ),
          Income: income,
          Expense: expense,
        };
      });
  }, [entries, selectedDate, rates]);

  const categoryData = useMemo(() => {
    return expenseCategories
      .map((cat) => {
        const spent = entries
          .filter(
            (e) =>
              e.type === "expense" &&
              e.category === cat &&
              e.date.getMonth() === selectedDate.getMonth() &&
              e.date.getFullYear() === selectedDate.getFullYear()
          )
          .reduce((sum, e) => sum + convertToBase(e.amount, e.currency), 0);
        return { name: cat, value: spent };
      })
      .filter((d) => d.value > 0);
  }, [entries, selectedDate, rates]);

  const theme = useMemo(
    () => createTheme({ palette: { mode: darkMode ? "dark" : "light" } }),
    [darkMode]
  );

  if (!authToken) {
    return (
          <LoginPage setAuthToken={setAuthToken} setAlert={setAlert} />
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AppBar position="static" color="primary" enableColorOnDark>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" component="div">
              Tracker: Income & Expenses
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">
                {darkMode ? "Dark" : "Light"} Mode
              </Typography>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode((prev) => !prev)}
                inputProps={{ "aria-label": "toggle dark mode" }}
                color="default"
              />
              <Button
                onClick={() => {
                  setAuthToken("");
                  localStorage.removeItem("token");
                }}
                variant="contained"
                color="error"
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }} elevation={4}>
            <Typography variant="h5" gutterBottom mb={4}>
              Add New Income / Expense
            </Typography>
            <EntryForm
              title={title}
              setTitle={setTitle}
              amount={amount}
              setAmount={setAmount}
              type={type}
              setType={setType}
              category={category}
              setCategory={setCategory}
              currency={currency}
              setCurrency={setCurrency}
              onAdd={handleAddEntry}
            />
          </Paper>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }} elevation={4}>
            <Typography variant="h5" gutterBottom mb={4}>
              Income & Expense Records
            </Typography>

            <FilterBar
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            <EntryList
              entries={filteredEntries}
              onDelete={handleDeleteEntry}
              formatAmount={formatAmount}
            />
          </Paper>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }} elevation={4}>
            <Typography variant="h5" gutterBottom mb={4}>
              Summary (in USD)
            </Typography>
            <Summary
              consolidatedSummary={consolidatedSummary}
              monthlySummary={monthlySummary}
              categoryData={categoryData}
              selectedDate={selectedDate}
              formatAmount={formatAmount}
            />
          </Paper>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }} elevation={4}>
            <Typography variant="h5" gutterBottom mb={4}>
              Budgets for{" "}
              {selectedDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <Budgets
              selectedDate={selectedDate}
              setAlert={setAlert}
              entries={entries}
              convertToBase={convertToBase}
              budgetCurrency="USD"
              authToken={authToken}
            />
          </Paper>
          <Snackbar
            open={alert.open}
            autoHideDuration={4000}
            onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity={alert.severity}
              variant="filled"
              onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
              sx={{ width: "100%" }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
