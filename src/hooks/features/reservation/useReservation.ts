import { useMutation, useQuery } from '@tanstack/react-query';
import { createReservation } from '@/services/reservation.service';
import axios from '@/config/apiConfig'; // ✅ chính là file bạn đã cấu hình đúng baseURL


export const useCreateReservation = () => {
  return useMutation({
    mutationFn: ({ userId, variantId }: { userId: number; variantId: number }) =>
      createReservation(userId, variantId),
  });
};

export const useUserById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => axios.get(`/users/${id}`).then(res => res.data),
    enabled,
  });
};

export const useBookVariantById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['variant', id],
    queryFn: () => axios.get(`/bookvariants/${id}`).then(res => res.data),
    enabled,
  });
};

