/**
 * Chatbot Service — Appointment Booking State Machine
 * 
 * Handles inbound WhatsApp messages and guides clients through
 * a booking flow using a finite state machine approach.
 * 
 * States: IDLE → ASK_NAME → ASK_SERVICE → ASK_DATE → ASK_TIME → CONFIRM → COMPLETED
 */

import { prisma } from '../lib/prisma.js';
import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
} from './whatsapp-sender.service.js';

const WORKSPACE_ID = 'default-workspace';

// ─── State Definitions ───────────────────────────────────────
type ChatState = 'IDLE' | 'ASK_NAME' | 'ASK_SERVICE' | 'ASK_DATE' | 'ASK_TIME' | 'CONFIRM';

interface ConversationContext {
  clientName?: string;
  serviceId?: string;
  serviceName?: string;
  date?: string;       // ISO date string
  dateLabel?: string;   // human-readable label
  timeSlot?: string;    // "09:00"
  duration?: number;
}

// ─── Helpers ─────────────────────────────────────────────────

function getNext7Days(): { id: string; label: string; iso: string }[] {
  const days: { id: string; label: string; iso: string }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    
    // Skip Sundays (0)
    if (dayOfWeek === 0) continue;

    const dayName = dayNames[dayOfWeek];
    const dateNum = d.getDate();
    const month = monthNames[d.getMonth()];
    const label = `${dayName}, ${dateNum} ${month}`;
    const iso = d.toISOString().split('T')[0]; // YYYY-MM-DD

    days.push({ id: `date_${iso}`, label, iso });
  }
  return days.slice(0, 6); // max 6 to fit list UX
}

function getTimeSlots(): { id: string; title: string }[] {
  const slots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM',
  ];
  return slots.map((s) => ({
    id: `time_${s.replace(/[: ]/g, '')}`,
    title: s,
  }));
}

function timeSlotIdToTime(id: string): string {
  // "time_0900AM" → "09:00 AM"
  const raw = id.replace('time_', '');
  // raw = "0900AM" → "09:00 AM"
  const hours = raw.slice(0, 2);
  const mins = raw.slice(2, 4);
  const period = raw.slice(4);
  return `${hours}:${mins} ${period}`;
}

function parseTimeTo24h(timeStr: string): { hours: number; minutes: number } {
  // "09:00 AM" → { hours: 9, minutes: 0 }
  // "02:30 PM" → { hours: 14, minutes: 30 }
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}


// ─── Main Handler ────────────────────────────────────────────

export async function handleInboundMessage(
  phone: string,
  userInput: string,
  messageType: string
): Promise<void> {
  try {
    // Load or create conversation state
    let conversation = await prisma.conversationState.upsert({
      where: {
        workspaceId_phone: { workspaceId: WORKSPACE_ID, phone },
      },
      update: {},
      create: {
        workspaceId: WORKSPACE_ID,
        phone,
        state: 'IDLE',
        context: {},
      },
    });

    const state = conversation.state as ChatState;
    const ctx = (conversation.context || {}) as ConversationContext;
    const input = userInput.trim().toLowerCase();

    // Global commands — reset conversation anytime
    if (input === 'cancel' || input === 'restart' || input === 'menu') {
      await resetConversation(phone);
      await sendWelcome(phone);
      return;
    }

    // Route based on current state
    switch (state) {
      case 'IDLE':
        await handleIdle(phone, input);
        break;
      case 'ASK_NAME':
        await handleAskName(phone, userInput.trim(), ctx);
        break;
      case 'ASK_SERVICE':
        await handleAskService(phone, userInput.trim(), ctx);
        break;
      case 'ASK_DATE':
        await handleAskDate(phone, userInput.trim(), ctx);
        break;
      case 'ASK_TIME':
        await handleAskTime(phone, userInput.trim(), ctx);
        break;
      case 'CONFIRM':
        await handleConfirm(phone, userInput.trim(), ctx);
        break;
      default:
        await resetConversation(phone);
        await sendWelcome(phone);
    }
  } catch (err) {
    console.error('[Chatbot] Error handling message:', err);
    await sendTextMessage(phone, '⚠️ Sorry, something went wrong. Please type "hi" to start again.');
  }
}

// ─── State Handlers ──────────────────────────────────────────

