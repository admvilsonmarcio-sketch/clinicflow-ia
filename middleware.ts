import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// Rate limiting store (em produção, usar Redis ou similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Configurações de rate limiting por rota
const RATE_LIMITS = {
  '/api/patients': { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 req/15min
  '/api/consultas': { requests: 50, windowMs: 15 * 60 * 1000 }, // 50 req/15min
  '/api/clinicas': { requests: 30, windowMs: 15 * 60 * 1000 }, // 30 req/15min
  '/api/auth': { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 req/15min
  default: { requests: 200, windowMs: 15 * 60 * 1000 } // 200 req/15min
}

// Função para verificar rate limiting
function checkRateLimit(ip: string, path: string): boolean {
  const now = Date.now()
  const key = `${ip}:${path}`
  
  // Encontrar configuração de rate limit para a rota
  const routeConfig = Object.entries(RATE_LIMITS).find(([route]) => 
    path.startsWith(route)
  )?.[1] || RATE_LIMITS.default
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Primeira requisição ou janela expirou
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + routeConfig.windowMs
    })
    return true
  }
  
  if (current.count >= routeConfig.requests) {
    return false // Rate limit excedido
  }
  
  // Incrementar contador
  current.count++
  return true
}

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Aplicar rate limiting apenas para rotas de API
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request)
    
    if (!checkRateLimit(clientIP, pathname)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Muitas requisições. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil(RATE_LIMITS.default.windowMs / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(RATE_LIMITS.default.windowMs / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMITS.default.requests),
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }
  }
  
  // Verificar autenticação para rotas protegidas
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({ req: request, res })
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Acesso negado. Faça login para continuar.'
        },
        { status: 401 }
      )
    }
    
    // Adicionar informações do usuário aos headers para as API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.user.id)
    requestHeaders.set('x-user-email', session.user.email || '')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
  
  // Redirecionamento para dashboard se já logado
  if (pathname.startsWith('/auth/') && pathname !== '/auth/confirm') {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({ req: request, res })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // Proteger rotas do dashboard
  if (pathname.startsWith('/dashboard')) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({ req: request, res })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}