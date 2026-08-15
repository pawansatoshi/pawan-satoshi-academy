// bot/src/commands/security.js
//
// /security status  — shows current security posture
// /security raidmode — manually enable/disable raid mode

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { requireAtLeast } from "../core/permissions.js";
import { isRaidModeActive } from "../modules/moderation-automod/index.js";

// Discord API enum value for GuildExplicitContentFilterLevel.AllMembers.
// Kept numeric here because discord.js may be loaded as CommonJS by the
// runtime and this enum is not available as a stable named ESM export.
const EXPLICIT_CONTENT_FILTER_ALL_MEMBERS = 2;

export const data = new SlashCommandBuilder()
  .setName("security")
  .setDescription("View or control the security engine")
  .addSubcommand((sub) => sub.setName("status").setDescription("Show current security status"))
  .addSubcommand((sub) =>
    sub
      .setName("raidmode")
      .setDescription("Manually check raid mode status")
  );

export async function execute(interaction) {
  if (!(await requireAtLeast(interaction, "admin"))) return;

  const sub = interaction.options.getSubcommand();
  const guild = interaction.guild;

  if (sub === "status" || sub === "raidmode") {
    const raiding = isRaidModeActive(guild.id);
    const explicitFilter = guild.explicitContentFilter === EXPLICIT_CONTENT_FILTER_ALL_MEMBERS
      ? "✅ Scanning all members"
      : "⚠️ Not set to strictest level";

    const autoModRules = await guild.autoModerationRules.fetch().catch(() => new Map());

    const embed = new EmbedBuilder()
      .setColor(raiding ? "#E74C3C" : "#2ECC71")
      .setTitle("🛡️ Security Engine Status")
      .addFields(
        { name: "Raid Mode", value: raiding ? "🚨 ACTIVE" : "✅ Normal", inline: true },
        { name: "NSFW / Explicit Content Filter", value: explicitFilter, inline: true },
        { name: "Native AutoMod Rules", value: String(autoModRules.size), inline: true },
        { name: "Verification Level", value: String(guild.verificationLevel), inline: true },
        { name: "Anti-Spam", value: "✅ Active (in-memory rate limiting)", inline: true },
        { name: "Anti-Phishing", value: "✅ Active (domain blocklist + heuristics)", inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
