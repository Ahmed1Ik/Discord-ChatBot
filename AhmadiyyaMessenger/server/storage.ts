import { 
  users, type User, type InsertUser,
  botConfig, type BotConfig, type InsertBotConfig,
  commands, type Command, type InsertCommand,
  authorizedChannels, type AuthorizedChannel, type InsertAuthorizedChannel,
  knowledgeBase, type KnowledgeBase, type InsertKnowledgeBase,
  conversations, type Conversation, type InsertConversation
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bot config operations
  getBotConfig(): Promise<BotConfig>;
  updateBotConfig(config: Partial<BotConfig>): Promise<BotConfig>;
  
  // Commands operations
  getCommands(): Promise<Command[]>;
  getCommand(id: number): Promise<Command | undefined>;
  getCommandByName(name: string): Promise<Command | undefined>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(id: number, command: Partial<Command>): Promise<Command>;
  deleteCommand(id: number): Promise<boolean>;
  
  // Channel operations
  getAuthorizedChannels(): Promise<AuthorizedChannel[]>;
  addAuthorizedChannel(channel: InsertAuthorizedChannel): Promise<AuthorizedChannel>;
  removeAuthorizedChannel(id: number): Promise<boolean>;
  
  // Knowledge base operations
  getKnowledgeBaseEntries(): Promise<KnowledgeBase[]>;
  getKnowledgeBaseEntry(id: number): Promise<KnowledgeBase | undefined>;
  getKnowledgeBaseEntriesByTopic(topic: string): Promise<KnowledgeBase[]>;
  getKnowledgeBaseEntriesByCategory(category: string): Promise<KnowledgeBase[]>;
  searchKnowledgeBase(query: string): Promise<KnowledgeBase[]>;
  addKnowledgeBaseEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBaseEntry(id: number, entry: Partial<KnowledgeBase>): Promise<KnowledgeBase>;
  deleteKnowledgeBaseEntry(id: number): Promise<boolean>;
  
  // Conversation operations
  getConversations(): Promise<Conversation[]>;
  addConversation(conversation: InsertConversation): Promise<Conversation>;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Bot config methods
  async getBotConfig(): Promise<BotConfig> {
    // Try to get config
    const [config] = await db.select().from(botConfig);
    
    // If no config exists, create default one
    if (!config) {
      const defaultConfig = {
        name: "Ahmadiyya Helper",
        description: "A Discord bot that answers questions about Ahmadiyya beliefs, history, and teachings.",
        avatar: "",
        status: "online",
        activityType: "Playing",
        activityName: "Answering questions",
        commandPrefix: "!",
        useSlashCommands: true,
        respondToMentions: true,
        responseMode: "precise",
        responseTimeout: 15,
        maxResponseLength: "medium",
        includeCitations: true,
        respondToDirectMessages: true,
        useEmbeds: true,
        useAI: true,
      };
      
      const [createdConfig] = await db
        .insert(botConfig)
        .values(defaultConfig)
        .returning();
      
      return createdConfig;
    }
    
    return config;
  }

  async updateBotConfig(config: Partial<BotConfig>): Promise<BotConfig> {
    // Get current config
    const [currentConfig] = await db.select().from(botConfig);
    
    if (!currentConfig) {
      // If no config exists, create one with the provided values
      const [createdConfig] = await db
        .insert(botConfig)
        .values(config)
        .returning();
      
      return createdConfig;
    }
    
    // Update existing config
    const [updatedConfig] = await db
      .update(botConfig)
      .set(config)
      .where(eq(botConfig.id, currentConfig.id))
      .returning();
    
    return updatedConfig;
  }

  // Commands methods
  async getCommands(): Promise<Command[]> {
    const results = await db.select().from(commands);
    
    // If no commands exist, create default ones
    if (results.length === 0) {
      await this.initializeDefaultCommands();
      return db.select().from(commands);
    }
    
    return results;
  }

  async getCommand(id: number): Promise<Command | undefined> {
    const [command] = await db.select().from(commands).where(eq(commands.id, id));
    return command || undefined;
  }

  async getCommandByName(name: string): Promise<Command | undefined> {
    const [command] = await db.select().from(commands).where(eq(commands.name, name));
    return command || undefined;
  }

  async createCommand(command: InsertCommand): Promise<Command> {
    const [createdCommand] = await db
      .insert(commands)
      .values(command)
      .returning();
    
    return createdCommand;
  }

  async updateCommand(id: number, command: Partial<Command>): Promise<Command> {
    const [updatedCommand] = await db
      .update(commands)
      .set(command)
      .where(eq(commands.id, id))
      .returning();
    
    if (!updatedCommand) {
      throw new Error(`Command with id ${id} not found`);
    }
    
    return updatedCommand;
  }

  async deleteCommand(id: number): Promise<boolean> {
    const result = await db
      .delete(commands)
      .where(eq(commands.id, id))
      .returning({ id: commands.id });
    
    return result.length > 0;
  }

  // Channel methods
  async getAuthorizedChannels(): Promise<AuthorizedChannel[]> {
    const results = await db.select().from(authorizedChannels);
    
    // If no channels exist, create default ones
    if (results.length === 0) {
      await this.initializeDefaultChannels();
      return db.select().from(authorizedChannels);
    }
    
    return results;
  }

  async addAuthorizedChannel(channel: InsertAuthorizedChannel): Promise<AuthorizedChannel> {
    const [createdChannel] = await db
      .insert(authorizedChannels)
      .values(channel)
      .returning();
    
    return createdChannel;
  }

  async removeAuthorizedChannel(id: number): Promise<boolean> {
    const result = await db
      .delete(authorizedChannels)
      .where(eq(authorizedChannels.id, id))
      .returning({ id: authorizedChannels.id });
    
    return result.length > 0;
  }

  // Knowledge base methods
  async getKnowledgeBaseEntries(): Promise<KnowledgeBase[]> {
    const results = await db.select().from(knowledgeBase);
    
    // If no entries exist, create default ones
    if (results.length === 0) {
      await this.initializeDefaultKnowledgeBase();
      return db.select().from(knowledgeBase);
    }
    
    return results;
  }

  async getKnowledgeBaseEntry(id: number): Promise<KnowledgeBase | undefined> {
    const [entry] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return entry || undefined;
  }

  async getKnowledgeBaseEntriesByTopic(topic: string): Promise<KnowledgeBase[]> {
    // Search case insensitive by filtering after retrieval
    const entries = await db.select().from(knowledgeBase);
    return entries.filter(entry => 
      entry.topic.toLowerCase() === topic.toLowerCase()
    );
  }

  async getKnowledgeBaseEntriesByCategory(category: string): Promise<KnowledgeBase[]> {
    // Search case insensitive by filtering after retrieval
    const entries = await db.select().from(knowledgeBase);
    return entries.filter(entry => 
      entry.category.toLowerCase() === category.toLowerCase()
    );
  }

  async searchKnowledgeBase(query: string): Promise<KnowledgeBase[]> {
    // Get all entries and filter in memory for case-insensitive search
    const entries = await db.select().from(knowledgeBase);
    const lowerQuery = query.toLowerCase();
    
    return entries.filter(entry =>
      entry.topic.toLowerCase().includes(lowerQuery) ||
      entry.question.toLowerCase().includes(lowerQuery) ||
      entry.answer.toLowerCase().includes(lowerQuery) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  async addKnowledgeBaseEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [createdEntry] = await db
      .insert(knowledgeBase)
      .values(entry)
      .returning();
    
    return createdEntry;
  }

  async updateKnowledgeBaseEntry(id: number, entry: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    const [updatedEntry] = await db
      .update(knowledgeBase)
      .set(entry)
      .where(eq(knowledgeBase.id, id))
      .returning();
    
    if (!updatedEntry) {
      throw new Error(`Knowledge base entry with id ${id} not found`);
    }
    
    return updatedEntry;
  }

  async deleteKnowledgeBaseEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(knowledgeBase)
      .where(eq(knowledgeBase.id, id))
      .returning({ id: knowledgeBase.id });
    
    return result.length > 0;
  }

  // Conversation methods
  async getConversations(): Promise<Conversation[]> {
    return db.select().from(conversations);
  }

  async addConversation(conversation: InsertConversation): Promise<Conversation> {
    const [createdConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    
    return createdConversation;
  }

  // Helper methods to initialize default data
  private async initializeDefaultCommands() {
    const defaultCommands: InsertCommand[] = [
      {
        name: "ask",
        description: "Ask a question about Ahmadiyya",
        usage: "!ask [question]",
        enabled: true,
      },
      {
        name: "quote",
        description: "Get a random quote from Ahmadiyya texts",
        usage: "!quote [optional category]",
        enabled: true,
      },
      {
        name: "history",
        description: "Learn about Ahmadiyya history",
        usage: "!history [topic]",
        enabled: true,
      },
      {
        name: "beliefs",
        description: "Explain Ahmadiyya beliefs on a topic",
        usage: "!beliefs [topic]",
        enabled: true,
      },
      {
        name: "help",
        description: "Show available commands",
        usage: "!help",
        enabled: true,
      },
    ];

    // Use transaction to ensure all commands are created
    await db.transaction(async (tx) => {
      for (const command of defaultCommands) {
        await tx.insert(commands).values(command);
      }
    });
  }

  private async initializeDefaultChannels() {
    const defaultChannels: InsertAuthorizedChannel[] = [
      {
        channelId: "12345",
        channelName: "general",
      },
      {
        channelId: "67890",
        channelName: "ahmadiyya-discussion",
      },
      {
        channelId: "24680",
        channelName: "bot-commands",
      },
    ];

    // Use transaction to ensure all channels are created
    await db.transaction(async (tx) => {
      for (const channel of defaultChannels) {
        await tx.insert(authorizedChannels).values(channel);
      }
    });
  }

  private async initializeDefaultKnowledgeBase() {
    const defaultKnowledgeBase: InsertKnowledgeBase[] = [
      {
        topic: "Founder",
        category: "History",
        question: "Who was the founder of the Ahmadiyya Muslim Community?",
        answer: "The Ahmadiyya Muslim Community was founded by Mirza Ghulam Ahmad (1835-1908) in 1889 in Qadian, India. He claimed to be the promised Messiah and Mahdi awaited by Muslims, as well as the metaphorical second coming of Jesus Christ awaited by Christians and the manifestation of Krishna for Hindus.",
        source: "\"Invitation to Ahmadiyyat\" by Mirza Bashir-ud-Din Mahmud Ahmad, p.15-17",
        tags: ["founder", "Mirza Ghulam Ahmad", "Promised Messiah", "Mahdi", "history"],
      },
      {
        topic: "Khilafat",
        category: "Beliefs",
        question: "What is the Ahmadiyya belief about Khilafat?",
        answer: "In Ahmadiyya Islam, Khilafat refers to the spiritual institution of successorship that began after the death of Mirza Ghulam Ahmad in 1908. The Khalifa (successor) is believed to be divinely guided and serves as the spiritual and administrative head of the community. The community follows a system of elected Khilafat, where the successor is chosen by an electoral college. Currently, the fifth Khalifa, Mirza Masroor Ahmad, leads the community since 2003.",
        source: "\"The Institution of Khilafat\" published by The Review of Religions, 2008",
        tags: ["khilafat", "khalifa", "successorship", "leadership", "beliefs"],
      },
      {
        topic: "Jesus",
        category: "Beliefs",
        question: "What do Ahmadis believe about Jesus?",
        answer: "Ahmadiyya Muslims believe that Jesus (Isa) did not die on the cross but survived the crucifixion and migrated to Kashmir, India, where he continued his mission to the lost tribes of Israel and eventually died a natural death at an old age. They believe his tomb is located at the Roza Bal shrine in Srinagar, Kashmir. Ahmadis do not believe in Jesus's physical ascension to heaven but rather a spiritual one.",
        source: "\"Jesus in India\" by Mirza Ghulam Ahmad",
        tags: ["Jesus", "Isa", "crucifixion", "kashmir", "survival", "beliefs"],
      },
      {
        topic: "Finality of Prophethood",
        category: "Beliefs",
        question: "What is the Ahmadiyya view on the finality of prophethood?",
        answer: "Ahmadiyya Muslims believe that Muhammad is the Seal of the Prophets (Khatam an-Nabiyyin) and no new law-bearing prophet can come after him. However, they distinguish between law-bearing prophets and non-law-bearing prophets. They believe that non-law-bearing prophets can come as subordinates to Muhammad, reflecting his prophethood. They consider Mirza Ghulam Ahmad as a non-law-bearing prophet who came in complete submission to the Prophet Muhammad and his teachings.",
        source: "\"The Essence of Islam, Vol. IV\" by Mirza Ghulam Ahmad",
        tags: ["prophethood", "khatam", "Muhammad", "seal", "beliefs"],
      },
      {
        topic: "Jihad",
        category: "Beliefs",
        question: "What is the Ahmadiyya perspective on Jihad?",
        answer: "Ahmadiyya Muslims interpret Jihad primarily as a peaceful struggle for self-reformation and spreading Islam through argumentation and rational discourse, rather than through violence or military means. They emphasize 'Jihad of the Pen' over 'Jihad of the Sword,' believing that in the modern age, defending and promoting Islam should be done through writing, dialogue, and peaceful means rather than warfare. They categorically reject terrorism and violent extremism as having no place in Islamic teachings.",
        source: "\"The True Islamic Concept of Jihad\" by Mirza Tahir Ahmad",
        tags: ["jihad", "peace", "non-violence", "beliefs"],
      }
    ];

    // Use transaction to ensure all knowledge base entries are created
    await db.transaction(async (tx) => {
      for (const entry of defaultKnowledgeBase) {
        await tx.insert(knowledgeBase).values(entry);
      }
    });
  }
}

// Initialize and export an instance of the DatabaseStorage
export const storage = new DatabaseStorage();
