// backend/src/controllers/healthController.js

/**
 * Health check controller
 * Returns a simple JSON indicating the service is up.
 */
function healthCheck(req, res) {
  res.json({ status: "ok" });
}

module.exports = { healthCheck };
