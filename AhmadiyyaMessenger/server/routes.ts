import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { initializeBot, updateBotPresence, shutdownBot, client } from "./bot";
import {
  botConfig as botConfigSchema,
  commands as commandsSchema,
  authorizedChannels as channelsSchema,
  knowledgeBase as knowledgeSchema,
  insertBotConfigSchema,
  insertCommandSchema,
  insertAuthorizedChannelSchema,
  insertKnowledgeBaseSchema
} from "@shared/schema";

// Initialize the Discord bot with token from environment variables
async function startBot() {
  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.warn("No Discord bot token found. Set DISCORD_BOT_TOKEN environment variable to enable the bot.");
      return;
    }
    
    await initializeBot(token);
    console.log("Discord bot initialized");
  } catch (error) {
    console.error("Failed to start Discord bot:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Start bot on server startup
  await startBot();
  
  // API route prefix
  const apiPrefix = "/api";
  
  // Bot configuration routes
  app.get(`${apiPrefix}/config`, async (req, res) => {
    try {
      const config = await storage.getBotConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve bot configuration" });
    }
  });
  
  app.patch(`${apiPrefix}/config`, async (req, res) => {
    try {
      const validatedData = insertBotConfigSchema.partial().parse(req.body);
      const updatedConfig = await storage.updateBotConfig(validatedData);
      
      // If bot is running, update its presence
      if (client && client.isReady()) {
        await updateBotPresence(
          updatedConfig.status,
          updatedConfig.activityType,
          updatedConfig.activityName
        );
      }
      
      res.json(updatedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update bot configuration" });
      }
    }
  });
  
  // Commands routes
  app.get(`${apiPrefix}/commands`, async (req, res) => {
    try {
      const commands = await storage.getCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve commands" });
    }
  });
  
  app.post(`${apiPrefix}/commands`, async (req, res) => {
    try {
      const validatedData = insertCommandSchema.parse(req.body);
      const command = await storage.createCommand(validatedData);
      res.status(201).json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create command" });
      }
    }
  });
  
  app.patch(`${apiPrefix}/commands/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid command ID" });
      }
      
      const command = await storage.getCommand(id);
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      
      const validatedData = insertCommandSchema.partial().parse(req.body);
      const updatedCommand = await storage.updateCommand(id, validatedData);
      res.json(updatedCommand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update command" });
      }
    }
  });
  
  app.delete(`${apiPrefix}/commands/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid command ID" });
      }
      
      const success = await storage.deleteCommand(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Command not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete command" });
    }
  });
  
  // Authorized channels routes
  app.get(`${apiPrefix}/channels`, async (req, res) => {
    try {
      const channels = await storage.getAuthorizedChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve authorized channels" });
    }
  });
  
  app.post(`${apiPrefix}/channels`, async (req, res) => {
    try {
      const validatedData = insertAuthorizedChannelSchema.parse(req.body);
      const channel = await storage.addAuthorizedChannel(validatedData);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add authorized channel" });
      }
    }
  });
  
  app.delete(`${apiPrefix}/channels/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid channel ID" });
      }
      
      const success = await storage.removeAuthorizedChannel(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to remove authorized channel" });
    }
  });
  
  // Knowledge base routes
  app.get(`${apiPrefix}/knowledge`, async (req, res) => {
    try {
      const entries = await storage.getKnowledgeBaseEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve knowledge base entries" });
    }
  });
  
  app.get(`${apiPrefix}/knowledge/search`, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const results = await storage.searchKnowledgeBase(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search knowledge base" });
    }
  });
  
  app.get(`${apiPrefix}/knowledge/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      
      const entry = await storage.getKnowledgeBaseEntry(id);
      if (entry) {
        res.json(entry);
      } else {
        res.status(404).json({ error: "Knowledge base entry not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve knowledge base entry" });
    }
  });
  
  app.post(`${apiPrefix}/knowledge`, async (req, res) => {
    try {
      const validatedData = insertKnowledgeBaseSchema.parse(req.body);
      const entry = await storage.addKnowledgeBaseEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add knowledge base entry" });
      }
    }
  });
  
  app.patch(`${apiPrefix}/knowledge/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      
      const entry = await storage.getKnowledgeBaseEntry(id);
      if (!entry) {
        return res.status(404).json({ error: "Knowledge base entry not found" });
      }
      
      const validatedData = insertKnowledgeBaseSchema.partial().parse(req.body);
      const updatedEntry = await storage.updateKnowledgeBaseEntry(id, validatedData);
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update knowledge base entry" });
      }
    }
  });
  
  app.delete(`${apiPrefix}/knowledge/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      
      const success = await storage.deleteKnowledgeBaseEntry(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Knowledge base entry not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete knowledge base entry" });
    }
  });
  
  // Conversations routes
  app.get(`${apiPrefix}/conversations`, async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve conversations" });
    }
  });
  
  // Bot status routes
  app.get(`${apiPrefix}/bot/status`, async (req, res) => {
    try {
      const isConnected = client && client.isReady();
      res.json({ 
        connected: isConnected,
        username: isConnected ? client.user?.username : null,
        id: isConnected ? client.user?.id : null,
        guilds: isConnected ? client.guilds.cache.size : 0
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });
  
  app.post(`${apiPrefix}/bot/restart`, async (req, res) => {
    try {
      if (client && client.isReady()) {
        await shutdownBot();
      }
      
      await startBot();
      res.json({ success: true, message: "Bot restarted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to restart bot" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
