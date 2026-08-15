// bot/src/modules/welcome/index.js
//
// Posts a welcome message when a new member joins. Kept deliberately
// short and low-pressure (per doc 10: "never overwhelm new members") —
// it points to exactly one next step: #verify.

import { EmbedBuilder } from "discord.js";
import { getConfigValue } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("welcome");

export async function sendWelcome(member) {
  const welcomeChannelId = getConfigValue("channel.welcome");
  if (!welcomeChannelId) {
    logger.warn("channel.welcome is not set in config — run bootstrap-server.js first.");
    return;
  }

  const channel = await member.guild.channels.fetch(welcomeChannelId).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    logger.warn({ welcomeChannelId }, "Welcome channel could not be resolved");
    return;
  }

  const verifyChannelId = getConfigValue("channel.verify");
  const verifyMention = verifyChannelId ? `<#${verifyChannelId}>` : "#verify";

  const embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle("Welcome to Pawan Satoshi Academy! 🎓")
    .setDescription(
      `Hey ${member}, glad you're here.\n\n` +
      `This is a completely free learning community — digital literacy, ` +
      `cyber security, AI, programming, and Web3, from absolute beginner ` +
      `to graduation.\n\n` +
      `**Your next step:** head to ${verifyMention} and accept the rules ` +
      `to unlock the rest of the server.`
    )
    .setFooter({ text: "One step at a time — you've got this." })
    .setTimestamp();

  try {
    await channel.send({ content: `${member}`, embeds: [embed] });
    logger.info({ memberId: member.id }, "Sent welcome message");
  } catch (err) {
    logger.error({ err, memberId: member.id }, "Failed to send welcome message");
  }
}
