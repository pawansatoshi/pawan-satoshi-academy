import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { createGame } from "../modules/games/index.js";

export const data = new SlashCommandBuilder().setName("game").setDescription("Play a quick educational knowledge game").addSubcommand((sub) => sub.setName("knowledge").setDescription("Answer a random Academy knowledge question"));

export async function execute(interaction) {
  const game = createGame(interaction.user.id);
  const row = new ActionRowBuilder().addComponents(game.choices.map((choice) => new ButtonBuilder().setCustomId(`game:${game.id}:${choice}`).setLabel(choice).setStyle(ButtonStyle.Primary)));
  await interaction.reply({ embeds: [new EmbedBuilder().setColor("#8E9BFF").setTitle("Knowledge Sprint").setDescription(game.prompt)], components: [row], ephemeral: true });
}
