import { Box, TextField, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function FilterBar({
  search,
  setSearch,
  filter,
  setFilter,
  selectedDate,
  setSelectedDate,
}) {
  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={3}>
      <TextField
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ flex: "1 1 300px" }}
        size="small"
      />
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, val) => val && setFilter(val)}
        size="small"
        color="primary"
        sx={{ flexShrink: 0 }}
      >
        <ToggleButton value="day">Day</ToggleButton>
        <ToggleButton value="month">Month</ToggleButton>
        <ToggleButton value="year">Year</ToggleButton>
      </ToggleButtonGroup>
      <DatePicker
        label={
          filter === "day" ? "Date" : filter === "month" ? "Month" : "Year"
        }
        views={
          filter === "day"
            ? ["year", "month", "day"]
            : filter === "month"
              ? ["year", "month"]
              : ["year"]
        }
        value={selectedDate}
        onChange={setSelectedDate}
        slotProps={{
          textField: { size: "small", sx: { minWidth: 130 } },
        }}
      />
    </Box>
  );
}
