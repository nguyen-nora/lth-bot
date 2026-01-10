import {
  Interaction,
  ChatInputCommandInteraction,
  ButtonInteraction,
} from 'discord.js';
import { Command } from '../utils/loadCommands.js';
import { marriageService } from '../services/marriageService.js';
import { permissionService, PermissionTier } from '../services/permissionService.js';
import { translationService } from '../services/translationService.js';

/**
 * Interaction create event handler
 * Routes slash command interactions and button interactions to appropriate handlers
 */
export default {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    // Handle button interactions (for proposal accept/decline)
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
      return;
    }

    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
      return;
    }
  },
};

/**
 * Command permission mapping
 * Maps command names to their required permission tiers
 * 
 * Permission tiers:
 * - SUPER_ADMIN: Highest tier, can execute all commands (configured in .env)
 * - ADMIN: Requires Administrator permission in Discord, can execute ADMIN and USER commands
 * - USER: Default tier, all users can execute USER commands
 * - NONE: No permissions (used for error cases)
 * 
 * Command categorization:
 * - ADMIN commands: Administrative functions (attendance, checking records, ping)
 * - USER commands: General user functions (marriage, status)
 */
const COMMAND_PERMISSIONS: Record<string, PermissionTier> = {
  // ADMIN tier commands (require Administrator permission)
  diemdanh: PermissionTier.ADMIN, // Take attendance
  checkdd: PermissionTier.ADMIN,  // Check attendance records
  ping: PermissionTier.ADMIN,     // Test bot responsiveness
  
  // USER tier commands (default, all users can access)
  kethon: PermissionTier.USER,     // Propose marriage
  lyhon: PermissionTier.USER,      // Divorce
  status: PermissionTier.USER,    // Check user status
  help: PermissionTier.USER,      // Help command
};

/**
 * Handle slash command interactions
 */
async function handleSlashCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const command = interaction.client.commands.get(
    interaction.commandName
  ) as Command | undefined;

  if (!command) {
    console.error(
      `❌ No command matching ${interaction.commandName} was found.`
    );
    return;
  }

  // Check permission before executing command
  // Default to USER tier if command not in mapping (fail-safe)
  const requiredTier = COMMAND_PERMISSIONS[interaction.commandName] || PermissionTier.USER;
  
  try {
    const hasPermission = await permissionService.hasPermission(
      interaction.user.id,
      interaction.guild,
      requiredTier
    );

    if (!hasPermission) {
      // User doesn't have required permission
      // Provide user-friendly error message (don't expose internal tier names)
      let errorMessage = translationService.t('errors.permissionDenied');
      
      // Special message for DM context (only SUPER_ADMIN can use commands in DMs)
      if (!interaction.guild) {
        errorMessage = translationService.t('common.serverOnly');
      }
      
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: errorMessage,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: errorMessage,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error('Error sending permission denied message:', error);
      }
      
      // Log permission denial for auditing (include user ID, command, required tier)
      console.log(
        `Permission denied: User ${interaction.user.id} (${interaction.user.tag}) ` +
        `attempted to use command ${interaction.commandName} (required: ${requiredTier}) ` +
        `in guild ${interaction.guild?.id || 'DM'}`
      );
      return;
    }
  } catch (error) {
    // Handle permission check errors (e.g., Discord API failures)
    console.error(
      `Error checking permission for command ${interaction.commandName}:`,
      error
    );
    
    // Deny access on error (fail-safe: better to deny than allow unauthorized access)
    try {
      const errorMessage = translationService.t('errors.permissionCheckError');
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: errorMessage,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: errorMessage,
          ephemeral: true,
        });
      }
    } catch (replyError) {
      console.error('Error sending permission check error message:', replyError);
    }
    return;
  }

  // Permission check passed, execute command
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `❌ Error executing command ${interaction.commandName}:`,
      error
    );

    // Only try to respond if the interaction hasn't been handled yet
    // Commands should handle their own errors, this is a fallback
    try {
      const errorMessage = translationService.t('errors.commandExecutionError');

      if (interaction.replied) {
        // Already replied, don't send another message
        // The command already handled the error
        return;
      } else if (interaction.deferred) {
        // Deferred but not replied - use editReply
        await interaction.editReply({
          content: errorMessage,
        });
      } else {
        // Not replied or deferred - use reply
        await interaction.reply({
          content: errorMessage,
          ephemeral: true,
        });
      }
    } catch (replyError) {
      // Silently ignore reply errors - the interaction may have timed out
      // or already been handled by the command
      console.error('Failed to send error response:', replyError);
    }
  }
}

/**
 * Handle button interactions (proposal accept/decline)
 */
async function handleButtonInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const customId = interaction.customId;

  // Check if this is a proposal button
  if (
    !customId.startsWith('proposal_accept_') &&
    !customId.startsWith('proposal_decline_')
  ) {
    // Not a proposal button, ignore
    return;
  }

  // Parse proposal ID from custom ID
  const parts = customId.split('_');
  if (parts.length !== 3) {
    await interaction.reply({
      content: translationService.t('errors.invalidButtonInteraction'),
      ephemeral: true,
    });
    return;
  }

  const action = parts[1]; // 'accept' or 'decline'
  const proposalId = parseInt(parts[2], 10);

  if (isNaN(proposalId)) {
    await interaction.reply({
      content: translationService.t('errors.invalidProposalId'),
      ephemeral: true,
    });
    return;
  }

  try {
    // Handle proposal response (expiration check is handled inside)
    const accepted = action === 'accept';
    await marriageService.handleProposalResponse(
      proposalId,
      interaction.user.id,
      accepted
    );

    // Update button message
    if (accepted) {
      await interaction.update({
        content: translationService.t('marriage.buttonResponse.accepted'),
        components: [],
        embeds: [],
      });
    } else {
      await interaction.update({
        content: translationService.t('marriage.buttonResponse.declined'),
        components: [],
        embeds: [],
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : translationService.t('common.unknownError');
    console.error('Error handling proposal button:', error);

    // Try to reply
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errorMessage,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  }
}

