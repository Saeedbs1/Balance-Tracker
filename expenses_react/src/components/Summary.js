import { Box, Typography, Divider} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "../constants";

export default function Summary({
  consolidatedSummary,
  monthlySummary,
  categoryData,
  selectedDate,
  formatAmount,
}) {
  return (
    <>
      <Box
        display="flex"
        gap={3}
        flexWrap="wrap"
        justifyContent="space-around"
        textAlign="center"
        mb={3}
      >
        <Box flex={1}>
          <Typography variant="subtitle1" color="success.main">
            Income
          </Typography>
          <Typography variant="h5">
            ${consolidatedSummary.income.toFixed(2)}
          </Typography>
        </Box>
        <Box flex={1}>
          <Typography variant="subtitle1" color="error.main">
            Expense
          </Typography>
          <Typography variant="h5">
            ${consolidatedSummary.expense.toFixed(2)}
          </Typography>
        </Box>
        <Box flex={1}>
          <Typography
            variant="subtitle1"
            color={
              consolidatedSummary.balance >= 0 ? "primary.main" : "error.main"
            }
          >
            Balance
          </Typography>
          <Typography variant="h5">
            ${consolidatedSummary.balance.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Box height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlySummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip formatter={(value) => `$${formatAmount(value)}`} />
            <Line
              type="monotone"
              dataKey="Income"
              stroke="#4caf50"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="Expense"
              stroke="#f44336"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Expense Distribution for{" "}
        {selectedDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </Typography>

      {categoryData.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          No expense data for this month
        </Typography>
      ) : (
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip
                formatter={(value) => `$${formatAmount(value)}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </>
  );
}
