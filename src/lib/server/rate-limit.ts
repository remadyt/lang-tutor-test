// In-memory token bucket. Per-IP, module-scoped — works while the Vercel
// function instance is warm; cold starts reset state. Good enough to deter
// casual abuse; for stricter guarantees swap for Upstash / Vercel KV.

interface Bucket {
	lastRefillMs: number;
	tokens: number;
}

interface RateLimitConfig {
	readonly burst: number;
	readonly refillPerSecond: number;
}

interface RateLimitResult {
	readonly limit: number;
	readonly remaining: number;
	readonly retryAfterSeconds: number;
	readonly success: boolean;
}

const buckets = new Map<string, Bucket>();
const MILLISECONDS_PER_SECOND = 1000;

export function clientIdFromRequest(request: Request): string {
	const forwardedFor = request.headers.get('x-forwarded-for');

	if (forwardedFor !== null && forwardedFor.length > 0) {
		const firstAddress = forwardedFor.split(',')[0];

		if (firstAddress !== undefined) {
			return firstAddress.trim();
		}
	}

	return request.headers.get('x-real-ip') ?? 'anonymous';
}

export function consumeToken(key: string, config: RateLimitConfig): RateLimitResult {
	const now = Date.now();
	const existing = buckets.get(key) ?? { lastRefillMs: now, tokens: config.burst };
	const elapsedSeconds = (now - existing.lastRefillMs) / MILLISECONDS_PER_SECOND;

	const refilled = Math.min(
		config.burst,
		existing.tokens + elapsedSeconds * config.refillPerSecond,
	);

	if (refilled < 1) {
		const retryAfterSeconds = Math.ceil((1 - refilled) / config.refillPerSecond);

		buckets.set(key, { lastRefillMs: now, tokens: refilled });

		return { limit: config.burst, remaining: 0, retryAfterSeconds, success: false };
	}

	const tokensAfter = refilled - 1;

	buckets.set(key, { lastRefillMs: now, tokens: tokensAfter });

	return {
		limit: config.burst,
		remaining: Math.floor(tokensAfter),
		retryAfterSeconds: 0,
		success: true,
	};
}
