'use client';

import { useEffect, useState } from 'react';
import { getHomepageBooks } from '@/services/book.service';
import { HomepageBookDTO } from '@/types/book';
import {
    Box,
    Typography,
    CircularProgress,
    Container,
    Paper,
    IconButton,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BookCard from '@/components/book/BookCard';

const ITEMS_PER_PAGE = 6;

export default function HomepagePage() {
    const [books, setBooks] = useState<HomepageBookDTO[] | null>(null);
    const [visibleCounts, setVisibleCounts] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        getHomepageBooks()
            .then((data) => {
                console.log('📚 Dữ liệu sách:', data);
                setBooks(data);
            })
            .catch((err) => console.error('Lỗi khi lấy dữ liệu sách:', err));
    }, []);

    const handleShowMore = (category: string) => {
        setVisibleCounts((prev) => ({
            ...prev,
            [category]: (prev[category] || ITEMS_PER_PAGE) + ITEMS_PER_PAGE,
        }));
    };

    if (books === null) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
                <Typography ml={2}>Đang tải dữ liệu sách...</Typography>
            </Box>
        );
    }

    // 🧩 Các mục sách
    const sections: {
        title: string;
        filter?: (book: HomepageBookDTO) => boolean;
    }[] = [
            { title: '📚 Sách mới cập nhật' }, // không cần filter
            { title: '🔬 Sách Khoa học', filter: (book) => book.categoryName === 'Khoa học' },
            { title: '📖 Văn học', filter: (book) => book.categoryName === 'Văn học' },
            { title: '💼 Kinh tế', filter: (book) => book.categoryName === 'Kinh tế' },
        ];

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 4 }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    textAlign="center"
                    mb={4}
                    color="primary"
                >
                    📚 Thư viện Sách
                </Typography>

                {sections.map(({ title, filter }) => {
                    const allBooksInSection = filter ? books.filter(filter) : books;
                    const visible = visibleCounts[title] || ITEMS_PER_PAGE;
                    const visibleBooks = allBooksInSection.slice(0, visible);

                    return (
                        <Box key={title} mb={6}>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                textAlign="center"
                                mb={3}
                                color="secondary"
                            >
                                {title}
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    gap: 2,
                                    pb: 2,
                                    scrollBehavior: 'smooth',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    '&::-webkit-scrollbar': {
                                        display: 'none',
                                    },
                                    cursor: 'grab',
                                    '&:active': {
                                        cursor: 'grabbing',
                                    },
                                }}
                            >
                                {visibleBooks.map((book) => (
                                    <Box
                                        key={book.bookId}
                                        sx={{ flex: '0 0 auto', width: 250 }}
                                    >
                                        <BookCard book={book} />
                                    </Box>
                                ))}

                                {visibleBooks.length < allBooksInSection.length && (
                                    <Box
                                        sx={{
                                            flex: '0 0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 80,
                                            border: '1px dashed #ccc',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                        }}
                                        onClick={() => handleShowMore(title)}
                                    >
                                        <IconButton>
                                            <MoreHorizIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
                })}

            </Paper>
        </Container>
    );
}
