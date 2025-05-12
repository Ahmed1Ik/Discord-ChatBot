import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActivityType,
  Events,
  Message
} from "discord.js";
import { executeCommand, handleDirectMessage } from "./commands";
import { storage } from "../storage";

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel], // Needed for DM support
});

// Initialize bot with configuration
export async function initializeBot(token: string): Promise<Client> {
  if (!token) {
    console.error("No Discord bot token provided. Bot will not start.");
    throw new Error("Missing Discord bot token");
  }

  // Set up event handlers
  client.once(Events.ClientReady, async () => {
    console.log(`Bot logged in as ${client.user?.tag}`);

    try {
      // Load bot configuration
      const botConfig = await storage.getBotConfig();

      // Set bot status and activity
      updateBotPresence(botConfig.status, botConfig.activityType, botConfig.activityName);

      console.log("Bot configuration loaded successfully");
    } catch (error) {
      console.error("Error loading bot configuration:", error);
    }
  });

  // Handle messages
  client.on(Events.MessageCreate, async (message: Message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    try {
      const botConfig = await storage.getBotConfig();

      // Check if this is a direct message
      const isDM = message.channel.type === 1; // DM Channel type

      // Check if this is a mention
      const isMention = message.mentions.users.has(client.user!.id);

      // Handle DMs if enabled
      if (isDM && botConfig.respondToDirectMessages) {
        return handleDirectMessage(message);
      }

      // Handle mentions if enabled
      if (isMention && botConfig.respondToMentions) {
        // Remove the mention part from the message
        const mentionRegex = new RegExp(`<@!?${client.user!.id}>`, 'g');
        const cleanContent = message.content.replace(mentionRegex, '').trim();

        // Create a modified message object with the clean content
        const modifiedMessage = { ...message, content: cleanContent };
        return handleDirectMessage(modifiedMessage as Message);
      }

      // Get authorized channels
      const authorizedChannels = await storage.getAuthorizedChannels();
      const channelIds = authorizedChannels.map(ch => ch.channelId);

      // Respond to all messages in authorized channels
      if (isDM || channelIds.includes(message.channel.id)) {
        await handleDirectMessage(message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Login to Discord
  await client.login(token);
  return client;
}

// Update bot presence (status and activity)
export async function updateBotPresence(
  status: string = "online", 
  activityType: string = "Playing", 
  activityName: string = "Answering questions"
): Promise<void> {
  if (!client.user) return;

  // Set status
  switch (status.toLowerCase()) {
    case "idle":
      client.user.setStatus("idle");
      break;
    case "dnd":
    case "do not disturb":
      client.user.setStatus("dnd");
      break;
    case "invisible":
      client.user.setStatus("invisible");
      break;
    default:
      client.user.setStatus("online");
  }

  // Set activity
  let activity: ActivityType;
  switch (activityType.toLowerCase()) {
    case "listening":
      activity = ActivityType.Listening;
      break;
    case "watching":
      activity = ActivityType.Watching;
      break;
    case "competing":
      activity = ActivityType.Competing;
      break;
    case "streaming":
      activity = ActivityType.Streaming;
      break;
    case "custom":
      activity = ActivityType.Custom;
      break;
    default:
      activity = ActivityType.Playing;
  }

  client.user.setActivity(activityName, { type: activity });
}

// Function to shut down the bot
export async function shutdownBot(): Promise<void> {
  if (client.isReady()) {
    await client.destroy();
    console.log("Bot has been shut down");
  }
}

// Export the client instance
export { client };