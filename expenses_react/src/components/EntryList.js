import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EntryList({ entries, onDelete, formatAmount }) {
  if (entries.length === 0)
    return (
      <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
        No entries found
      </Typography>
    );

  return (
    <List sx={{ maxHeight: 500, overflowY: "auto" }}>
      {entries.map((e) => (
        <ListItem
          key={e.id}
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(e.id)}
            >
              <DeleteIcon />
            </IconButton>
          }
          divider
          sx={{ py: 1 }}
        >
          <ListItemText
            primary={`${e.title} (${e.category})`}
            secondary={
              <Typography
                component="span"
                sx={{
                  color: e.type === "income" ? "success.main" : "error.main",
                }}
              >
                {e.type === "income" ? "+" : "-"} {e.currency}{" "}
                {formatAmount(e.amount)}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
