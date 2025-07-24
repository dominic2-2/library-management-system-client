import { ENV } from '@/config/env';

export const markAsRead = async (id: number): Promise<void> => {
    const response = await fetch(`${ENV.apiUrl}/notifications/${id}/mark-read`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Không thể đánh dấu đã đọc');
    }
};
