import axios from '@/config/apiConfig';
export const markAsRead = (id: number) =>
  axios.patch(`/notifications/${id}/mark-read`);
