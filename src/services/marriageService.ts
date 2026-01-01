import prisma from '../database/prisma.js';
import { rateLimiter } from './rateLimiter.js';
import { channelManager } from './channelManager.js';
import { cleanupService } from './cleanupService.js';
import {
  Client,
  TextChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { translationService } from './translationService.js';

/**
 * Proposal interface
 */
export interface Proposal {
  id: number;
  proposer_id: string;
  proposed_id: string;
  guild_id: string;
  channel_id: string;
  proposed_accepted: number;
  status: string;
  created_at: string;
  button_expires_at: string;
}

/**
 * Marriage interface
 */
export interface Marriage {
  id: number;
  user1_id: string;
  user2_id: string;
  guild_id: string;
  channel_id: string;
  married_at: string;
}

/**
 * Marriage Service
 * Core business logic for marriage proposals, marriages, and divorces
 */
class MarriageService {
  private client: Client | null = null;

  /**
   * Set the Discord client (required for DM sending and announcements)
   */
  public setClient(client: Client): void {
    this.client = client;
  }

  /**
   * Check if user can make a proposal (rate limit check)
   * @param userId User ID
   * @param guildId Guild ID
   * @returns true if user can propose, false if rate limited
   */
  public async checkRateLimit(
    userId: string,
    guildId: string
  ): Promise<boolean> {
    return await rateLimiter.checkRateLimit(userId, guildId);
  }

  /**
   * Create a new marriage proposal
   * @param proposerId Proposer user ID
   * @param proposedId Proposed user ID
   * @param guildId Guild ID
   * @param channelId Channel ID where command was executed
   * @returns Created proposal
   * @throws Error if proposal cannot be created
   */
  public async createProposal(
    proposerId: string,
    proposedId: string,
    guildId: string,
    channelId: string
  ): Promise<Proposal> {
    // Validate: not proposing to self
    if (proposerId === proposedId) {
      throw new Error(translationService.t('commands.kethon.cannotProposeToSelf'));
    }

    // Validate: check if proposer is already married
    const proposerMarriage = await this.getMarriage(proposerId, guildId);
    if (proposerMarriage) {
      throw new Error(translationService.t('errors.alreadyMarried'));
    }

    // Validate: check if proposed user is already married
    const proposedMarriage = await this.getMarriage(proposedId, guildId);
    if (proposedMarriage) {
      throw new Error(translationService.t('errors.userAlreadyMarried'));
    }

    // Validate: check for existing pending proposal
    const existingProposal = await this.getPendingProposal(
      proposerId,
      proposedId,
      guildId
    );
    if (existingProposal) {
      throw new Error(translationService.t('errors.proposalExists'));
    }

    // Check rate limit
    if (!(await this.checkRateLimit(proposerId, guildId))) {
      const minutesUntilAllowed =
        await rateLimiter.getTimeUntilNextProposal(proposerId, guildId);
      throw new Error(
        translationService.t('errors.rateLimit', { minutes: minutesUntilAllowed })
      );
    }

    // Calculate button expiration (15 minutes from now)
    const buttonExpiresAt = new Date();
    buttonExpiresAt.setMinutes(buttonExpiresAt.getMinutes() + 15);

    // Create proposal record
    const createdProposal = await prisma.proposal.create({
      data: {
        proposerId,
        proposedId,
        guildId,
        channelId,
        proposedAccepted: 0,
        status: 'pending',
        buttonExpiresAt: buttonExpiresAt,
      },
    });

    // Update rate limit
    await rateLimiter.updateRateLimit(proposerId, guildId);

    // Map Prisma type to Proposal interface
    return this.mapProposalToInterface(createdProposal);
  }

  /**
   * Get proposal by ID
   */
  private async getProposalById(proposalId: number): Promise<Proposal | null> {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });
    return proposal ? this.mapProposalToInterface(proposal) : null;
  }

  /**
   * Get pending proposal between two users
   */
  private async getPendingProposal(
    proposerId: string,
    proposedId: string,
    guildId: string
  ): Promise<Proposal | null> {
    const proposal = await prisma.proposal.findFirst({
      where: {
        proposerId,
        proposedId,
        guildId,
        status: 'pending',
      },
    });
    return proposal ? this.mapProposalToInterface(proposal) : null;
  }

  /**
   * Check if button has expired
   * @param proposalId Proposal ID
   * @returns true if expired, false if still valid
   */
  public async checkButtonExpiration(proposalId: number): Promise<boolean> {
    const proposal = await this.getProposalById(proposalId);
    if (!proposal) {
      return true; // Proposal doesn't exist, consider expired
    }

    const expiresAt = new Date(proposal.button_expires_at).getTime();
    return Date.now() > expiresAt;
  }

  /**
   * Handle proposal response (accept or decline)
   * @param proposalId Proposal ID
   * @param userId User ID responding
   * @param accepted true if accepted, false if declined
   * @throws Error if proposal not found, expired, or invalid user
   */
  public async handleProposalResponse(
    proposalId: number,
    userId: string,
    accepted: boolean
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Discord client not set');
    }

    const proposal = await this.getProposalById(proposalId);
    if (!proposal) {
      throw new Error(translationService.t('errors.proposalNotFound'));
    }

    // Validate: only proposed user can respond
    if (userId !== proposal.proposed_id) {
      throw new Error(translationService.t('errors.notAuthorized'));
    }

    // Check if proposal is still pending
    if (proposal.status !== 'pending') {
      throw new Error(translationService.t('errors.proposalNotPending'));
    }

    // Check button expiration
    if (await this.checkButtonExpiration(proposalId)) {
      // Mark as expired
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'expired' },
      });
      throw new Error(translationService.t('errors.proposalExpired'));
    }

    if (accepted) {
      // Create marriage (this handles announcement and DMs)
      await this.createMarriage(
        proposal.proposer_id,
        proposal.proposed_id,
        proposal.guild_id,
        proposal.channel_id
      );

      // Delete proposal (marriage already created in createMarriage)
      await prisma.proposal.delete({
        where: { id: proposalId },
      });
    } else {
      // Update proposal status to declined
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'declined' },
      });

      // Send anonymous rejection messages to both users
      await this.sendRejectionMessages(proposal);

      // Delete proposal
      await prisma.proposal.delete({
        where: { id: proposalId },
      });
    }
  }

  /**
   * Send rejection messages to both users (anonymous)
   */
  private async sendRejectionMessages(proposal: Proposal): Promise<void> {
    if (!this.client) {
      return;
    }

    const rejectionMessage = translationService.t('marriage.rejection.message');

    try {
      const proposer = await this.client.users.fetch(proposal.proposer_id);
      await proposer.send(rejectionMessage);
    } catch (error) {
      console.error(
        `Failed to send rejection DM to proposer ${proposal.proposer_id}:`,
        error
      );
    }

    try {
      const proposed = await this.client.users.fetch(proposal.proposed_id);
      await proposed.send(rejectionMessage);
    } catch (error) {
      console.error(
        `Failed to send rejection DM to proposed user ${proposal.proposed_id}:`,
        error
      );
    }
  }

  /**
   * Get marriage for a user
   * @param userId User ID
   * @param guildId Guild ID
   * @returns Marriage or null if not married
   */
  public async getMarriage(
    userId: string,
    guildId: string
  ): Promise<Marriage | null> {
    const marriage = await prisma.marriage.findFirst({
      where: {
        guildId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
    return marriage ? this.mapMarriageToInterface(marriage) : null;
  }

  /**
   * Create a marriage
   * @param user1Id First user ID
   * @param user2Id Second user ID
   * @param guildId Guild ID
   * @param channelId Channel ID where proposal was made
   * @returns Created marriage
   * @throws Error if marriage cannot be created
   */
  public async createMarriage(
    user1Id: string,
    user2Id: string,
    guildId: string,
    channelId: string
  ): Promise<Marriage> {
    if (!this.client) {
      throw new Error(translationService.t('errors.clientNotSet'));
    }

    try {
      // Create marriage record
      const createdMarriage = await prisma.marriage.create({
        data: {
          user1Id,
          user2Id,
          guildId,
          channelId,
        },
      });

      // Map Prisma type to Marriage interface
      const marriage = this.mapMarriageToInterface(createdMarriage);

      // Get notification channel
      const notificationChannelId =
        await channelManager.getOrCreateNotificationChannel(guildId);

      // Send announcement
      await this.sendMarriageAnnouncement(
        user1Id,
        user2Id,
        notificationChannelId
      );

      // Send confirmation DMs
      await this.sendMarriageConfirmations(user1Id, user2Id);

      return marriage;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      throw new Error(translationService.t('errors.failedToCreateMarriage', { error: errorMessage }));
    }
  }

  /**
   * Send marriage announcement to notification channel
   */
  private async sendMarriageAnnouncement(
    user1Id: string,
    user2Id: string,
    channelId: string
  ): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const channel = (await this.client.channels.fetch(
        channelId
      )) as TextChannel;
      if (!channel) {
        throw new Error(translationService.t('errors.notificationChannelNotFound'));
      }

      const user1 = await this.client.users.fetch(user1Id);
      const user2 = await this.client.users.fetch(user2Id);

      const embed = new EmbedBuilder()
        .setTitle(translationService.t('marriage.announcement.title'))
        .setDescription(
          translationService.t('marriage.announcement.description', {
            user1: user1.toString(),
            user2: user2.toString(),
          })
        )
        .setColor(0xff69b4) // Pink color
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send marriage announcement:', error);
      throw error;
    }
  }

  /**
   * Send confirmation DMs to both users
   */
  private async sendMarriageConfirmations(
    user1Id: string,
    user2Id: string
  ): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const user1 = await this.client.users.fetch(user1Id);
      const user2 = await this.client.users.fetch(user2Id);

      const message1 = translationService.t('marriage.confirmation.message', { partner: user2.toString() });
      const message2 = translationService.t('marriage.confirmation.message', { partner: user1.toString() });

      await user1.send(message1);
      await user2.send(message2);
    } catch (error) {
      console.error('Failed to send marriage confirmation DMs:', error);
      // Don't throw - marriage is already created
    }
  }

  /**
   * Divorce (end marriage)
   * @param userId User ID requesting divorce
   * @param guildId Guild ID
   * @param mutual Optional: if true, requires mutual consent
   * @throws Error if user is not married
   */
  public async divorce(
    userId: string,
    guildId: string,
    mutual: boolean = false
  ): Promise<void> {
    if (!this.client) {
      throw new Error(translationService.t('errors.clientNotSet'));
    }

    const marriage = await this.getMarriage(userId, guildId);
    if (!marriage) {
      throw new Error(translationService.t('errors.notCurrentlyMarried'));
    }

    // Get partner ID
    const partnerId =
      marriage.user1_id === userId
        ? marriage.user2_id
        : marriage.user1_id;

    if (mutual) {
      // Mutual consent: send DM to partner for confirmation
      // For now, implement as unilateral (mutual consent can be added later)
      // This is a simplified implementation
    }

    // Remove marriage from database
    await prisma.marriage.delete({
      where: { id: marriage.id },
    });

    // Send confirmation DMs (no announcement)
    try {
      const user = await this.client.users.fetch(userId);
      const partner = await this.client.users.fetch(partnerId);

      const message = translationService.t('marriage.divorce.message');

      await user.send(message);
      await partner.send(message);
    } catch (error) {
      console.error('Failed to send divorce confirmation DMs:', error);
      // Don't throw - divorce is already processed
    }
  }

  /**
   * Clean up expired proposals
   * @returns Number of proposals cleaned up
   */
  public async cleanupExpiredProposals(): Promise<number> {
    // This delegates to cleanup service
    // But we also mark expired proposals here
    await cleanupService.markExpiredProposals();
    return await cleanupService.cleanupExpiredProposals();
  }

  /**
   * Map Prisma Proposal to Proposal interface
   */
  private mapProposalToInterface(proposal: {
    id: number;
    proposerId: string;
    proposedId: string;
    guildId: string;
    channelId: string;
    proposedAccepted: number;
    status: string;
    createdAt: Date;
    buttonExpiresAt: Date;
  }): Proposal {
    return {
      id: proposal.id,
      proposer_id: proposal.proposerId,
      proposed_id: proposal.proposedId,
      guild_id: proposal.guildId,
      channel_id: proposal.channelId,
      proposed_accepted: proposal.proposedAccepted,
      status: proposal.status,
      created_at: proposal.createdAt.toISOString(),
      button_expires_at: proposal.buttonExpiresAt.toISOString(),
    };
  }

  /**
   * Map Prisma Marriage to Marriage interface
   */
  private mapMarriageToInterface(marriage: {
    id: number;
    user1Id: string;
    user2Id: string;
    guildId: string;
    channelId: string;
    marriedAt: Date;
  }): Marriage {
    return {
      id: marriage.id,
      user1_id: marriage.user1Id,
      user2_id: marriage.user2Id,
      guild_id: marriage.guildId,
      channel_id: marriage.channelId,
      married_at: marriage.marriedAt.toISOString(),
    };
  }

  /**
   * Create proposal button components
   * @param proposalId Proposal ID
   * @returns Action row with accept/decline buttons
   */
  public createProposalButtons(proposalId: number): ActionRowBuilder<ButtonBuilder> {
    const acceptButton = new ButtonBuilder()
      .setCustomId(`proposal_accept_${proposalId}`)
      .setLabel(translationService.t('marriage.buttons.accept'))
      .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
      .setCustomId(`proposal_decline_${proposalId}`)
      .setLabel(translationService.t('marriage.buttons.decline'))
      .setStyle(ButtonStyle.Danger);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      acceptButton,
      declineButton
    );
  }
}

// Export singleton instance
export const marriageService = new MarriageService();

