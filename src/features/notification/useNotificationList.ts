import { useQuery } from '@tanstack/react-query';
import { ENV } from '@/config/env';
import { NotificationDto } from '@/types/notification';
import { useAuth } from '@/providers/AuthProvider';

export const useNotificationList = (typeFilter?: string) => {
    const { user } = useAuth();
    const userId = user?.id;

    console.log('🔑 userId for notification fetch:', userId);

    return useQuery<NotificationDto[]>({
        queryKey: ['notifications', userId, typeFilter],
        enabled: !!userId,
        queryFn: async () => {
            const base = `/notifications/receiver/${userId}`;
            const query = typeFilter
                ? `${base}?$filter=notificationType eq '${typeFilter}'&$orderby=notificationDate desc`
                : `${base}?$orderby=notificationDate desc`;

            const response = await fetch(`${ENV.apiUrl}${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể tải danh sách thông báo');
            }

            const result = await response.json();
            return result;
        }
    });
};
