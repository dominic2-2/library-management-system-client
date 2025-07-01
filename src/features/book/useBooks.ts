import { useQuery } from '@tanstack/react-query';
import { getHomepageBooks } from '@/services/book.service';

export const useBooksHomepage = () => {
    return useQuery({
        queryKey: ['books', 'homepage'],
        queryFn: () => getHomepageBooks(),
    });
};