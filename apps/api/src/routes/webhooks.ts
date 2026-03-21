import { FastifyPluginAsync } from 'fastify'
import crypto from 'crypto'
import { webhookQueue } from '@workspace/messaging/queues/campaign.queue.js'
import { prisma } from '../lib/prisma.js'
import { handleInboundMessage } from '../services/chatbot.service.js'

const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  // Meta verification GET
  fastify.get('/webhook', async (req, reply) => {
    const mode = (req.query as any)['hub.mode']
    const token = (req.query as any)['hub.verify_token']
    const challenge = (req.query as any)['hub.challenge']

    if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
      return reply.send(challenge)
    }
    return reply.status(403).send('Forbidden')
  })

  // Meta events POST
  fastify.post('/webhook', async (req, reply) => {
    // Return 200 immediately to acknowledge receipt to Meta
    reply.status(200).send('OK')

    try {
      const body = req.body as any;
      if (body.object === 'whatsapp_business_account' && body.entry) {
        for (const entry of body.entry) {
          for (const change of entry.changes || []) {
            
            // 1. Intercept Template Approval/Rejection updates
            if (change.field === 'message_template_status_update') {
              const { event, message_template_name, message_template_language } = change.value;
              
              const statusMap: Record<string, string> = {
                'APPROVED': 'APPROVED',
                'REJECTED': 'REJECTED',
                'PENDING': 'PENDING'
              };

              console.log(`[Webhooks] Template ${message_template_name} is now ${event}`);

              await prisma.messageTemplate.updateMany({
                where: {
                  name: message_template_name,
                  language: message_template_language
                },
                data: {
                  metaStatus: statusMap[event] || event
                }
              });
            }

            // 2. Intercept inbound client messages → route to Chatbot
            if (change.field === 'messages') {
              const messages = change.value?.messages || [];
              for (const msg of messages) {
                const from = msg.from;  // sender phone E.164
                const type = msg.type;  // text | interactive | button
                let userInput = '';

                if (type === 'text') {
                  userInput = msg.text?.body || '';
                } else if (type === 'interactive') {
                  userInput = msg.interactive?.button_reply?.id
                    || msg.interactive?.list_reply?.id
                    || '';
                } else if (type === 'button') {
                  userInput = msg.button?.text || '';
                }

                if (from && userInput) {
                  console.log(`[Webhooks] Inbound from ${from}: "${userInput}" (${type})`);
                  await handleInboundMessage(from, userInput, type);
                }
              }
            }
          }
        }
      }

      // 3. Push to queue for standard inbound message processing
      await webhookQueue.add('process-webhook', req.body);
    } catch (e) {
      console.error("[Webhooks] Failed processing webhook:", e);
    }
  })
}

export default webhookRoutes
