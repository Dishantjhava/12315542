require('dotenv').config();

const express = require('express');
const { requestLogger, Log } = require('./middleware/logger');
const demoRoutes = require('./routes/demo.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logger goes first - before any routes
app.use(requestLogger);

app.use('/api', demoRoutes);

// catch unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'route not found' });
});

// global error handler
app.use((err, req, res, next) => {
  Log('backend', 'error', 'middleware', err.message);
  res.status(err.status || 500).json({ error: err.message || 'something went wrong' });
});

app.listen(PORT, async () => {
  console.log(`logging-middleware running on http://localhost:${PORT}`);
  await Log('backend', 'info', 'middleware', `server started on port ${PORT}`);
});

module.exports = app;
