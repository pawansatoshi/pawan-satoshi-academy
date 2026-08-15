// bot/src/modules/verification/index.js
//
// Handles the #verify channel prompt and the "I Accept the Rules"
// button. On success: assigns the Verified role, which is what
// unlocks the rest of the server via the permission overwrites
// bootstrap-server.js configured on each category.

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getConfigValue, markMemberVerified } from "../../core/database.js";
import { assignVerifiedRole, hasRole } from "../roles/index.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("verification");

export const VERIFY_BUTTON_ID = "verify_accept_rules";

/**
 * Posts (or re-posts) the verification prompt in #verify. Idempotent
 * in intent — safe to call on every bot startup; it does not delete
 * prior messages (per the "never delete automatically" rule), so if
 * you don't want duplicates, only call this from the bootstrap script
 * or a manual admin command, not on every ready event.
 */
export async function postVerificationPrompt(channel) {
  const embed = new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle("Verify to Unlock the Academy")
    .setDescription(
      "Before you get full access, please confirm you've read and agree " +
      "to the community rules.\n\nClick the button below to verify."
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(VERIFY_BUTTON_ID)
      .setLabel("I Accept the Rules ✅")
      .setStyle(ButtonStyle.Success)
  );

  return channel.send({ embeds: [embed], components: [row] });
}

/**
 * Handles the button click. Call this from the interactionCreate
 * event handler when interaction.customId === VERIFY_BUTTON_ID.
 */
export async function handleVerifyButton(interaction) {
  const member = interaction.member;

  if (hasRole(member, "verified")) {
    await interaction.reply({ content: "You're already verified! 🎉", ephemeral: true });
    return;
  }

  const success = await assignVerifiedRole(member);

  if (!success) {
    await interaction.reply({
      content: "Something went wrong assigning your Verified role. Please contact a moderator.",
      ephemeral: true
    });
    return;
  }

  markMemberVerified(member.id);

  const academyChannelId = getConfigValue("channel.academy-hub");
  const academyMention = academyChannelId ? `<#${academyChannelId}>` : "#academy-hub";

  await interaction.reply({
    content:
      `You're verified! 🎉 The full server is now unlocked. ` +
      `Head to ${academyMention} to start with Orientation.`,
    ephemeral: true
  });

  logger.info({ memberId: member.id }, "Member completed verification");
}
