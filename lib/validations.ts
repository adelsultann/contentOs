import { z } from "zod";
import {
  aiProviders,
  agentRoles,
  draftStatuses,
  ideaPriorities,
  ideaStatuses,
  platforms
} from "@/lib/constants";

export const ideaSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160, "Keep titles under 160 characters"),
  rawInput: z.string().trim().optional().default(""),
  topic: z.string().trim().optional().default(""),
  contentPillarId: z.string().trim().optional().default(""),
  status: z.enum(ideaStatuses).default("captured"),
  priority: z.enum(ideaPriorities).default("medium")
});

export const contentPillarSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Keep names under 80 characters"),
  description: z.string().trim().optional().default("")
});

export const draftSchema = z.object({
  platform: z.enum(platforms).default("x"),
  content: z.string().trim().min(1, "Draft content is required"),
  status: z.enum(draftStatuses).default("draft")
});

export const draftThreadSchema = z.object({
  platform: z.enum(platforms).default("X"),
  status: z.enum(draftStatuses).default("draft"),
  posts: z
    .array(
      z.object({
        content: z.string().trim().min(1, "Post content is required")
      })
    )
    .min(1, "At least one post is required")
    .max(25, "Keep a draft thread under 25 posts")
});

export const draftRewriteSchema = z.object({
  instructions: z
    .string()
    .trim()
    .min(1, "Tell the agent what to adjust")
    .max(2000, "Keep adjustment notes under 2000 characters")
});

export const styleProfileSchema = z.object({
  dialect: z.string().trim().optional().default(""),
  tone: z.string().trim().optional().default(""),
  audience: z.string().trim().optional().default(""),
  writingRules: z.string().trim().optional().default(""),
  bannedPhrases: z.string().trim().optional().default(""),
  commonPhrases: z.string().trim().optional().default(""),
  examplePosts: z.string().trim().optional().default("")
});

export const aiProviderConfigSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Keep names under 80 characters"),
  provider: z.enum(aiProviders).default("openai"),
  baseUrl: z
    .string()
    .trim()
    .min(1, "Base URL is required")
    .url("Use a valid API base URL"),
  apiKey: z.string().trim().optional().default(""),
  defaultModel: z
    .string()
    .trim()
    .min(1, "Default model is required")
    .max(120, "Keep model names under 120 characters"),
  temperature: z.coerce
    .number()
    .min(0, "Temperature cannot be below 0")
    .max(2, "Temperature cannot be above 2")
    .default(0.7),
  isDefault: z.boolean().default(false),
  isEnabled: z.boolean().default(true)
});

export const agentConfigSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Keep names under 80 characters"),
  description: z.string().trim().optional().default(""),
  role: z.enum(agentRoles).default("writer"),
  goal: z.string().trim().optional().default(""),
  systemPrompt: z
    .string()
    .trim()
    .min(1, "System prompt is required")
    .max(8000, "Keep the system prompt under 8000 characters"),
  outputFormat: z.string().trim().optional().default(""),
  providerConfigId: z.string().trim().optional().default(""),
  model: z.string().trim().optional().default(""),
  temperature: z
    .union([
      z.literal(""),
      z.coerce.number().min(0, "Temperature cannot be below 0").max(2, "Temperature cannot be above 2")
    ])
    .optional()
    .default(""),
  isEnabled: z.boolean().default(true)
});

export type IdeaFormValues = z.infer<typeof ideaSchema>;
export type ContentPillarFormValues = z.infer<typeof contentPillarSchema>;
export type DraftFormValues = z.infer<typeof draftSchema>;
export type DraftThreadFormValues = z.infer<typeof draftThreadSchema>;
export type DraftRewriteFormValues = z.infer<typeof draftRewriteSchema>;
export type StyleProfileFormValues = z.infer<typeof styleProfileSchema>;
export type AiProviderConfigFormValues = z.infer<typeof aiProviderConfigSchema>;
export type AgentConfigFormValues = z.infer<typeof agentConfigSchema>;
