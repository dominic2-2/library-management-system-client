import odata from '@/config/odata';

export const getHomepageBooks = async () => {
    const res = await odata.get('/Books?$filter=AvailableCopies gt 0');
    console.log('📥 API Response:', res.data);
    return res.data;
};
