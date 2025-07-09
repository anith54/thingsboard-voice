const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;


const TB_ACCESS_TOKEN = "642trsqvntx5ykmjodj5";

const TB_DEVICE_TELEMETRY_URL = `https://thingsboard.cloud/api/v1/${TB_ACCESS_TOKEN}/telemetry`;


async function getLatestVolume() {
    try {
        const response = await axios.get(TB_DEVICE_TELEMETRY_URL);

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
            console.error("Volume data not found in telemetry");
            return null;
        }
    } catch (err) {
        console.error("Telemetry fetch failed:", err.response?.status, err.response?.data || err.message);
        return null;
    }
}

// Route for Alexa/IFTTT to trigger and get volume value
app.get('/get-volume', async (req, res) => {
    const volume = await getLatestVolume();
    if (!volume) return res.status(500).send('Could not fetch volume');
    res.send(`The current volume is ${volume} liters.`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
