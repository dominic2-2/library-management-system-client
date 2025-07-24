'use client';

import {
    Box,
    Typography,
    Chip,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Stack,
    Button,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { useNotificationList } from '@/features/notification/useNotificationList';
import { useState } from 'react';
import { markAsRead } from '@/services/notification.service';
import { NotificationDto } from '@/types/notification';

const notificationTypes = [
    'All',
    'DueDateReminder',
    'FineNotice',
    'BorrowConfirmed',
    'ReturnConfirmed',
    'ReservationAvailable',
];

export default function NotificationTable() {
    const [filter, setFilter] = useState<string>('All');
    const { data = [], isLoading, refetch } = useNotificationList(
        filter !== 'All' ? filter : undefined
    );
    const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);

    const handleMarkAsRead = async (notification: NotificationDto) => {
        if (!notification.readStatus) {
            await markAsRead(notification.notificationId);
            refetch(); // cập nhật lại danh sách
        }
    };

    return (
        <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Thông báo của bạn
            </Typography>

            <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
                {notificationTypes.map((type) => (
                    <Button
                        key={type}
                        variant={filter === type ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setFilter(type)}
                    >
                        {type === 'All' ? 'Tất cả' : type}
                    </Button>
                ))}
            </Stack>

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress />
                </Box>
            ) : data.length === 0 ? (
                <Typography>Không có thông báo nào.</Typography>
            ) : (
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                <TableCell>Loại</TableCell>
                                <TableCell>Nội dung</TableCell>
                                <TableCell>Ngày gửi</TableCell>
                                <TableCell>Trạng thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((noti) => (
                                <TableRow
                                    key={noti.notificationId}
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: noti.readStatus ? '#fff' : '#e3f2fd',
                                        transition: 'background-color 0.3s',
                                    }}
                                    onClick={() => {
                                        handleMarkAsRead(noti);
                                        setSelectedNotification(noti);
                                    }}
                                >
                                    <TableCell>
                                        <Chip
                                            label={noti.notificationType}
                                            color="primary"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{noti.message}</TableCell>
                                    <TableCell>
                                        {new Date(noti.notificationDate).toLocaleString('vi-VN')}
                                    </TableCell>
                                    <TableCell>
                                        {noti.readStatus ? (
                                            <Chip label="Đã đọc" color="success" size="small" />
                                        ) : (
                                            <Chip label="Chưa đọc" color="error" size="small" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {/* Dialog hiển thị chi tiết thông báo */}
            <Dialog
                open={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Chi tiết thông báo</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1}>
                        <Typography variant="body2" color="textSecondary">
                            Loại thông báo:
                        </Typography>
                        <Chip
                            label={selectedNotification?.notificationType}
                            color="primary"
                            variant="outlined"
                        />

                        <Typography mt={2} variant="body2" color="textSecondary">
                            Nội dung:
                        </Typography>
                        <DialogContentText>{selectedNotification?.message}</DialogContentText>

                        <Typography mt={2} variant="body2" color="textSecondary">
                            Ngày gửi:
                        </Typography>
                        <Typography>
                            {selectedNotification
                                ? new Date(selectedNotification.notificationDate).toLocaleString('vi-VN')
                                : ''}
                        </Typography>

                        <Typography mt={2} variant="body2" color="textSecondary">
                            Trạng thái:
                        </Typography>
                        <Chip
                            label={selectedNotification?.readStatus ? 'Đã đọc' : 'Chưa đọc'}
                            color={selectedNotification?.readStatus ? 'success' : 'error'}
                            size="small"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedNotification(null)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}