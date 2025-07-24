'use client'

import { getBookDetail } from '@/services/book.service'
import { BookDetailDto } from '@/types/book'
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Container,
    Divider,
    Grid,
    Paper,
    Typography,
} from '@mui/material'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getHomepageBooks } from '@/services/book.service'
import { BookItem } from '@/types/book'
import Link from 'next/link'




export default function BookDetailPage() {
    const { bookId } = useParams()
    const [book, setBook] = useState<BookDetailDto | null>(null)
    const [relatedBooks, setRelatedBooks] = useState<BookItem[]>([])

    useEffect(() => {
        if (book) {
            getHomepageBooks().then((books) => {
                const related = books.filter(
                    (b) => b.category === book.categoryName && b.bookId !== book.bookId
                )
                setRelatedBooks(related)
            })
        }
    }, [book])

    useEffect(() => {
        if (bookId) {
            getBookDetail(Number(bookId)).then(setBook)
        }
    }, [bookId])

    if (!book) return <Typography sx={{ p: 4 }}>Đang tải thông tin sách...</Typography>

    const variant = book.variants[0]

    return (
        <Container maxWidth={false} sx={{ py: 5, px: 6, backgroundColor: '#f9f9f9' }}>

            <Paper elevation={2} sx={{ p: 4, backgroundColor: '#fdfdfd', borderRadius: 3 }}>
                <Grid container spacing={4}>
                    {/* Hình ảnh */}
                    <Grid item xs={12} md={4}>
                        <Box
                            sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: 2,
                                maxWidth: 300,
                                mx: 'auto',
                            }}
                        >
                            <Image
                                src={book.image ?? '/placeholder.jpg'}
                                alt={book.title}
                                width={300}
                                height={450}
                                style={{ objectFit: 'cover' }}
                            />
                        </Box>
                    </Grid>

                    {/* Nội dung */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {book.title}
                        </Typography>

                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Tác giả:</strong> {book.authors.join(', ')}
                        </Typography>

                        {book.description && (
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {book.description}
                            </Typography>
                        )}

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item>
                                <Chip label={`Ngôn ngữ: ${book.language}`} variant="outlined" />
                            </Grid>
                            <Grid item>
                                <Chip label={`Thể loại: ${book.categoryName}`} variant="outlined" />
                            </Grid>
                            {variant?.volumeTitle && (
                                <Grid item>
                                    <Chip label={`Tập: ${variant.volumeTitle}`} variant="outlined" />
                                </Grid>
                            )}
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ lineHeight: 1.8 }}>
                            <Typography><strong>Năm xuất bản:</strong> {variant.publicationYear}</Typography>
                            {variant.isbn && (
                                <Typography><strong>ISBN:</strong> {variant.isbn}</Typography>
                            )}
                            {variant.publisherName && (
                                <Typography><strong>NXB:</strong> {variant.publisherName}</Typography>
                            )}
                            {variant.coverTypeName && (
                                <Typography><strong>Loại bìa:</strong> {variant.coverTypeName}</Typography>
                            )}
                            {variant.paperQualityName && (
                                <Typography><strong>Chất lượng giấy:</strong> {variant.paperQualityName}</Typography>
                            )}
                            <Typography>
                                <strong>Trạng thái:</strong>{' '}
                                {variant.availableCopies > 0
                                    ? `Còn ${variant.availableCopies} bản`
                                    : 'Hết sách'}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 4 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={variant.availableCopies === 0}
                                sx={{ mr: 2 }}
                            >
                                Mượn sách
                            </Button>

                        </Box>
                    </Grid>
                </Grid>
                {relatedBooks.length > 0 && (
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Sách liên quan
                        </Typography>

                        <Grid container spacing={2}>
                            {relatedBooks.map((related) => (
                                <Grid item xs={6} sm={4} md={3} lg={2} key={related.bookId}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={related.image}
                                            alt={related.title}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                                            <Typography variant="body2" fontWeight="bold" noWrap>
                                                {related.title}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'space-between', px: 1.5, pb: 1.5 }}>
                                            <Link href={`/user/book/${related.bookId}`} passHref>
                                                <Button size="small" variant="outlined">
                                                    Chi tiết
                                                </Button>
                                            </Link>
                                            {related.available && (
                                                <Link href={`/reserve/${related.bookId}`} passHref>
                                                    <Button size="small" variant="contained" color="primary">
                                                        Mượn
                                                    </Button>
                                                </Link>
                                            )}
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

            </Paper>
        </Container>
    )
}
