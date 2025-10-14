import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import React from "react";

const DRAWER_WIDTH = 240;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant={mdUp ? "permanent" : "temporary"}
        open={mdUp ? true : open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            overflowX: "hidden",
            boxSizing: "border-box",
          },
        }}
      >
        <Sidebar />
      </Drawer>

      <Box sx={{ flex: 1, ml: { md: `${DRAWER_WIDTH}px` } }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1200,
            bgcolor: "background.default",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Topbar onMenuClick={() => setOpen(true)} />
        </Box>
        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
