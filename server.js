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
        console.error('Login failed:', err.response?.data || err.message);
        return null;
    }
}


async function getLatestVolume(token) {
    const url = `https://thingsboard.cloud/api/plugins/telemetry/DEVICE/${TB_DEVICE_ID}/values/timeseries?keys=volume`;

    try {
        const response = await axios.get(url, {
            headers: {
                'X-Authorization': `Bearer ${token}`
            }
        });

        const volumeData = response.data.volume;
        if (volumeData && Array.isArray(volumeData) && volumeData.length > 0) {
            return volumeData[0].value;
        } else {
            return null;
        }
    } catch (err) {
        console.error("Telemetry error:", err.response?.data || err.message);
        return null;
    }
}


app.get('/get-volume', async (req, res) => {
    const token = await getJWTToken();
    if (!token) return res.status(500).send('Login to ThingsBoard failed.');

    const volume = await getLatestVolume(token);
    if (!volume) return res.status(500).send('Could not fetch volume telemetry.');

    res.send(`The current volume is ${parseFloat(volume).toFixed(2)} liters.`);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
