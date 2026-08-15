// bot/src/commands/quiz.js
//
// /quiz practice subject:<...> [difficulty] [count]
// /quiz stats — a member's own lifetime quiz accuracy

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { startPracticeSession, getStatsForMember } from "../modules/quiz-engine/index.js";

// Matches the 22-subject curriculum exactly (see server-map.js /
// academy content). Slugs correspond to the `subject` field used in
// quizzes/question-banks/*.json.
const SUBJECT_CHOICES = [
  { name: "Orientation", value: "orientation" },
  { name: "Internet Basics", value: "internet-basics" },
  { name: "Digital Literacy", value: "digital-literacy" },
  { name: "Cyber Security", value: "cyber-security" },
  { name: "Password Safety", value: "password-safety" },
  { name: "Digital Payments", value: "digital-payments" },
  { name: "AI", value: "ai" },
  { name: "Prompt Engineering", value: "prompt-engineering" },
  { name: "Git & GitHub", value: "git-github" },
  { name: "Linux", value: "linux" },
  { name: "Programming", value: "programming" },
  { name: "Bitcoin", value: "bitcoin" },
  { name: "Blockchain", value: "blockchain" },
  { name: "Ethereum", value: "ethereum" },
  { name: "Base", value: "base" },
  { name: "Stablecoins", value: "stablecoins" },
  { name: "DeFi", value: "defi" },
  { name: "Wallet Security", value: "wallet-security" },
  { name: "Web3", value: "web3" },
  { name: "Testnets", value: "testnets" },
  { name: "Ambassador Programs", value: "ambassador-programs" },
  { name: "Community Management", value: "community-management" }
];

export const data = new SlashCommandBuilder()
  .setName("quiz")
  .setDescription("Practice quizzes and your quiz stats")
  .addSubcommand((sub) =>
    sub
      .setName("practice")
      .setDescription("Start a practice quiz on a subject")
      .addStringOption((o) => o.setName("subject").setDescription("Subject to practice").setRequired(true).addChoices(...SUBJECT_CHOICES))
      .addStringOption((o) =>
        o.setName("difficulty").setDescription("Difficulty (optional — mixed if not set)").setRequired(false).addChoices(
          { name: "beginner", value: "beginner" },
          { name: "intermediate", value: "intermediate" },
          { name: "advanced", value: "advanced" }
        )
      )
      .addIntegerOption((o) => o.setName("count").setDescription("How many questions (default 5, max 20)").setMinValue(1).setMaxValue(20).setRequired(false))
  )
  .addSubcommand((sub) => sub.setName("stats").setDescription("Show your lifetime quiz accuracy"));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "practice") {
    const subject = interaction.options.getString("subject");
    const difficulty = interaction.options.getString("difficulty");
    const count = interaction.options.getInteger("count") || 5;
    await startPracticeSession(interaction, { subject, difficulty, count });
    return;
  }

  if (sub === "stats") {
    const stats = getStatsForMember(interaction.user.id);
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Your Quiz Stats")
      .addFields(
        { name: "Questions Answered", value: String(stats.total), inline: true },
        { name: "Correct", value: String(stats.correct), inline: true },
        { name: "Accuracy", value: `${accuracy}%`, inline: true }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
