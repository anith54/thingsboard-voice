const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Telegram bot token
const TELEGRAM_TOKEN = '8074415106:AAG_PG79cSR3T2jXJuabE7KJFwHnxFPSHJI';
const WEBHOOK_URL = `https://thingsboard-voice.onrender.com/bot${TELEGRAM_TOKEN}`;

// ✅ ThingsBoard credentials
const TB_USERNAME = 'anith.kumar@synedynesystems.com';
const TB_PASSWORD = 'Anith@2003';
const TB_DEVICE_ID = '509c71b0-5bdf-11f0-b50e-99d9c8fcd8e7';

app.use(express.json());

// ✅ Create Telegram bot in webhook mode (no polling)
const bot = new TelegramBot(TELEGRAM_TOKEN);
bot.setWebHook(WEBHOOK_URL);

// ✅ Telegram will send POST to this route
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ✅ ThingsBoard token fetch
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

// ✅ Fetch latest volume value from ThingsBoard
async function getLatestVolume(token) {
  try {
    const response = await axios.get(
      `https://thingsboard.cloud/api/plugins/telemetry/${TB_DEVICE_ID}/values/timeseries?keys=volume`,
      {
        headers: { 'X-Authorization': `Bearer ${token}` }
      }
    );
    return response.data.volume[0].value;
  } catch (err) {
    console.error('Telemetry error:', err.message);
    return null;
  }
}

// ✅ When user sends /volume
bot.onText(/\/volume/, async (msg) => {
  const chatId = msg.chat.id;
  const token = await getJWTToken();
  if (!token) return bot.sendMessage(chatId, '❌ Error logging into ThingsBoard.');
  const volume = await getLatestVolume(token);
  if (!volume) return bot.sendMessage(chatId, '⚠️ Could not fetch volume data.');
  bot.sendMessage(chatId, `📦 Current volume: ${volume} liters.`);
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ Telegram bot webhook is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
