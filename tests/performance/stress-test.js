import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 80 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.2'],
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

  const res = http.get(`${BASE_URL}/equipment`, { headers })
  check(res, { 'status 200': (r) => r.status === 200 }) || errorRate.add(1)

  sleep(0.5)
}
