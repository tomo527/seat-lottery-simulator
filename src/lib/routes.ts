export type PageRoute = 'home' | 'terms' | 'privacy' | 'tokushoho'

export function resolvePageRoute(pathname: string): PageRoute {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (normalized === '/terms') return 'terms'
  if (normalized === '/privacy') return 'privacy'
  if (normalized === '/tokushoho') return 'tokushoho'
  return 'home'
}
