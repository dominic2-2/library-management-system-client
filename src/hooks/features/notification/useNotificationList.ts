import { useQuery } from '@tanstack/react-query';
import axios from '@/config/apiConfig';
import { NotificationDto } from '@/types/notification';

export const useNotificationList = (typeFilter?: string) => {
    return useQuery<NotificationDto[]>({
        queryKey: ['notifications', typeFilter],
        queryFn: async () => {
            const query = typeFilter
                ? `/notifications?$filter=notificationType eq '${typeFilter}'&$orderby=notificationDate desc`
                : `/notifications?$orderby=notificationDate desc`;

            const res = await axios.get(query);
            return res.data.value; // dùng OData
        },
    });
};
