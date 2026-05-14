const health = (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};

const echo = (req, res) => {
  res.status(200).json({
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  });
};

// just delays response to test responseTime logging
const slow = async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  res.status(200).json({ message: 'slow response done', delayMs: 1500 });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'not found' });
};

const serverError = (req, res) => {
  res.status(500).json({ error: 'internal server error (test)' });
};

module.exports = { health, echo, slow, notFound, serverError };
