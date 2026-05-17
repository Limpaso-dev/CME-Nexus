const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

const requestBuckets = new Map();

const getClientKey = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "unknown";

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
};

export const rateLimit = ({
  windowMs = DEFAULT_WINDOW_MS,
  max = 100,
  message = "Too many requests"
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${getClientKey(req)}:${req.originalUrl}`;
    const bucket = requestBuckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    requestBuckets.set(key, bucket);

    if (bucket.count > max) {
      return res.status(429).json({ message });
    }

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    return next();
  };
};

setInterval(() => {
  const now = Date.now();

  for (const [key, bucket] of requestBuckets.entries()) {
    if (bucket.resetAt <= now) {
      requestBuckets.delete(key);
    }
  }
}, DEFAULT_WINDOW_MS).unref();
