import { Card, CardContent, Typography, Box, Button, Stack } from '@mui/material';
import { HomepageBookDTO } from '@/types/book';

type Props = {
    book: HomepageBookDTO;
};

export default function BookCard({ book }: Props) {
    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                },
                backgroundColor: '#fafafa',
            }}
        >
            <CardContent sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {book.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {book.categoryName} • {book.language}
                </Typography>

                <Typography variant="body2" gutterBottom>
                    {book.authors?.join(', ') || 'Không rõ tác giả'}
                </Typography>

                <Box mt="auto">
                    <Typography variant="body2" color="success.main" gutterBottom>
                        Có sẵn: {book.availableCopies}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="small"
                            onClick={() => alert(`Đặt sách: ${book.title}`)}
                        >
                            Đặt sách
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            size="small"
                            onClick={() => alert(`Mượn sách: ${book.title}`)}
                        >
                            Mượn
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
