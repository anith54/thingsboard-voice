const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const PORT = process.env.PORT || 10000;

// Your Telegram Bot Token
const TELEGRAM_TOKEN = '8074415106:AAG_PG79cSR3T2jXJuabE7KJFwHnxFPSHJI';

// ThingsBoard Credentials
const TB_USERNAME = "anith.kumar@synedynesystems.com"; 
const TB_PASSWORD = "Anith@2003";                     
const TB_DEVICE_ID = "509c71b0-5bdf-11f0-b50e-99d9c8fcd8e7"; 

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Get ThingsBoard JWT token
async function getJWTToken() {
  try {
    const res = await axios.post('https://thingsboard.cloud/api/auth/login', {
      username: TB_USERNAME,
      password: TB_PASSWORD
    });
    return res.data.token;
  } catch (err) {
    console.error('TB Login error:', err.message);
    return null;
  }
}

// Get volume from ThingsBoard
async function getLatestVolume(token) {
  try {
    const res = await axios.get(
      `https://thingsboard.cloud/api/plugins/telemetry/${TB_DEVICE_ID}/values/timeseries?keys=volume`,
      {
        headers: { 'X-Authorization': `Bearer ${token}` }
      }
    );
    return res.data.volume[0].value;
  } catch (err) {
    console.error('Telemetry error:', err.message);
    return null;
  }
}

// Bot command: /volume
bot.onText(/\/volume/, async (msg) => {
  const chatId = msg.chat.id;
  const token = await getJWTToken();
  if (!token) {
    bot.sendMessage(chatId, '❌ Could not authenticate with ThingsBoard.');
    return;
  }
  const volume = await getLatestVolume(token);
  if (!volume) {
    bot.sendMessage(chatId, '⚠️ Could not fetch volume data.');
    return;
  }
  bot.sendMessage(chatId, `📦 The current volume is ${volume} liters.`);
});

// Optional: health check
app.get('/', (req, res) => res.send('Telegram bot is running.'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

