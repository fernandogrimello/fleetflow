export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('fleetflow_token')
}

export function setToken(token: string): void {
  localStorage.setItem('fleetflow_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('fleetflow_token')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
