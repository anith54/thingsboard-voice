const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const PORT = process.env.PORT || 10000;

// ── Your Telegram Bot Token ───────────────────────────────────────────────
const TELEGRAM_TOKEN = '8074415106:AAG_PG79cSR3T2jXJuabE7KJFwHnxFPSHJI';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// ── Your ThingsBoard Cloud Credentials ────────────────────────────────────
const TB_USERNAME = 'anith.kumar@synedynesystems.com';
const TB_PASSWORD = 'Anith@2003';
const TB_DEVICE_ID = '509c71b0-5bdf-11f0-b50e-99d9c8fcd8e7';

// ── Step 1: Get a JWT token from ThingsBoard ──────────────────────────────
async function getJWTToken() {
  try {
    const res = await axios.post('https://thingsboard.cloud/api/auth/login', {
      username: TB_USERNAME,
      password: TB_PASSWORD
    });
    return res.data.token;
  } catch (err) {
    console.error('TB Login error:', err.response?.data || err.message);
    return null;
  }
}

// ── Step 2: Fetch the latest “volume” via the correct API endpoint ────────
async function getLatestVolume(token) {
  // **Note the “DEVICE” segment** in the URL path!
  const url = `https://thingsboard.cloud/api/plugins/telemetry/DEVICE/${TB_DEVICE_ID}/values/timeseries?keys=volume`;
  try {
    const res = await axios.get(url, {
      headers: { 'X-Authorization': `Bearer ${token}` }
    });
    const data = res.data.volume;
    if (Array.isArray(data) && data.length > 0) {
      return data[0].value;
    }
    return null;
  } catch (err) {
    console.error('Telemetry error:', err.response?.data || err.message);
    return null;
  }
}

// ── Step 3: Wire up the /volume command ─────────────────────────────────────
bot.onText(/\/volume/, async (msg) => {
  const chatId = msg.chat.id;
  const token = await getJWTToken();
  if (!token) {
    return bot.sendMessage(chatId, 'Could not authenticate with ThingsBoard.');
  }
  const volume = await getLatestVolume(token);
  if (volume == null) {
    return bot.sendMessage(chatId, 'Could not fetch volume data.');
  }
  bot.sendMessage(chatId, `Current volume: ${parseFloat(volume).toFixed(2)} liters.`);
});

// ── Health‐check endpoint ───────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Telegram bot is running!'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
