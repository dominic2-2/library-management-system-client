import { useQuery } from '@tanstack/react-query';
import { ENV } from '@/config/env';
import { NotificationDto } from '@/types/notification';

export const useNotificationList = (typeFilter?: string) => {
    return useQuery<NotificationDto[]>({
        queryKey: ['notifications', typeFilter],
        queryFn: async () => {
            const query = typeFilter
                ? `/notifications?$filter=notificationType eq '${typeFilter}'&$orderby=notificationDate desc`
                : `/notifications?$orderby=notificationDate desc`;

            const response = await fetch(`${ENV.apiUrl}${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Không thể tải danh sách thông báo');
            }

            const result = await response.json();
            return result.value; // assuming OData
        }
    });
};
