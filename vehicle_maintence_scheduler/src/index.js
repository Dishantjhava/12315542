require('dotenv').config();

const express = require('express');
const { requestLogger, Log } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const schedulerRoutes = require('./routes/scheduler.routes');

const required = ['ROLL_NO', 'CLIENT_ID', 'CLIENT_SECRET', 'REG_NAME', 'REG_EMAIL', 'ACCESS_CODE'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/scheduler', schedulerRoutes);

app.use((req, res) => res.status(404).json({ error: 'route not found' }));
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`vehicle-maintence-scheduler running on http://localhost:${PORT}`);
  await Log('backend', 'info', 'middleware', `server started on port ${PORT}`);
});

module.exports = app;
