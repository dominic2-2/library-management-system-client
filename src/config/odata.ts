// Dành cho OData (/odata)
import axios from 'axios';

const odata = axios.create({
    baseURL: 'https://localhost:7142/odata',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default odata;
