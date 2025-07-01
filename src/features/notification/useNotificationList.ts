import { useQuery } from '@tanstack/react-query';
import axios from '@/config/apiConfig';
import { NotificationDto } from '@/types/notification';

const HARDCODED_RECEIVER_ID = 4;

export const useNotificationList = (typeFilter?: string) => {
    return useQuery<NotificationDto[]>({
        queryKey: ['notifications', HARDCODED_RECEIVER_ID, typeFilter],
        queryFn: async () => {
            const base = `/notifications/receiver/${HARDCODED_RECEIVER_ID}`;
            const query = typeFilter
                ? `${base}?$filter=notificationType eq '${typeFilter}'&$orderby=notificationDate desc`
                : `${base}?$orderby=notificationDate desc`;

            const res = await axios.get(query);
            return res.data ?? [];
        },
    });
};
