import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string // How to identify the client
}

export function rateLimit(options: RateLimitOptions) {
  return async function rateLimitMiddleware(request: NextRequest) {
    const { windowMs, maxRequests, keyGenerator } = options

    // Generate client identifier (default: IP address from headers)
    const clientKey = keyGenerator
      ? keyGenerator(request)
      : request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'

    const now = Date.now()
    const windowStart = now - windowMs

    // Get current rate limit data for this client
    let clientData = rateLimitMap.get(clientKey)

    if (!clientData || clientData.resetTime < now) {
      // Reset or initialize client data
      clientData = { count: 0, resetTime: now + windowMs }
    }

    // Check if limit exceeded
    if (clientData.count >= maxRequests) {
      const resetIn = Math.ceil((clientData.resetTime - now) / 1000)

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
          retryAfter: resetIn
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': clientData.resetTime.toString()
          }
        }
      )
    }

    // Increment counter
    clientData.count++
    rateLimitMap.set(clientKey, clientData)

    // Add rate limit headers to successful response
    const response = NextResponse.next()
    const remaining = Math.max(0, maxRequests - clientData.count)

    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', clientData.resetTime.toString())

    return response
  }
}

// Pre-configured rate limiters for common use cases
export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
})

export const moderateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
})

export const lenientRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120, // 120 requests per minute
})

// Clean up old entries periodically (simple cleanup)
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitMap.entries()) {
    if (data.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute
