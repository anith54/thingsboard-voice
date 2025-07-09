const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 ThingsBoard Cloud credentials
const TB_USERNAME = "anith.kumar@synedynesystems.com";        
const TB_PASSWORD = "Anith@2003";          
const TB_DEVICE_ID = "509c71b0-5bdf-11f0-b50e-99d9c8fcd8e7";   
// 🔑 Get JWT token
async function getJWTToken() {
    try {
        const res = await axios.post('https://thingsboard.cloud/api/auth/login', {
            username: TB_USERNAME,
            password: TB_PASSWORD
        });
        return res.data.token;
    } catch (err) {
        console.error('❌ Login failed:', err.response?.data || err.message);
        return null;
    }
}

// 📡 Get latest volume telemetry
async function getLatestVolume(token) {
    const url = `https://thingsboard.cloud/api/plugins/telemetry/${TB_DEVICE_ID}/values/timeseries?keys=volume`;
    try {
        const res = await axios.get(url, {
            headers: { 'X-Authorization': `Bearer ${token}` }
        });

        const volumeData = res.data.volume;
        if (volumeData && Array.isArray(volumeData) && volumeData.length > 0) {
            return volumeData[0].value;
        } else {
            console.error("⚠️ Volume not found in telemetry");
            return null;
        }

    } catch (err) {
        console.error("❌ Telemetry error:", err.response?.data || err.message);
        return null;
    }
}

// 🌐 API endpoint for Alexa/IFTTT to hit
app.get('/get-volume', async (req, res) => {
    const token = await getJWTToken();
    if (!token) return res.status(500).send('Login failed');

    const volume = await getLatestVolume(token);
    if (!volume) return res.status(500).send('Could not fetch volume');

    res.send(`The current volume is ${volume} liters.`);
});

// 🖥️ Start web server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
