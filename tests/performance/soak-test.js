import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '2m', target: 5 },
    { duration: '10m', target: 5 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.05'],
  },
}

const BASE_URL = 'http://localhost:3001'

export function setup() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'luizfernandogrimello@hotmail.com',
    password: '123456',
  }), { headers: { 'Content-Type': 'application/json' } })
  return { token: res.json('token') }
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  }

  const eq = http.get(`${BASE_URL}/equipment`, { headers })
  check(eq, { 'equipment ok': (r) => r.status === 200 }) || errorRate.add(1)

  const map = http.get(`${BASE_URL}/telemetry/fleet-map`, { headers })
  check(map, { 'map ok': (r) => r.status === 200 }) || errorRate.add(1)

  sleep(2)
}
