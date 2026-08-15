import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { answer } from "../modules/ai-helper/index.js";

export const data = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask the Academy's retrieval-first learning helper")
  .addStringOption((o) => o.setName("question").setDescription("Your Academy learning question").setRequired(true).setMaxLength(500));

export async function execute(interaction) {
  const question = interaction.options.getString("question", true);
  const result = answer(question);
  const embed = new EmbedBuilder().setColor("#8E9BFF").setTitle("Academy Helper").setDescription(result.answer);
  if (result.sources.length) embed.setFooter({ text: `Sources: ${result.sources.join(", ")}` });
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