async function sendWelcome(phone: string) {
  await sendButtonMessage(
    phone,
    '👋 Welcome! I can help you book an appointment.\n\nWhat would you like to do?',
    [
      { id: 'book_appointment', title: '📅 Book Appointment' },
      { id: 'view_services', title: 'ℹ️ Our Services' },
    ],
    '🏥 Appointment Booking'
  );
}

async function handleIdle(phone: string, input: string) {
  if (input === 'book_appointment' || input.includes('book') || input.includes('appointment') || input.includes('hi') || input.includes('hello') || input.includes('hey')) {
    // Transition to ASK_NAME
    await updateState(phone, 'ASK_NAME', {});
    await sendTextMessage(phone, '👤 Great! Let\'s book your appointment.\n\nWhat is your *name*?');
  } else if (input === 'view_services') {
    // Show services list but stay in IDLE
    const services = await prisma.service.findMany({
      where: { workspaceId: WORKSPACE_ID, isActive: true },
    });

    if (services.length === 0) {
      await sendTextMessage(phone, 'No services are currently available. Please contact us directly.');
      return;
    }

    let serviceList = '📋 *Our Services:*\n\n';
    services.forEach((s, i) => {
      serviceList += `${i + 1}. *${s.name}* — ${s.duration} min\n`;
      if (s.description) serviceList += `   ${s.description}\n`;
    });
    serviceList += '\nType *"book"* to book an appointment!';
    await sendTextMessage(phone, serviceList);
  } else {
    // Any other message — show welcome
    await sendWelcome(phone);
  }
}

async function handleAskName(phone: string, input: string, ctx: ConversationContext) {
  if (!input || input.length < 2) {
    await sendTextMessage(phone, 'Please enter your name (at least 2 characters):');
    return;
  }

  // Save name, transition to ASK_SERVICE
  const newCtx: ConversationContext = { ...ctx, clientName: input };

  const services = await prisma.service.findMany({
    where: { workspaceId: WORKSPACE_ID, isActive: true },
  });

  if (services.length === 0) {
    await sendTextMessage(phone, `Thanks ${input}! Unfortunately, no services are available right now. Please try again later.`);
    await resetConversation(phone);
    return;
  }

  await updateState(phone, 'ASK_SERVICE', newCtx);

  await sendListMessage(
    phone,
    `Nice to meet you, *${input}*! 😊\n\nPlease select a service for your appointment:`,
    'View Services',
    [
      {
        title: 'Available Services',
        rows: services.map((s) => ({
          id: `service_${s.id}`,
          title: s.name,
          description: `${s.duration} min${s.description ? ' — ' + s.description : ''}`,
        })),
      },
    ],
    '🏥 Select Service'
  );
}

async function handleAskService(phone: string, input: string, ctx: ConversationContext) {
  // Parse service selection
  const serviceId = input.startsWith('service_') ? input.replace('service_', '') : null;

  if (!serviceId) {
    await sendTextMessage(phone, 'Please select a service from the list above. Tap the button to view options.');
    return;
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    await sendTextMessage(phone, 'Service not found. Please select from the list.');
    return;
  }

  const newCtx: ConversationContext = {
    ...ctx,
    serviceId: service.id,
    serviceName: service.name,
    duration: service.duration,
  };

  await updateState(phone, 'ASK_DATE', newCtx);

  // Send date options as a list
  const dates = getNext7Days();

  await sendListMessage(
    phone,
    `✅ *${service.name}* selected (${service.duration} min)\n\nPlease pick a preferred date:`,
    'View Dates',
    [
      {
        title: 'Available Dates',
        rows: dates.map((d) => ({
          id: d.id,
          title: d.label,
        })),
      },
    ],
    '📅 Select Date'
  );
}

