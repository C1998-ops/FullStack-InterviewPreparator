import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Track OpenAI API call timestamps per user/IP to implement smart rate limiting
const openaiCallTracker = new Map();
const OPENAI_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const OPENAI_MAX_CALLS_PER_MINUTE = 3; // Conservative limit for OpenAI API

/**
 * Middleware to track actual OpenAI API calls (not cached responses)
 * This prevents hitting OpenAI rate limits by tracking real API usage
 */
export const trackOpenAICall = (req, res, next) => {
  const key = req.user?.id || ipKeyGenerator(req);
  const now = Date.now();

  // Get or initialize call history for this key
  if (!openaiCallTracker.has(key)) {
    openaiCallTracker.set(key, []);
  }

  const callHistory = openaiCallTracker.get(key);

  // Remove calls outside the time window
  const recentCalls = callHistory.filter(
    (timestamp) => now - timestamp < OPENAI_RATE_LIMIT_WINDOW
  );

  // Check if user has exceeded OpenAI-specific rate limit
  if (recentCalls.length >= OPENAI_MAX_CALLS_PER_MINUTE) {
    const oldestCall = Math.min(...recentCalls);
    const retryAfter = Math.ceil(
      (oldestCall + OPENAI_RATE_LIMIT_WINDOW - now) / 1000
    );

    return res.status(429).json({
      error: "OpenAI rate limit protection",
      message: `Too many OpenAI API calls. Limit: ${OPENAI_MAX_CALLS_PER_MINUTE} calls per minute. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    });
  }

  // Store function to record the call (only if it actually hits OpenAI)
  req.recordOpenAICall = () => {
    recentCalls.push(now);
    openaiCallTracker.set(key, recentCalls);
  };

  next();
};

/**
 * Rate limiter for resume analysis endpoint
 * Limits: 10 requests per 15 minutes per IP (including cached responses)
 */
export const resumeAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs (increased since cache doesn't hit OpenAI)
  message: {
    error: "Too many requests",
    message: "You have exceeded the rate limit. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests",
      message:
        "You have exceeded the rate limit of 10 requests per 15 minutes. Please try again later.",
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000), // seconds until reset
    });
  },
  // Custom key generator - can be used to rate limit by user ID if authenticated
  keyGenerator: (req) => {
    // If user is authenticated, use user ID, otherwise use IP
    return req.user?.id || ipKeyGenerator(req);
  },
});

/**
 * General API rate limiter
 * Limits: 5 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
