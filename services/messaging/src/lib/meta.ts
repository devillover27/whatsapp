import axios from 'axios'

const META_API_VERSION = process.env.META_API_VERSION || 'v20.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export interface TemplateMessagePayload {
  phoneNumberId: string
  accessToken: string
  to: string
  templateName: string
  languageCode: string
  components: any[]
}

export async function sendTemplateMessage(payload: TemplateMessagePayload) {
  const url = `${BASE_URL}/${payload.phoneNumberId}/messages`

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: payload.to,
    type: 'template',
    template: {
      name: payload.templateName,
      language: { code: payload.languageCode },
      components: payload.components,
    },
  }

  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  })

  return response.data
}

export async function getTemplates(wabaId: string, accessToken: string) {
  const url = `${BASE_URL}/${wabaId}/message_templates`
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    timeout: 10000,
  })
  return response.data
}

export async function getWabaInsights(wabaId: string, accessToken: string) {
  // Fetch messaging statistics from Meta
  const url = `${BASE_URL}/${wabaId}/insights/messages_stats`
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      start: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), // Last 7 days
      end: Math.floor(Date.now() / 1000),
      granularity: 'DAILY'
    },
    timeout: 10000,
  })
  return response.data
}
