"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = (): void => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = (): void => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
      />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f5f5f5",
            p: 3,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
