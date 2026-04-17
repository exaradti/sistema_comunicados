import { NextRequest, NextResponse } from 'next/server'

const protected_paths = ['/dashboard', '/funcionarios', '/setores', '/unidades', '/comunicados', '/usuarios-admin']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const is_protected = protected_paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (!is_protected) return NextResponse.next()

  const session = request.cookies.get('admin_session')?.value
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/funcionarios/:path*',
    '/setores/:path*',
    '/unidades/:path*',
    '/comunicados/:path*',
    '/usuarios-admin/:path*'
  ]
}
