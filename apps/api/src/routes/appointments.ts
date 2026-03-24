/**
 * Appointments API Routes
 * CRUD endpoints for managing booked appointments
 */

import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';

const WORKSPACE_ID = 'default-workspace';

const appointmentRoutes: FastifyPluginAsync = async (fastify) => {
  // List all appointments (with filters)
  fastify.get('/appointments', async (req, reply) => {
    const { status, serviceId, date, page = '1', limit = '20' } = req.query as {
      status?: string;
      serviceId?: string;
      date?: string;
      page?: string;
      limit?: string;
    };

    const where: any = { workspaceId: WORKSPACE_ID };

    if (status) where.status = status;
    if (serviceId) where.serviceId = serviceId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: { service: true },
        orderBy: { date: 'asc' },
        skip,
        take,
      }),
      prisma.appointment.count({ where }),
    ]);

    return reply.send({
      appointments,
      pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  });

  // Get a single appointment
  fastify.get('/appointments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!appointment) {
      return reply.status(404).send({ error: 'Appointment not found' });
    }

    return reply.send(appointment);
  });

  // Update appointment status
  fastify.patch('/appointments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { status, notes } = req.body as { status?: string; notes?: string };

    const validStatuses = ['confirmed', 'cancelled', 'completed', 'no_show'];
    if (status && !validStatuses.includes(status)) {
      return reply.status(400).send({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    const data: any = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;

    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data,
        include: { service: true },
      });
      return reply.send(appointment);
    } catch (err: any) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Appointment not found' });
      }
      throw err;
    }
  });

  // Delete appointment
  fastify.delete('/appointments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    try {
      await prisma.appointment.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: any) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Appointment not found' });
      }
      throw err;
    }
  });

  // Chatbot simulation endpoint (for testing without ngrok/Meta)
  fastify.post('/chatbot/simulate', async (req, reply) => {
    const { phone, message } = req.body as { phone: string; message: string };

    if (!phone || !message) {
      return reply.status(400).send({ error: 'Both phone and message are required' });
    }

    // Dynamically import to avoid circular deps
    const { handleInboundMessage } = await import('../services/chatbot.service.js');
    
    try {
      await handleInboundMessage(phone, message, 'text');
      return reply.send({ success: true, info: 'Message processed through chatbot state machine' });
    } catch (err: any) {
      // Meta API will fail if token/phone are not configured — this is expected in dev
      return reply.send({
        success: false,
        info: 'Chatbot state machine processed, but WhatsApp API call failed (expected in local dev without valid Meta credentials)',
        error: err.message || String(err),
      });
    }
  });
};

export default appointmentRoutes;
