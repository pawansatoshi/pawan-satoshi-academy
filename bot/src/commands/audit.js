// bot/src/commands/audit.js
//
// /audit recent — queryable view into the audit_log table, which
// captures both bot-driven actions (role assignment, event changes,
// security responses) and mirrored native Discord audit log entries.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { requireAtLeast } from "../core/permissions.js";
import { listAuditLogEntries } from "../core/database.js";

export const data = new SlashCommandBuilder()
  .setName("audit")
  .setDescription("View recent audit log entries")
  .addSubcommand((sub) =>
    sub
      .setName("recent")
      .setDescription("Show the most recent audit log entries")
      .addIntegerOption((o) => o.setName("count").setDescription("How many entries (max 25)").setMinValue(1).setMaxValue(25).setRequired(false))
      .addStringOption((o) => o.setName("filter").setDescription("Filter by action name substring, e.g. 'role', 'event', 'phishing'").setRequired(false))
  );

export async function execute(interaction) {
  if (!(await requireAtLeast(interaction, "moderator"))) return;

  const count = interaction.options.getInteger("count") || 15;
  const filter = interaction.options.getString("filter");

  const entries = listAuditLogEntries({ limit: count, actionFilter: filter });

  if (entries.length === 0) {
    await interaction.reply({ content: "No audit log entries found.", ephemeral: true });
    return;
  }

  const lines = entries.map((e) => {
    const actor = e.actor_id === "bot" ? "🤖 bot" : `<@${e.actor_id}>`;
    const target = e.target_id ? ` → \`${e.target_id}\`` : "";
    return `\`${e.created_at}\` **${e.action}** by ${actor}${target}`;
  });

  const embed = new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle(`Audit Log${filter ? ` — filtered: "${filter}"` : ""}`)
    .setDescription(lines.join("\n").slice(0, 4000));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
