/** @type {import('next').NextConfig} */

const CSP = [
  "default-src 'self'",
  // Next.js requires unsafe-inline/eval for hydration scripts
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Fonts are self-hosted via next/font — no external CDN needed
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  // Prevent MIME-type sniffing attacks
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Deny embedding in iframes — prevents clickjacking
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Legacy XSS filter for older browsers
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  // Don't leak full Referrer URL to third parties
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Disable sensitive browser APIs
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Force HTTPS for 2 years (preload-ready)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Full Content-Security-Policy
  { key: 'Content-Security-Policy',   value: CSP },
]

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
