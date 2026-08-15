// bot/src/commands/leaderboard.js

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getMember } from "../core/database.js";
import { getLevelProgress } from "../modules/xp/index.js";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Show the Academy XP leaderboard");

export async function execute(interaction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "This command can only be used in the Academy server.", ephemeral: true });
    return;
  }

  await guild.members.fetch();
  const rows = guild.members.cache
    .filter((member) => !member.user.bot)
    .map((member) => ({ member, stats: getMember(member.id) }))
    .filter(({ stats }) => stats && stats.xp > 0)
    .sort((a, b) => b.stats.xp - a.stats.xp)
    .slice(0, 10);

  const description = rows.length
    ? rows.map(({ member, stats }, index) => {
        const progress = getLevelProgress(stats.xp);
        return `**${index + 1}.** ${member.displayName} — **${stats.xp} XP** · Level ${progress.level} · ${stats.streak_days || 0} day streak`;
      }).join("\n")
    : "No XP has been earned yet. Complete a quiz question to appear here.";

  const embed = new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("🏆 Pawan Satoshi Academy Leaderboard")
    .setDescription(description)
    .setFooter({ text: "10 XP for a correct quiz answer · 2 XP for an attempted answer" });

  await interaction.reply({ embeds: [embed] });
}
