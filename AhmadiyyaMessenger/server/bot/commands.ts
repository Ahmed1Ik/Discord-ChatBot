import { Message } from "discord.js";
import { BotConfig } from "@shared/schema";
import { findRelevantKnowledge, getEntriesByTopic, getRandomEntry } from "./knowledge";
import { formatResponse, extractTopic } from "./nlp";
import { storage } from "../storage";

// Interface for command handlers
interface CommandHandler {
  execute: (message: Message, args: string[]) => Promise<any>; // Changed return type to any to resolve type issues
}

// Help command implementation
const helpCommand: CommandHandler = {
  async execute(message, args) {
    const commands = await storage.getCommands();
    const enabledCommands = commands.filter(cmd => cmd.enabled);
    
    const botConfig = await storage.getBotConfig();
    const prefix = botConfig.commandPrefix;
    
    let helpMessage = "**Available Commands:**\n\n";
    
    enabledCommands.forEach(cmd => {
      helpMessage += `**${prefix}${cmd.name}** - ${cmd.description}\n`;
      helpMessage += `Usage: ${cmd.usage}\n\n`;
    });
    
    helpMessage += "\nFor more detailed help, use the command: `!help [command name]`";
    
    // If a specific command was requested
    if (args.length > 0) {
      const requestedCmd = args[0].toLowerCase();
      const commandInfo = enabledCommands.find(cmd => cmd.name.toLowerCase() === requestedCmd);
      
      if (commandInfo) {
        helpMessage = `**Help for: ${prefix}${commandInfo.name}**\n\n`;
        helpMessage += `**Description:** ${commandInfo.description}\n`;
        helpMessage += `**Usage:** ${commandInfo.usage}\n`;
      }
    }
    
    message.reply(helpMessage);
  }
};

// Import AI functionality
import { getAIResponse } from "../ai";

// Ask command implementation
const askCommand: CommandHandler = {
  async execute(message, args) {
    if (args.length === 0) {
      await message.reply("Please ask a question. For example: `!ask Who founded the Ahmadiyya community?`");
      return;
    }
    
    const question = args.join(" ");
    const botConfig = await storage.getBotConfig();
    
    try {
      // Find relevant knowledge
      const knowledge = await findRelevantKnowledge(question);
      
      let response = "";
      
      if (knowledge) {
        // Use knowledge base response
        response = knowledge.answer;
        
        const formattedResponse = formatResponse(
          knowledge.answer, 
          knowledge.source ? knowledge.source : undefined, 
          botConfig.includeCitations
        );
        
        // Record the conversation
        await storage.addConversation({
          userId: message.author.id,
          username: message.author.username,
          channel: message.channel?.id || "direct_message",
          query: question,
          response: response
        });
        
        if (botConfig.useEmbeds) {
          await message.reply({ 
            embeds: [{
              title: knowledge.topic,
              description: knowledge.answer,
              color: 0x00b0f4,
              fields: botConfig.includeCitations && knowledge.source ? [
                { name: 'Source', value: knowledge.source }
              ] : [],
              footer: { text: 'Ahmadiyya Bot' }
            }]
          });
        } else {
          await message.reply(formattedResponse);
        }
      } else {
        // No knowledge found
        if (botConfig.useAI) {
          // Use AI if enabled
          try {
            // Get AI-generated response
            const aiResponse = await getAIResponse(question);
            response = aiResponse;
            
            // Record the conversation
            await storage.addConversation({
              userId: message.author.id,
              username: message.author.username,
              channel: message.channel?.id || "direct_message",
              query: question,
              response: response
            });
            
            if (botConfig.useEmbeds) {
              await message.reply({ 
                embeds: [{
                  title: "AI Response",
                  description: aiResponse,
                  color: 0x9b59b6, // Different color for AI responses
                  footer: { text: 'AI-Generated Response' }
                }]
              });
            } else {
              await message.reply(`${aiResponse}\n\n*This is an AI-generated response*`);
            }
          } catch (aiError) {
            console.error("Error getting AI response:", aiError);
            await message.reply("I'm sorry, I don't have information about that topic and my AI capabilities are currently unavailable.");
          }
        } else {
          // AI is disabled in config
          await message.reply("I don't have information about that topic in my knowledge base. AI responses are currently disabled.");
        }
      }
    } catch (error) {
      console.error("Error in ask command:", error);
      await message.reply("Sorry, there was an error processing your question. Please try again later.");
    }
  }
};