async function handleAskDate(phone: string, input: string, ctx: ConversationContext) {
  // Parse date selection: "date_2026-03-24"
  const dateMatch = input.startsWith('date_') ? input.replace('date_', '') : null;

  if (!dateMatch) {
    await sendTextMessage(phone, 'Please select a date from the list. Tap the button to view available dates.');
    return;
  }

  // Validate it's a real date
  const parsed = new Date(dateMatch);
  if (isNaN(parsed.getTime())) {
    await sendTextMessage(phone, 'Invalid date. Please select from the list.');
    return;
  }

  // Build human-readable label
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${dayNames[parsed.getUTCDay()]}, ${parsed.getUTCDate()} ${monthNames[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;

  const newCtx: ConversationContext = {
    ...ctx,
    date: dateMatch,
    dateLabel,
  };

  await updateState(phone, 'ASK_TIME', newCtx);

  // Send time slots
  const timeSlots = getTimeSlots();

  await sendListMessage(
    phone,
    `📅 *${dateLabel}* selected\n\nPick a time slot:`,
    'View Time Slots',
    [
      {
        title: 'Morning',
        rows: timeSlots.filter((t) => t.title.includes('AM')),
      },
      {
        title: 'Afternoon',
        rows: timeSlots.filter((t) => t.title.includes('PM')),
      },
    ],
    '🕐 Select Time'
  );
}

async function handleAskTime(phone: string, input: string, ctx: ConversationContext) {
  if (!input.startsWith('time_')) {
    await sendTextMessage(phone, 'Please select a time slot from the list. Tap the button to view options.');
    return;
  }

  const timeSlot = timeSlotIdToTime(input);
  const newCtx: ConversationContext = { ...ctx, timeSlot };

  await updateState(phone, 'CONFIRM', newCtx);

  // Send booking summary for confirmation
  const summary = [
    `📋 *Booking Summary*`,
    `─────────────────`,
    `👤 *Name:* ${newCtx.clientName}`,
    `🏥 *Service:* ${newCtx.serviceName}`,
    `📅 *Date:* ${newCtx.dateLabel}`,
    `🕐 *Time:* ${timeSlot}`,
    `⏱ *Duration:* ${newCtx.duration} min`,
    `─────────────────`,
    `\nPlease confirm or cancel your booking:`,
  ].join('\n');

  await sendButtonMessage(
    phone,
    summary,
    [
      { id: 'confirm_booking', title: '✅ Confirm' },
      { id: 'cancel_booking', title: '❌ Cancel' },
    ]
  );
}

async function handleConfirm(phone: string, input: string, ctx: ConversationContext) {
  if (input === 'confirm_booking' || input.includes('confirm') || input.includes('yes')) {
    // Create the appointment in the database
    const { hours, minutes } = parseTimeTo24h(ctx.timeSlot!);
    const appointmentDate = new Date(ctx.date!);
    appointmentDate.setUTCHours(hours, minutes, 0, 0);

    const appointment = await prisma.appointment.create({
      data: {
        workspaceId: WORKSPACE_ID,
        serviceId: ctx.serviceId!,
        clientPhone: phone,
        clientName: ctx.clientName!,
        date: appointmentDate,
        duration: ctx.duration!,
        status: 'confirmed',
      },
    });

    const bookingId = appointment.id.slice(0, 8).toUpperCase();

    await sendTextMessage(
      phone,
      [
        `✅ *Appointment Confirmed!*`,
        ``,
        `📌 *Booking ID:* ${bookingId}`,
        `👤 *Name:* ${ctx.clientName}`,
        `🏥 *Service:* ${ctx.serviceName}`,
        `📅 *Date:* ${ctx.dateLabel}`,
        `🕐 *Time:* ${ctx.timeSlot}`,
        ``,
        `We'll send you a reminder before your appointment.`,
        ``,
        `Type *"hi"* anytime to book another appointment! 😊`,
      ].join('\n')
    );

    // Reset conversation
    await resetConversation(phone);

  } else if (input === 'cancel_booking' || input.includes('cancel') || input.includes('no')) {
    await sendTextMessage(phone, '❌ Booking cancelled. No worries!\n\nType *"hi"* to start a new booking anytime.');
    await resetConversation(phone);

  } else {
    await sendButtonMessage(
      phone,
      'Please confirm or cancel your booking:',
      [
        { id: 'confirm_booking', title: '✅ Confirm' },
        { id: 'cancel_booking', title: '❌ Cancel' },
      ]
    );
  }
}

// ─── State Persistence ───────────────────────────────────────

async function updateState(phone: string, state: ChatState, context: ConversationContext) {
  await prisma.conversationState.upsert({
    where: {
      workspaceId_phone: { workspaceId: WORKSPACE_ID, phone },
    },
    update: { state, context: context as any },
    create: {
      workspaceId: WORKSPACE_ID,
      phone,
      state,
      context: context as any,
    },
  });
}

async function resetConversation(phone: string) {
  await prisma.conversationState.upsert({
    where: {
      workspaceId_phone: { workspaceId: WORKSPACE_ID, phone },
    },
    update: { state: 'IDLE', context: {} },
    create: {
      workspaceId: WORKSPACE_ID,
      phone,
      state: 'IDLE',
      context: {},
    },
  });
}
