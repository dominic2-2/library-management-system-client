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
    Tooltip,
} from '@mui/material'
import Link from 'next/link'
import { getHomepageBooks } from '@/services/book.service'
import { BookItem } from '@/types/book'

const categories = ['Khoa học', 'Tâm lý', 'Lịch sử', 'Tiểu thuyết', 'Văn học']

export default function HomePage() {
    const [books, setBooks] = useState<BookItem[]>([])
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        getHomepageBooks()
            .then(setBooks)
            .finally(() => setLoading(false))
    }, [])

    const normalize = (str: string) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

    const filteredBooks = books.filter((book) => {
        const title = normalize(book.title)
        const category = normalize(book.category ?? '')
        const searchStr = normalize(search)
        const matchesSearch = title.includes(searchStr) || category.includes(searchStr)
        const matchesCategory = selectedCategory ? category === normalize(selectedCategory) : true
        return matchesSearch && matchesCategory
    })

    return (
        <Container maxWidth="xl" sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                📚 Kho Sách
            </Typography>

            <TextField
                fullWidth
                placeholder="🔍 Tìm kiếm sách..."
                variant="outlined"
                size="small"
                sx={{ mb: 2, backgroundColor: '#fff' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

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

            {loading ? (
                <Typography>Đang tải dữ liệu...</Typography>
            ) : filteredBooks.length === 0 ? (
                <Typography>Không tìm thấy sách phù hợp.</Typography>
            ) : (
                <Grid container spacing={2}>
                    {filteredBooks.map((book) => (
                        console.log('📚 Book item:', book),
                        <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={book.bookId}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.02)', boxShadow: 4 },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{ height: 220, objectFit: 'cover' }}
                                    image={book.image || '/default-book.jpg'}
                                    alt={book.title}
                                />
                                <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                                    <Tooltip title={book.title}>
                                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                            {book.title}
                                        </Typography>
                                    </Tooltip>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        🖋 {book.authors?.join(', ') || 'Không rõ'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        📂 {book.category || 'Không rõ thể loại'}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color={book.available ? 'green' : 'red'}
                                        fontWeight="bold"
                                        display="block"
                                        mt={0.5}
                                    >
                                        {book.available ? '✅ Có sẵn' : '❌ Đang mượn'}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', px: 1.5, pb: 1.5 }}>
                                    <Link href={`/user/book/${book.bookId}`} passHref>
                                        <Button size="small" variant="outlined">
                                            Chi tiết
                                        </Button>
                                    </Link>
                                    <Link href={`/reservation/user/create?bookId=${book.bookId}`} passHref>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            disabled={!book.available}
                                        >
                                            Mượn
                                        </Button>
                                    </Link>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    )
}
