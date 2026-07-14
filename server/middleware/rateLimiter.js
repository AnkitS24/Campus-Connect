const rateLimit = new Map();

const rateLimiter = (limit = 2000, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, []);
    }

    const timestamps = rateLimit.get(ip).filter((t) => now - t < windowMs);

    if (timestamps.length >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
    }

    timestamps.push(now);
    rateLimit.set(ip, timestamps);

    next();
  };
};

const cleanRateLimitMap = () => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimit.entries()) {
    const valid = timestamps.filter((t) => now - t < 15 * 60 * 1000);
    if (valid.length === 0) {
      rateLimit.delete(ip);
    } else {
      rateLimit.set(ip, valid);
    }
  }
};

setInterval(cleanRateLimitMap, 5 * 60 * 1000);

module.exports = { rateLimiter };
