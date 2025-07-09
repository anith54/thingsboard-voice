const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const TB_USERNAME = "anith.kumar@synedynesystems.com";
const TB_PASSWORD = "Anith@2003";
const TB_DEVICE_ID = "509c71b0-5bdf-11f0-b50e-99d9c8fcd8e7";

async function getJWTToken() {
    try {
        const response = await axios.post('https://thingsboard.cloud/api/auth/login', {
            username: TB_USERNAME,
            password: TB_PASSWORD
        });
        return response.data.token;
    } catch (err) {
        console.error('Login error:', err.message);
        return null;
    }
}

async function getLatestVolume(token) {
    try {
        const response = await axios.get(
            `https://thingsboard.cloud/api/plugins/telemetry/${TB_DEVICE_ID}/values/timeseries?keys=volume`,
            { headers: { 'X-Authorization': `Bearer ${token}` } }
        );
        return response.data.volume[0].value;
    } catch (err) {
        console.error('Telemetry error:', err.message);
        return null;
    }
}

app.get('/get-volume', async (req, res) => {
    const token = await getJWTToken();
    if (!token) return res.status(500).send('Error authenticating with ThingsBoard');
    const volume = await getLatestVolume(token);
    if (!volume) return res.status(500).send('Could not fetch volume');
    res.send(`The current volume is ${volume} liters.`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
