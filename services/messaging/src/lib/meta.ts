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