// Beliefs command implementation
const beliefsCommand: CommandHandler = {
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply("Please specify a belief topic. For example: `!beliefs khilafat`");
    }
    
    const topic = args.join(" ");
    const botConfig = await storage.getBotConfig();
    
    try {
      // Get entries related to the topic
      const entries = await getEntriesByTopic(topic);
      
      // Filter for beliefs category
      const beliefEntries = entries.filter(entry => 
        entry.category.toLowerCase() === "beliefs"
      );
      
      if (beliefEntries.length > 0) {
        const entry = beliefEntries[0]; // Take the first matching entry
        
        // Record the conversation
        await storage.addConversation({
          userId: message.author.id,
          username: message.author.username,
          channel: message.channel.id,
          query: `!beliefs ${topic}`,
          response: entry.answer
        });
        
        if (botConfig.useEmbeds) {
          message.reply({ 
            embeds: [{
              title: `Ahmadiyya Belief: ${entry.topic}`,
              description: entry.answer,
              color: 0x2D7D46,
              fields: botConfig.includeCitations && entry.source ? [
                { name: 'Source', value: entry.source }
              ] : [],
              footer: { text: 'Ahmadiyya Bot' }
            }]
          });
        } else {
          const formattedResponse = formatResponse(
            entry.answer, 
            entry.source, 
            botConfig.includeCitations
          );
          message.reply(formattedResponse);
        }
      } else {
        // Try to find a more general match if not in the beliefs category
        const knowledge = await findRelevantKnowledge(`beliefs about ${topic}`);
        
        if (knowledge) {
          // Record the conversation
          await storage.addConversation({
            userId: message.author.id,
            username: message.author.username,
            channel: message.channel.id,
            query: `!beliefs ${topic}`,
            response: knowledge.answer
          });
          
          if (botConfig.useEmbeds) {
            message.reply({ 
              embeds: [{
                title: `Related Information: ${knowledge.topic}`,
                description: knowledge.answer,
                color: 0x2D7D46,
                fields: botConfig.includeCitations && knowledge.source ? [
                  { name: 'Source', value: knowledge.source }
                ] : [],
                footer: { text: 'Ahmadiyya Bot' }
              }]
            });
          } else {
            const formattedResponse = formatResponse(
              knowledge.answer, 
              knowledge.source, 
              botConfig.includeCitations
            );
            message.reply(formattedResponse);
          }
        } else {
          message.reply(`I don't have specific information about Ahmadiyya beliefs on "${topic}".`);
        }
      }
    } catch (error) {
      console.error("Error in beliefs command:", error);
      message.reply("Sorry, there was an error processing your request. Please try again later.");
    }
  }
};

// History command implementation
const historyCommand: CommandHandler = {
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply("Please specify a history topic. For example: `!history founding`");
    }
    
    const topic = args.join(" ");
    const botConfig = await storage.getBotConfig();
    
    try {
      // Get entries related to the topic
      const entries = await getEntriesByTopic(topic);
      
      // Filter for history category
      const historyEntries = entries.filter(entry => 
        entry.category.toLowerCase() === "history"
      );
      
      if (historyEntries.length > 0) {
        const entry = historyEntries[0]; // Take the first matching entry
        
        // Record the conversation
        await storage.addConversation({
          userId: message.author.id,
          username: message.author.username,
          channel: message.channel.id,
          query: `!history ${topic}`,
          response: entry.answer
        });
        
        if (botConfig.useEmbeds) {
          message.reply({ 
            embeds: [{
              title: `Ahmadiyya History: ${entry.topic}`,
              description: entry.answer,
              color: 0x5865F2,
              fields: botConfig.includeCitations && entry.source ? [
                { name: 'Source', value: entry.source }
              ] : [],
              footer: { text: 'Ahmadiyya Bot' }
            }]
          });
        } else {
          const formattedResponse = formatResponse(
            entry.answer, 
            entry.source, 
            botConfig.includeCitations
          );
          message.reply(formattedResponse);
        }
      } else {
        // Try to find a more general match if not in the history category
        const knowledge = await findRelevantKnowledge(`history of ${topic}`);
        
        if (knowledge) {
          // Record the conversation
          await storage.addConversation({
            userId: message.author.id,
            username: message.author.username,
            channel: message.channel.id,
            query: `!history ${topic}`,
            response: knowledge.answer
          });
          
          if (botConfig.useEmbeds) {
            message.reply({ 
              embeds: [{
                title: `Related Information: ${knowledge.topic}`,
                description: knowledge.answer,
                color: 0x5865F2,
                fields: botConfig.includeCitations && knowledge.source ? [
                  { name: 'Source', value: knowledge.source }
                ] : [],
                footer: { text: 'Ahmadiyya Bot' }
              }]
            });
          } else {
            const formattedResponse = formatResponse(
              knowledge.answer, 
              knowledge.source, 
              botConfig.includeCitations
            );
            message.reply(formattedResponse);
          }
        } else {
          message.reply(`I don't have specific information about Ahmadiyya history on "${topic}".`);
        }
      }
    } catch (error) {
      console.error("Error in history command:", error);
      message.reply("Sorry, there was an error processing your request. Please try again later.");
    }
  }
};

