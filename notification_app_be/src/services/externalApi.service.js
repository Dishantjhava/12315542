const axios = require('axios');
require('dotenv').config();

const BASE = 'http://4.224.186.213/evaluation-service';

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

  const res = await axios.post(`${BASE}/auth`, {
    name:         process.env.REG_NAME,
    email:        process.env.REG_EMAIL,
    rollNo:       process.env.ROLL_NO,
    accessCode:   process.env.ACCESS_CODE,
    clientID:     process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  cachedToken = res.data.access_token;
  tokenExpiry = res.data.expires_in;
  return cachedToken;
}

async function fetchNotifications() {
  const token = await getToken();
  const res = await axios.get(`${BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.notifications || res.data;
}

module.exports = { fetchNotifications };
