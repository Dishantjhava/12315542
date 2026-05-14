function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);

  if (err.response) {
    return res.status(err.response.status).json({
      success: false,
      error: 'external API error',
      detail: err.response.data,
    });
  }

  if (err.request) {
    return res.status(503).json({
      success: false,
      error: 'could not reach external API, check your credentials',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'something went wrong',
  });
}

module.exports = errorHandler;
