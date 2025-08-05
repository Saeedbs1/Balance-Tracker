import { useMemo } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  expenseCategories,
  incomeCategories,
  currencies,
  types,
} from "../constants";

export default function EntryForm({
  title,
  setTitle,
  amount,
  setAmount,
  type,
  setType,
  category,
  setCategory,
  currency,
  setCurrency,
  onAdd,
}) {
  const categories = useMemo(
    () => (type === "income" ? incomeCategories : expenseCategories),
    [type]
  );

  return (
    <>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ flex: "2 1 150px" }}
          size="small"
          autoComplete="off"
        />
        <FormControl sx={{ flex: "1 1 120px" }} size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => {
              setType(e.target.value);
              setCategory(
                e.target.value === "income"
                  ? incomeCategories[0]
                  : expenseCategories[0]
              );
            }}
          >
            {types.map((t) => (
              <MenuItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: "1 1 150px" }} size="small">
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ flex: "1 1 100px" }}
          size="small"
        />
        <FormControl sx={{ flex: "1 1 100px" }} size="small">
          <InputLabel>Currency</InputLabel>
          <Select
            value={currency}
            label="Currency"
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={onAdd}
          sx={{ height: 40 }}
        >
          Add
        </Button>
      </Box>
    </>
  );
}
