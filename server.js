const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ThingsBoard credentials
const TB_USERNAME = "anith.kumar@synedynesystems.com";
const TB_PASSWORD = "Anith@2003";
const TB_DEVICE_ID = "509c71b0-5bdf-11f0-b50e-99d9c8fcd8e7";

// Authenticate with ThingsBoard to get JWT token
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

// Fetch latest volume reading from ThingsBoard
async function getLatestVolume(token) {
    try {
        const url = `https://thingsboard.cloud/api/plugins/telemetry/${TB_DEVICE_ID}/values/timeseries?keys=volume`;
        const response = await axios.get(url, {
            headers: {
                'X-Authorization': `Bearer ${token}`
            }
        });

        console.log("ThingsBoard Telemetry Response:");
        console.log(JSON.stringify(response.data, null, 2));

        if (
            response.data &&
            response.data.volume &&
            Array.isArray(response.data.volume) &&
            response.data.volume.length > 0
        ) {
            return response.data.volume[0].value;
        } else {
            console.error("Volume data not found in response.");
            return null;
        }
    } catch (err) {
        if (err.response) {
            console.error('Telemetry error response:', err.response.status, err.response.data);
        } else {
            console.error('Telemetry error:', err.message);
        }
        return null;
    }
}


// HTTP endpoint: /get-volume
app.get('/get-volume', async (req, res) => {
    const token = await getJWTToken();
    if (!token) return res.status(500).send('Error authenticating with ThingsBoard');

    const volume = await getLatestVolume(token);
    if (!volume) return res.status(500).send('Could not fetch volume');

    res.send(`The current volume is ${volume} liters.`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
