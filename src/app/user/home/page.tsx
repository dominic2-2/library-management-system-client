'use client'

import { useEffect, useState } from 'react'
import {
    Box,
    Container,
    Grid,
    Typography,
    TextField,
    Chip,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
} from '@mui/material'
import Link from 'next/link'
import { getHomepageBooks } from '@/services/book.service'
import { BookItem } from '@/types/book'

const categories = ['Khoa học', 'Tâm lý', 'Lịch sử', 'Tiểu thuyết', 'Văn học']

export default function HomePage() {
    const [books, setBooks] = useState<BookItem[]>([])
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    useEffect(() => {
        getHomepageBooks().then((res) => {
            console.log('Books từ API:', res);
            setBooks(res);
        });
    }, []);


    const filteredBooks = books.filter((book) => {
        const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = selectedCategory ? book.category === selectedCategory : true
        return matchesSearch && matchesCategory
    })

    return (
        <Container maxWidth={false} sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Kho Sách
            </Typography>

            {/* Tìm kiếm */}
            <TextField
                fullWidth
                placeholder="Tìm kiếm sách..."
                variant="outlined"
                size="small"
                sx={{ mb: 2, backgroundColor: '#fff' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Filter thể loại */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                    <Chip
                        key={cat}
                        label={cat}
                        color={selectedCategory === cat ? 'primary' : 'default'}
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                        clickable
                    />
                ))}
            </Box>

            {/* Danh sách sách */}
            <Grid container spacing={2}>
                {filteredBooks.map((book) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={book.bookId}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                sx={{ height: 480, objectFit: 'cover' }}
                                image={book.image}
                                alt={book.title}
                            />

                            <CardContent sx={{ flexGrow: 1, padding: 1.5 }}>
                                <Typography variant="body2" fontWeight="bold" noWrap>
                                    {book.title}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', px: 1.5, pb: 1.5 }}>
                                <Link href={`/user/book/${book.bookId}`} passHref>

                                    <Button size="small" variant="outlined">Chi tiết</Button>
                                </Link>
                                {book.available && (
                                    <Link href={`/reserve/${book.bookId}`} passHref>
                                        <Button size="small" variant="contained" color="primary">Mượn</Button>
                                    </Link>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}
