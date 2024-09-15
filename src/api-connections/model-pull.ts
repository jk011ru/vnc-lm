import { Message, EmbedBuilder, TextChannel, DMChannel, NewsChannel, ThreadChannel, ChannelType } from 'discord.js';
import { pullOllamaModel } from './api-requests';
import { refreshModelLibrary } from '../bot';
import { adminUserId } from '../utils';

export async function handleModelPull(message: Message, modelTag: string) {
  // Check if the user has permission to pull models
  if (!adminUserId || message.author.id !== adminUserId) {
    await message.reply(adminUserId ? 'You do not have permission to pull models.' : 'Admin user ID is not set. Model pulling is disabled.');
    return;
  }

  // Create and send an initial embed message
  const embed = new EmbedBuilder().setFooter({ text: `pulling ${modelTag}` });
  const reply = await message.reply({ embeds: [embed] });

  try {
    // Start pulling the Ollama model
    const stream = await pullOllamaModel(modelTag);
    let statusHistory: string[] = [];
    let lastStatus = '';
    let lastProgress = '';

    // Process the stream of status updates
    for await (const chunk of stream) {
      const jsonObjects = chunk.toString().split('\n').filter((str: string) => str.trim());

      for (const jsonStr of jsonObjects) {
        try {
          const status = JSON.parse(jsonStr);
          if (status.status && status.status !== lastStatus) {
            lastStatus = status.status;
            let statusLine = status.status;

            // Handle download progress updates
            if (status.status === 'downloading' && status.completed && status.total) {
              const progressStr = `(${(status.completed / status.total * 100).toFixed(2)}%)`;
              if (progressStr !== lastProgress) {
                lastProgress = progressStr;
                statusLine += ` ${progressStr}`;
              } else {
                continue;
              }
            }

            // Update status history and embed
            statusHistory.push(statusLine);
            statusHistory = statusHistory.slice(-10); // Keep only the last 10 status updates

            updateEmbed(embed, statusHistory, modelTag);
            await reply.edit({ embeds: [embed] });

            // If the pull is successful, update the model library
            if (status.status === 'success') {
              updateEmbed(embed, statusHistory, modelTag, true);
              await reply.edit({ embeds: [embed] });
              await refreshModelLibrary();
              break;
            }
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
        }
      }
    }
  } catch (error) {
    // Handle errors during the model pull process
    console.error('Error pulling model:', error);
    updateEmbed(embed, ['An error occurred while pulling the model.'], modelTag, false, true);
    await reply.edit({ embeds: [embed] });
    await sendMessageSafely(message.channel, "Failed to update the model library. Please try again later.");
  }
}

function updateEmbed(embed: EmbedBuilder, statusHistory: string[], modelTag: string, success = false, error = false) {
  // Update the embed with the latest status history
  const description = "```console\n" + statusHistory.join('\n') + "\n```";
  embed.setDescription(description);
  
  // Update the embed footer based on the pull status
  if (success) {
    embed.setFooter({ text: `${modelTag} pulled successfully` });
  } else if (error) {
    embed.setFooter({ text: `Failed to pull ${modelTag}` });
  } else {
    // Show a spinning animation in the footer while pulling
    const spinnerEmojis = ['+', 'x', '*'];
    const emojiIndex = Math.floor(Date.now() / 500) % spinnerEmojis.length;
    embed.setFooter({ text: `pulling ${modelTag} ${spinnerEmojis[emojiIndex]}` });
  }
}

async function sendMessageSafely(channel: Message['channel'], content: string) {
  // Check if the channel type supports sending messages
  if ([ChannelType.DM, ChannelType.GuildText, ChannelType.GuildNews, ChannelType.PublicThread, ChannelType.PrivateThread].includes(channel.type)) {
    try {
      await (channel as TextChannel | DMChannel | NewsChannel | ThreadChannel).send(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  } else {
    console.error('Channel is not a type that can send messages');
  }
}