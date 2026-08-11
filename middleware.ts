import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ipAddress } from '@vercel/functions/headers'

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory per serverless instance. For multi-instance use Upstash Redis,
// or (recommended for real protection) a Vercel WAF rate_limit rule, since
// Fluid Compute can run several concurrent instances each with their own map.
const rlMap = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_TRACKED_KEYS = 5_000 // hard cap so a flood of unique keys can't exhaust memory

const RATE_LIMITS: Array<{ prefix: string; max: number }> = [
  { prefix: '/api/upload',    max: 10  },  // 10 uploads/min
  { prefix: '/api/productos', max: 120 },  // 120 req/min
  { prefix: '/api/',          max: 60  },  // 60 req/min other API
  { prefix: '/admin/login',   max: 10  },  // 10 login attempts/min
]

function getLimit(pathname: string): number {
  for (const { prefix, max } of RATE_LIMITS) {
    if (pathname.startsWith(prefix)) return max
  }
  return 200
}

function checkRateLimit(key: string, max: number): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rlMap.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS
    if (rlMap.size >= MAX_TRACKED_KEYS) {
      // Under active flood, expired entries may not exist yet — evict the
      // oldest tracked key outright rather than let the map grow unbounded.
      const oldestKey = rlMap.keys().next().value
      if (oldestKey !== undefined) rlMap.delete(oldestKey)
    }
    rlMap.set(key, { count: 1, resetAt })
    return { ok: true, remaining: max - 1, resetAt }
  }

  entry.count++
  return { ok: entry.count <= max, remaining: Math.max(0, max - entry.count), resetAt: entry.resetAt }
}

// ── Security headers ──────────────────────────────────────────────────────────
function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options',        'DENY')
  res.headers.set('X-XSS-Protection',       '1; mode=block')
  res.headers.set('Referrer-Policy',        'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy',     'camera=(), microphone=(), geolocation=()')
  return res
}

// ── Known attack tool User-Agent patterns ────────────────────────────────────
const BLOCKED_UA = /sqlmap|nikto|nmap|masscan|zgrab|nuclei|dirsearch|hydra|burpsuite/i

// ── CSRF ──────────────────────────────────────────────────────────────────────
// Mutations are authenticated via cookies alone (no CSRF token), so reject any
// cross-site Origin on state-changing API requests. Browsers always send
// Origin on POST/PUT/PATCH/DELETE — same-origin admin requests are unaffected.
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// ── Middleware ────────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Block known security scanning / exploit tools
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_UA.test(ua)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Reject cross-site mutating requests to the API
  if (pathname.startsWith('/api/') && MUTATING_METHODS.has(request.method)) {
    const origin = request.headers.get('origin')
    if (origin) {
      const originHost = (() => { try { return new URL(origin).host } catch { return null } })()
      if (originHost !== request.nextUrl.host) {
        return addSecurityHeaders(NextResponse.json({ error: 'Origen no permitido' }, { status: 403 }))
      }
    }
  }

  // 3. Rate limiting for API routes and login page
  const applyRateLimit = pathname.startsWith('/api/') || pathname === '/admin/login'
  if (applyRateLimit) {
    // ipAddress() reads x-real-ip, set by Vercel's edge itself — unlike
    // x-forwarded-for it can't be spoofed by a client-supplied header,
    // which would otherwise let an attacker get a fresh counter per request.
    const ip = ipAddress(request) ?? 'unknown'
    const max = getLimit(pathname)
    const scope = pathname.startsWith('/api/')
      ? pathname.split('/').slice(0, 3).join('/')
      : pathname
    const rl = checkRateLimit(`${ip}:${scope}`, max)

    if (!rl.ok) {
      const retry = Math.ceil((rl.resetAt - Date.now()) / 1000)
      const res = NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
        {
          status: 429,
          headers: {
            'Retry-After':          retry.toString(),
            'X-RateLimit-Limit':    max.toString(),
            'X-RateLimit-Remaining':'0',
            'X-RateLimit-Reset':    rl.resetAt.toString(),
          },
        }
      )
      return addSecurityHeaders(res)
    }

    // API-only: attach rate limit headers and let request through
    if (pathname.startsWith('/api/')) {
      const res = NextResponse.next()
      res.headers.set('X-RateLimit-Limit',     max.toString())
      res.headers.set('X-RateLimit-Remaining', rl.remaining.toString())
      return addSecurityHeaders(res)
    }
  }

  // 4. Admin route auth guard via Supabase session
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Parameters<NonNullable<CookieMethodsServer['setAll']>>[0]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  if (isAdminRoute && !isLoginRoute && !user) {
    return addSecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)))
  }

  if (isLoginRoute && user) {
    return addSecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)))
  }

  return addSecurityHeaders(supabaseResponse)
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
