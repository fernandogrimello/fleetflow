interface WebhookPayload {
  event: string
  timestamp: string
  data: Record<string, any>
}

export async function dispatchWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = process.env.WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FleetFlow-Event': payload.event,
        'X-FleetFlow-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    console.log(`[webhook] ${payload.event} disparado para ${webhookUrl}`)
  } catch (err) {
    console.error(`[webhook] falha ao disparar ${payload.event}:`, err)
  }
}
