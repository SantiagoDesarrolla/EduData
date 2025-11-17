require('dotenv').config();

const apiConfig = {
    datosAbiertos: {
        baseURL: process.env.DATOS_ABIERTOS_URL,
        token: process.env.DATOS_ABIERTOS_TOKEN,
        headers: {
            'X-App-Token': process.env.DATOS_ABIERTOS_TOKEN,
            'Content-Type': 'application/json'
        }
    },
    dane: {
        baseURL: process.env.DANE_API_URL,
        apiKey: process.env.DANE_API_KEY,
        headers: {
            'Authorization': `Bearer ${process.env.DANE_API_KEY}`,
            'Content-Type': 'application/json'
        }
    }
};

module.exports = apiConfig;