import api from '@/config/apiConfig';
import axios from 'axios';

export const createReservation = async (userId: number, variantId: number) => {
  try {
    const res = await api.post('/reservation/create', null, {
      params: { userId, variantId },
    });
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.error || 'Lỗi không xác định');
    }
    throw new Error('Lỗi không xác định');
  }
};

export const getUserById = async (id: number) => {
  try {
    const res = await api.get(`/users/${id}`);
    return res.data;
  } catch {
    throw new Error('Không thể lấy thông tin người dùng');
  }
};

export const getBookVariantById = async (id: number) => {
  try {
    const res = await api.get(`/bookvariants/${id}`);
    return res.data;
  } catch {
    throw new Error('Không thể lấy thông tin sách');
  }
};