// Quote command implementation
const quoteCommand: CommandHandler = {
  async execute(message, args) {
    const category = args.length > 0 ? args.join(" ") : undefined;
    const botConfig = await storage.getBotConfig();
    
    try {
      const entry = await getRandomEntry(category);
      
      if (entry) {
        // Record the conversation
        await storage.addConversation({
          userId: message.author.id,
          username: message.author.username,
          channel: message.channel.id,
          query: category ? `!quote ${category}` : "!quote",
          response: entry.answer
        });
        
        if (botConfig.useEmbeds) {
          message.reply({ 
            embeds: [{
              title: `${entry.topic}`,
              description: entry.answer,
              color: 0x00B0F4,
              fields: botConfig.includeCitations && entry.source ? [
                { name: 'Source', value: entry.source }
              ] : [],
              footer: { text: 'Ahmadiyya Bot' }
            }]
          });
        } else {
          const formattedResponse = formatResponse(
            entry.answer, 
            entry.source, 
            botConfig.includeCitations
          );
          message.reply(formattedResponse);
        }
      } else {
        if (category) {
          message.reply(`I don't have any quotes in the category "${category}".`);
        } else {
          message.reply("I don't have any quotes available at the moment.");
        }
      }
    } catch (error) {
      console.error("Error in quote command:", error);
      message.reply("Sorry, there was an error processing your request. Please try again later.");
    }
  }
};

// Handle direct message or mention
export async function handleDirectMessage(message: Message): Promise<void> {
  const botConfig = await storage.getBotConfig();
  
  // Check if direct messages are enabled
  if (!botConfig.respondToDirectMessages) {
    return;
  }
  
  const content = message.content.trim();
  
  // Extract potential topic from message
  const query = content;
  const knowledge = await findRelevantKnowledge(query);
  
  try {
    // Record the conversation
    await storage.addConversation({
      userId: message.author.id,
      username: message.author.username,
      channel: message.channel?.id || "direct_message", // Handle case where channel might be undefined
      query: query,
      response: knowledge ? knowledge.answer : "I'm sorry, I don't have information about that topic."
    });
    
    if (knowledge) {
      if (botConfig.useEmbeds) {
        message.reply({ 
          embeds: [{
            title: knowledge.topic,
            description: knowledge.answer,
            color: 0x00b0f4,
            fields: botConfig.includeCitations && knowledge.source ? [
              { name: 'Source', value: knowledge.source }
            ] : [],
            footer: { text: 'Ahmadiyya Bot' }
          }]
        });
      } else {
        const formattedResponse = formatResponse(
          knowledge.answer, 
          knowledge.source, 
          botConfig.includeCitations
        );
        message.reply(formattedResponse);
      }
    } else {
      // Always generate a response using AI
      const aiResponse = await getAIResponse(query);
      await message.reply(aiResponse);
    }
  } catch (error) {
    console.error("Error handling direct message:", error);
    try {
      // Try to respond even if we couldn't save to database
      message.reply("SubhanAllah, I seem to be having a technical difficulty. Please give me a moment to recollect my thoughts and try again.");
    } catch (replyError) {
      console.error("Error sending error reply:", replyError);
    }
  }
}

// Export command handlers
export const commands: Record<string, CommandHandler> = {
  help: helpCommand,
  ask: askCommand,
  beliefs: beliefsCommand,
  history: historyCommand,
  quote: quoteCommand,
};

// Parse and execute a command
export async function executeCommand(message: Message): Promise<boolean> {
  const botConfig = await storage.getBotConfig();
  const prefix = botConfig.commandPrefix;
  
  // Check if the message starts with the command prefix
  if (!message.content.startsWith(prefix)) {
    return false;
  }
  
  // Parse command and arguments
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  
  if (!commandName) return false;
  
  // Get command information from database
  const commandInfo = await storage.getCommandByName(commandName);
  
  // Check if command exists and is enabled
  if (!commandInfo || !commandInfo.enabled) {
    return false;
  }
  
  // Execute command if handler exists
  const commandHandler = commands[commandName];
  if (commandHandler) {
    try {
      await commandHandler.execute(message, args);
      return true;
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      message.reply("There was an error executing that command. Please try again later.");
      return true;
    }
  }
  
  return false;
}
