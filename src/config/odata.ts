import axios from 'axios';
import { ENV } from './env';

const odata = axios.create({
  baseURL: ENV.odataUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default odata;