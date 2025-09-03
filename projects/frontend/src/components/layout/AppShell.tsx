import { Box, Paper } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { alpha } from "@mui/material/styles";
import React from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Paper
        elevation={0}
        square
        sx={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: 240,
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        <Sidebar />
      </Paper>

      <Box sx={{ flex: 1, bgcolor: "background.default" }}>
        <Box
          sx={(t) => ({
            position: "sticky",
            top: 0,
            zIndex: 1100,
            bgcolor:
              t.palette.mode === "light"
                ? t.palette.background.default
                : alpha(t.palette.background.paper, 0.9),
            borderBottom: "1px solid",
            borderColor: "divider",
            backdropFilter: t.palette.mode === "dark" ? "saturate(120%) blur(6px)" : "none",
          })}
        >
          <Topbar />
        </Box>

        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
