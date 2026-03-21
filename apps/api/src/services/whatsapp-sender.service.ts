/**
 * WhatsApp Sender Service
 * Wraps the Meta Cloud API for sending different message types
 * (text, interactive buttons, interactive lists)
 */

const META_API_VERSION = process.env.META_API_VERSION || 'v22.0';
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;

const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

interface ButtonItem {
  id: string;
  title: string;
}

interface ListRow {
  id: string;
  title: string;
  description?: string;
}

interface ListSection {
  title: string;
  rows: ListRow[];
}

async function metaSend(payload: Record<string, any>): Promise<any> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      ...payload,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('[WhatsApp Sender] Error:', res.status, errorBody);
    throw new Error(`Meta API error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

/**
 * Send a plain text message
 */
export async function sendTextMessage(to: string, text: string) {
  return metaSend({
    to,
    type: 'text',
    text: { body: text },
  });
}

/**
 * Send an interactive reply-button message (max 3 buttons)
 */
export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: ButtonItem[],
  headerText?: string,
  footerText?: string
) {
  const payload: any = {
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map((btn) => ({
          type: 'reply',
          reply: {
            id: btn.id,
            title: btn.title.slice(0, 20), // Meta limit: 20 chars
          },
        })),
      },
    },
  };

  if (headerText) {
    payload.interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  return metaSend(payload);
}

/**
 * Send an interactive list message (for service/time selection)
 */
export async function sendListMessage(
  to: string,
  bodyText: string,
  buttonLabel: string,
  sections: ListSection[],
  headerText?: string,
  footerText?: string
) {
  const payload: any = {
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonLabel.slice(0, 20),
        sections: sections.map((section) => ({
          title: section.title.slice(0, 24),
          rows: section.rows.map((row) => ({
            id: row.id,
            title: row.title.slice(0, 24),
            description: row.description?.slice(0, 72),
          })),
        })),
      },
    },
  };

  if (headerText) {
    payload.interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  return metaSend(payload);
}
