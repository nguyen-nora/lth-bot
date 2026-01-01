import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { marriageService } from '../services/marriageService.js';
import prisma from '../database/prisma.js';
import { translationService } from '../services/translationService.js';

/**
 * Kethon command - Propose marriage to another user
 */
export default {
  data: new SlashCommandBuilder()
    .setName('kethon')
    .setDescription(translationService.t('commands.kethon.description'))
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(translationService.t('commands.kethon.optionUser'))
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const proposer = interaction.user;
    const proposed = interaction.options.getUser('user', true);
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: translationService.t('common.serverOnly'),
        ephemeral: true,
      });
      return;
    }

    // Validate: not proposing to self
    if (proposer.id === proposed.id) {
      await interaction.reply({
        content: translationService.t('commands.kethon.cannotProposeToSelf'),
        ephemeral: true,
      });
      return;
    }

    // Validate: not proposing to bot
    if (proposed.bot) {
      await interaction.reply({
        content: translationService.t('commands.kethon.cannotProposeToBot'),
        ephemeral: true,
      });
      return;
    }

    try {
      // Defer reply immediately to prevent interaction timeout
      await interaction.deferReply({ ephemeral: true });

      // Create proposal (rate limit check is handled inside createProposal)
      const proposal = await marriageService.createProposal(
        proposer.id,
        proposed.id,
        guild.id,
        interaction.channelId
      );

      // Send confirmation DM to proposer
      try {
        const proposerEmbed = new EmbedBuilder()
          .setTitle(translationService.t('marriage.proposal.sent'))
          .setDescription(
            translationService.t('marriage.proposal.sentDescription', { user: proposed.toString() })
          )
          .setColor(0xff69b4)
          .setTimestamp();

        await proposer.send({ embeds: [proposerEmbed] });
      } catch (error) {
        console.error(
          `Failed to send confirmation DM to proposer ${proposer.id}:`,
          error
        );
        // Continue even if DM fails
      }

      // Send proposal DM to proposed user with buttons
      try {
        const proposalEmbed = new EmbedBuilder()
          .setTitle(translationService.t('marriage.proposal.title'))
          .setDescription(translationService.t('marriage.proposal.description', { proposer: proposer.toString() }))
          .setColor(0xff69b4)
          .addFields({
            name: translationService.t('marriage.proposal.server'),
            value: guild.name,
            inline: true,
          })
          .setTimestamp()
          .setFooter({
            text: translationService.t('marriage.proposal.expiresIn'),
          });

        const buttons = marriageService.createProposalButtons(proposal.id);

        await proposed.send({
          embeds: [proposalEmbed],
          components: [buttons],
        });

        // Edit deferred reply
        await interaction.editReply({
          content: translationService.t('commands.kethon.proposalSent', { user: proposed.toString() }),
        });
      } catch (error) {
        // DM failed - likely user has DMs disabled
        console.error(
          `Failed to send proposal DM to ${proposed.id}:`,
          error
        );

        // Delete proposal since DM failed
        await prisma.proposal.delete({
          where: { id: proposal.id },
        });

        // Edit deferred reply with error
        await interaction.editReply({
          content: translationService.t('commands.kethon.dmFailed'),
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      
      // Check if this is a validation error (expected) or an actual error
      // Check for both English and Vietnamese error messages
      const isValidationError = 
        errorMessage.includes('already married') ||
        errorMessage.includes('đã kết hôn') ||
        errorMessage.includes('cannot propose') ||
        errorMessage.includes('không thể cầu hôn') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('mỗi giờ') ||
        errorMessage.includes('cannot propose to yourself') ||
        errorMessage.includes('không thể cầu hôn chính mình') ||
        errorMessage.includes('cannot propose to a bot') ||
        errorMessage.includes('không thể cầu hôn bot') ||
        errorMessage.includes('proposal already exists') ||
        errorMessage.includes('đã tồn tại lời cầu hôn');

      if (isValidationError) {
        // Validation errors are expected - log as info, not error
        console.log(`ℹ️  Validation in kethon command: ${errorMessage}`);
      } else {
        // Actual errors - log as error
        console.error('❌ Error in kethon command:', error);
      }

      // Try to translate error message, fallback to original if not found
      // Error messages from services are already translated, so use as-is
      const translatedError = errorMessage;

      // Try to edit if already deferred, otherwise reply
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: translatedError,
        });
      } else {
        await interaction.reply({
          content: translatedError,
          ephemeral: true,
        });
      }
    }
  },
};

