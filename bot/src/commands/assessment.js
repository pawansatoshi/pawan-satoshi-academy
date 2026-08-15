// bot/src/commands/assessment.js
//
// /assessment chapter class:<...> — REQUIRED to unlock the next class
// /assessment final              — REQUIRED for the Graduation Certificate
// /assessment progress           — shows a member's curriculum progress
//
// Unlimited retries on both. Locked chapters/final exam are enforced
// in modules/quiz-engine/index.js (startChapterAssessment/startFinalExam).

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { startChapterAssessment, startFinalExam, getProgressForMember } from "../modules/quiz-engine/index.js";

const CLASS_CHOICES = [
  { name: "Orientation", value: "orientation" },
  { name: "Class 1 — Internet Basics & Digital Literacy", value: "class-1" },
  { name: "Class 2 — Cyber Security & Password Safety", value: "class-2" },
  { name: "Class 3 — Digital Payments", value: "class-3" },
  { name: "Class 4 — Git & GitHub", value: "class-4" },
  { name: "Class 5 — Linux", value: "class-5" },
  { name: "Class 6 — Programming Basics", value: "class-6" },
  { name: "Class 7 — AI & Prompt Engineering", value: "class-7" },
  { name: "Class 8 — Bitcoin & Blockchain", value: "class-8" },
  { name: "Class 9 — Ethereum", value: "class-9" },
  { name: "Class 10 — Base & Stablecoins", value: "class-10" },
  { name: "Class 11 — DeFi & Wallet Security", value: "class-11" },
  { name: "Class 12 — Web3, Testnets, Ambassador & Community Mgmt", value: "class-12" }
];

export const data = new SlashCommandBuilder()
  .setName("assessment")
  .setDescription("Required chapter and final assessments")
  .addSubcommand((sub) =>
    sub
      .setName("chapter")
      .setDescription("Take the required Chapter Assessment to unlock the next class")
      .addStringOption((o) => o.setName("class").setDescription("Which chapter").setRequired(true).addChoices(...CLASS_CHOICES))
  )
  .addSubcommand((sub) => sub.setName("final").setDescription("Take the Final Examination (required for Graduation Certificate)"))
  .addSubcommand((sub) => sub.setName("progress").setDescription("Show your curriculum progress"));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "chapter") {
    const classKey = interaction.options.getString("class");
    await startChapterAssessment(interaction, { classKey });
    return;
  }

  if (sub === "final") {
    await startFinalExam(interaction);
    return;
  }

  if (sub === "progress") {
    const progress = getProgressForMember(interaction.user.id);

    const lines = progress.map((p) => {
      if (p.completed) return `✅ ${p.title}`;
      if (p.unlocked) return `🔓 ${p.title} — unlocked, not yet passed`;
      return `🔒 ${p.title} — locked`;
    });

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Your Curriculum Progress")
      .setDescription(lines.join("\n"));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
