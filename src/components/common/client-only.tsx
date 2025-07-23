"use client";

import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  ),
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Use a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Return null during SSR to prevent hydration mismatch
  if (typeof window === "undefined") {
    return null;
  }

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
