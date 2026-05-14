const axios = require('axios');
require('dotenv').config();

const LOG_URL  = 'http://4.224.186.213/evaluation-service/logs';
const AUTH_URL = 'http://4.224.186.213/evaluation-service/auth';

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

  const res = await axios.post(AUTH_URL, {
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

async function Log(stack, level, pkg, message) {
  const msg = String(message).slice(0, 48);
  try {
    const token = await getToken();
    await axios.post(
      LOG_URL,
      { stack, level, package: pkg, message: msg },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error(`[log error] ${level} | ${pkg} | ${msg}`);
  }
}

function requestLogger(req, res, next) {
  const start = Date.now();
  Log('backend', 'info', 'middleware', `${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    Log('backend', level, 'middleware', `${req.method} ${req.path} ${res.statusCode} ${ms}ms`);

    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)\x1b[0m`);
  });

  next();
}

module.exports = { Log, requestLogger };
