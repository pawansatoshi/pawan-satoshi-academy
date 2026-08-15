import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getMember, getMemberQuizStats } from "../core/database.js";
import { getLevelProgress } from "../modules/xp/index.js";
import { getBadges } from "../modules/badges/index.js";

export const data = new SlashCommandBuilder().setName("profile").setDescription("Show your Academy progress and badges");

export async function execute(interaction) {
  const member = getMember(interaction.user.id) || { xp: 0, level: 0, streak_days: 0 };
  const stats = getMemberQuizStats(interaction.user.id);
  const progress = getLevelProgress(member.xp);
  const badges = getBadges(interaction.user.id);
  const embed = new EmbedBuilder().setColor("#8E9BFF").setTitle(`${interaction.user.username}'s Academy Profile`).addFields(
    { name: "Level", value: String(progress.level), inline: true },
    { name: "XP", value: `${progress.xp} (${progress.current}/${progress.required})`, inline: true },
    { name: "Streak", value: `${member.streak_days || 0} day(s)`, inline: true },
    { name: "Quiz Accuracy", value: `${stats.total ? Math.round((stats.correct / stats.total) * 100) : 0}%`, inline: true },
    { name: "Badges", value: badges.length ? badges.map((badge) => `🏅 ${badge.name}`).join("\n") : "No badges yet — keep learning." }
  );
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
