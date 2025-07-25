import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Link from 'next/link';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, userRole }) => {

  // Xác định các mục menu dựa trên role
  let menuItems: { label: string; icon: React.ReactNode; href: string }[] = [];
  if (userRole === 'Admin' || userRole === '1') {
    menuItems = [
      { label: 'Home', icon: <HomeIcon />, href: '/admin/home' },
      { label: 'Quản lý người dùng', icon: <PeopleIcon />, href: '/admin/user-management' },
    ];
  } else if (userRole === 'Staff' || userRole === '2') {
    menuItems = [
      { label: 'Home', icon: <HomeIcon />, href: '/staff/home' },
      { label: 'Quản lý đặt sách', icon: <AssignmentIcon />, href: '/reservation/staff' },
      { label: 'Quản lý mượn sách', icon: <BookIcon />, href: '/loan' },
    ];
  } else if (userRole === 'User' || userRole === '3') {
    menuItems = [
      { label: 'Home', icon: <HomeIcon />, href: '/user/home' },
      { label: 'Sách đã mượn', icon: <BookIcon />, href: '/loan/history' },
      { label: 'Lịch sử đặt sách', icon: <HistoryIcon />, href: '/reservation/user' },
    ];
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      PaperProps={{ sx: { width: 260 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item, idx) => (
          <Link href={item.href} passHref legacyBehavior key={item.label}>
            <ListItem button component="a" onClick={onClose}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 