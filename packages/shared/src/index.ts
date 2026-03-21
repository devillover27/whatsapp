import { z } from 'zod';

export const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  templateId: z.string().uuid(),
  audienceType: z.enum(['all', 'tag', 'segment', 'csv']),
  audienceRef: z.string().optional(),
  variableMap: z.record(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;

export const ContactSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 format
  name: z.string().optional(),
  attributes: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  optedIn: z.boolean().default(false),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export const TemplateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
  language: z.string().min(2),
  headerType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']).optional(),
  headerValue: z.string().optional(),
  body: z.string().min(1),
  footer: z.string().optional(),
  buttons: z.array(z.any()).optional(),
});

export type TemplateInput = z.infer<typeof TemplateSchema>;
