/**
 * Services API Routes
 * CRUD endpoints for managing available appointment services
 */

import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';

const WORKSPACE_ID = 'default-workspace';

const serviceRoutes: FastifyPluginAsync = async (fastify) => {
  // List all services
  fastify.get('/services', async (req, reply) => {
    const services = await prisma.service.findMany({
      where: { workspaceId: WORKSPACE_ID },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(services);
  });

  // Create a new service
  fastify.post('/services', async (req, reply) => {
    const { name, duration, description } = req.body as {
      name: string;
      duration?: number;
      description?: string;
    };

    if (!name || name.trim().length < 2) {
      return reply.status(400).send({ error: 'Service name is required (min 2 chars)' });
    }

    try {
      const service = await prisma.service.create({
        data: {
          workspaceId: WORKSPACE_ID,
          name: name.trim(),
          duration: duration || 30,
          description: description?.trim() || null,
        },
      });
      return reply.status(201).send(service);
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: 'A service with this name already exists' });
      }
      throw err;
    }
  });

  // Update a service
  fastify.patch('/services/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { name, duration, description, isActive } = req.body as {
      name?: string;
      duration?: number;
      description?: string;
      isActive?: boolean;
    };

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (duration !== undefined) data.duration = duration;
    if (description !== undefined) data.description = description?.trim() || null;
    if (isActive !== undefined) data.isActive = isActive;

    try {
      const service = await prisma.service.update({
        where: { id },
        data,
      });
      return reply.send(service);
    } catch (err: any) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Service not found' });
      }
      throw err;
    }
  });

  // Delete a service
  fastify.delete('/services/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    try {
      await prisma.service.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: any) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Service not found' });
      }
      throw err;
    }
  });
};

export default serviceRoutes;
