'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer: React.FC = () => {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (!year) return null; // Đợi client mount xong mới render

  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {year} Library System. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link href="/terms" underline="hover">Điều khoản</Link> • <Link href="/privacy" underline="hover">Chính sách</Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
