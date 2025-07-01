'use client';

import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Typography,
    Divider,
    CircularProgress,
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BookIcon from '@mui/icons-material/Book';
import NumbersIcon from '@mui/icons-material/Numbers';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { useBookVariantById, useCreateReservation, useUserById } from '@/hooks/features/reservation/useReservation';
import { useMemo, useState } from 'react';

export default function ReservationConfirm() {
    const searchParams = useSearchParams();

    // ✅ Dùng useMemo để tránh lỗi hydration
    const userId = useMemo(() => {
        const uid = Number(searchParams.get('user_id'));
        return isNaN(uid) ? null : uid;
    }, [searchParams]);

    const variantId = useMemo(() => {
        const vid = Number(searchParams.get('variant_id'));
        return isNaN(vid) ? null : vid;
    }, [searchParams]);

    // ✅ Chỉ enable query khi đã có id
    const { data: user, isLoading: userLoading } = useUserById(userId ?? 0, !!userId);
    const { data: book, isLoading: bookLoading } = useBookVariantById(variantId ?? 0, !!variantId);
    const { mutateAsync } = useCreateReservation();

    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleConfirm = async () => {
        if (!userId || !variantId) return;
        await mutateAsync({ userId, variantId });
        setIsConfirmed(true);
    };

    if (!userId || !variantId || userLoading || bookLoading) {
        return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
    }

    if (!user || !book) {
        return <Typography textAlign="center" mt={5}>Không tìm thấy thông tin người dùng hoặc sách.</Typography>;
    }

    return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', borderRadius: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Xác nhận đặt trước sách
                </Typography>

                <Stack spacing={3}>
                    {/* Người mượn */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={500} mb={1}>
                            👤 Thông tin người mượn
                        </Typography>
                        <Stack spacing={1}>
                            <Typography><PersonIcon fontSize="small" sx={{ mr: 1 }} /> {user.fullName}</Typography>
                            <Typography><EmailIcon fontSize="small" sx={{ mr: 1 }} /> {user.email}</Typography>
                            <Typography><PhoneIcon fontSize="small" sx={{ mr: 1 }} /> {user.phone}</Typography>
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Sách */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={500} mb={1}>
                            📚 Thông tin sách mượn
                        </Typography>
                        <Stack spacing={1}>
                            <Typography><BookIcon fontSize="small" sx={{ mr: 1 }} /> {book.title}</Typography>
                            <Typography><NumbersIcon fontSize="small" sx={{ mr: 1 }} /> ISBN: {book.isbn}</Typography>
                            <Typography><CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} /> Năm XB: {book.publicationYear}</Typography>
                        </Stack>
                    </Box>

                    {/* Nút xác nhận */}
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleConfirm}
                        disabled={isConfirmed}
                        sx={{ mt: 2 }}
                    >
                        {isConfirmed ? 'Đã xác nhận' : 'Xác nhận đặt trước'}
                    </Button>

                    {isConfirmed && (
                        <Chip
                            label="✅ Đã gửi yêu cầu đặt trước"
                            color="success"
                            sx={{ width: 'fit-content' }}
                        />
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}
