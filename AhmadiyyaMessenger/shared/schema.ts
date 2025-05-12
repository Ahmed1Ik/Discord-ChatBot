import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bot Configuration
export const botConfig = pgTable("bot_config", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Ahmadiyya Helper"),
  description: text("description").notNull().default("A Discord bot that answers questions about Ahmadiyya beliefs, history, and teachings."),
  avatar: text("avatar"),
  status: text("status").notNull().default("online"),
  activityType: text("activity_type").notNull().default("Playing"),
  activityName: text("activity_name").notNull().default("Answering questions"),
  commandPrefix: text("command_prefix").notNull().default("!"),
  useSlashCommands: boolean("use_slash_commands").notNull().default(true),
  respondToMentions: boolean("respond_to_mentions").notNull().default(true),
  responseMode: text("response_mode").notNull().default("precise"),
  responseTimeout: integer("response_timeout").notNull().default(15),
  maxResponseLength: text("max_response_length").notNull().default("medium"),
  includeCitations: boolean("include_citations").notNull().default(true),
  respondToDirectMessages: boolean("respond_to_direct_messages").notNull().default(true),
  useEmbeds: boolean("use_embeds").notNull().default(true),
  useAI: boolean("use_ai").notNull().default(true),
});

export const insertBotConfigSchema = createInsertSchema(botConfig).omit({
  id: true,
});

export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type BotConfig = typeof botConfig.$inferSelect;

// Bot Commands
export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  usage: text("usage").notNull(),
  enabled: boolean("enabled").notNull().default(true),
});

export const insertCommandSchema = createInsertSchema(commands).omit({
  id: true,
});

export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type Command = typeof commands.$inferSelect;

// Authorized Channels
export const authorizedChannels = pgTable("authorized_channels", {
  id: serial("id").primaryKey(),
  channelId: text("channel_id").notNull().unique(),
  channelName: text("channel_name").notNull(),
});

export const insertAuthorizedChannelSchema = createInsertSchema(authorizedChannels).omit({
  id: true,
});

export type InsertAuthorizedChannel = z.infer<typeof insertAuthorizedChannelSchema>;
export type AuthorizedChannel = typeof authorizedChannels.$inferSelect;

// Knowledge Base Entries
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  source: text("source"),
  tags: text("tags").array(),
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
});

export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;

// User queries and bot responses
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  channel: text("channel"),
  query: text("query").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  timestamp: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
