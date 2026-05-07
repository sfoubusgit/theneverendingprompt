export function isAuthorized(request: Request): boolean {
  const auth = request.headers.get('authorization')
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}
