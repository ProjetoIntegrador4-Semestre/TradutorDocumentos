import { Box, Paper } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import React from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Paper elevation={3} square sx={{ position: "sticky", top: 0, height: "100vh", width: 240 }}>
        <Sidebar />
      </Paper>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={0} square sx={{ position: "sticky", top: 0 }}>
          <Topbar />
        </Paper>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
