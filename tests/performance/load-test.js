import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.1'],
  },
}

const BASE_URL = 'http://localhost:3001'
let token = ''

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

  const equipmentRes = http.get(`${BASE_URL}/equipment`, { headers })
  check(equipmentRes, {
    'equipment list status 200': (r) => r.status === 200,
    'equipment list has items': (r) => r.json('items') !== null,
  }) || errorRate.add(1)

  const rentalsRes = http.get(`${BASE_URL}/rentals`, { headers })
  check(rentalsRes, {
    'rentals list status 200': (r) => r.status === 200,
  }) || errorRate.add(1)

  const mapRes = http.get(`${BASE_URL}/telemetry/fleet-map`, { headers })
  check(mapRes, {
    'fleet map status 200': (r) => r.status === 200,
  }) || errorRate.add(1)

  sleep(1)
}
