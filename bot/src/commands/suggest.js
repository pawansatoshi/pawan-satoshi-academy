import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { readStore, writeStore } from "../core/store.js";

const STORE = "suggestions";
export const data = new SlashCommandBuilder()
  .setName("suggest")
  .setDescription("Submit or review Academy suggestions")
  .addSubcommand((sub) => sub.setName("add").setDescription("Submit an improvement idea").addStringOption((o) => o.setName("idea").setDescription("Your suggestion").setRequired(true).setMaxLength(500)))
  .addSubcommand((sub) => sub.setName("list").setDescription("View recent suggestions"))
  .addSubcommand((sub) => sub.setName("status").setDescription("Update a suggestion status").addStringOption((o) => o.setName("id").setDescription("Suggestion ID").setRequired(true)).addStringOption((o) => o.setName("value").setDescription("new status").setRequired(true).addChoices({ name: "planned", value: "planned" }, { name: "accepted", value: "accepted" }, { name: "declined", value: "declined" })));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const suggestions = readStore(STORE, []);
  if (sub === "add") {
    const suggestion = { id: `S-${Date.now().toString(36).toUpperCase()}`, authorId: interaction.user.id, idea: interaction.options.getString("idea", true), status: "new", createdAt: new Date().toISOString() };
    writeStore(STORE, [...suggestions, suggestion]);
    await interaction.reply({ content: `Suggestion submitted as **${suggestion.id}**.`, ephemeral: true });
    return;
  }
  if (sub === "list") {
    const text = suggestions.slice(-15).reverse().map((item) => `**${item.id}** · ${item.status} · ${item.idea}`).join("\n") || "No suggestions yet.";
    await interaction.reply({ embeds: [new EmbedBuilder().setColor("#8E9BFF").setTitle("Academy Suggestions").setDescription(text)], ephemeral: true });
    return;
  }
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({ content: "Only Academy managers can update suggestion status.", ephemeral: true });
    return;
  }
  const id = interaction.options.getString("id", true).toUpperCase();
  const item = suggestions.find((suggestion) => suggestion.id === id);
  if (!item) { await interaction.reply({ content: "Suggestion not found.", ephemeral: true }); return; }
  item.status = interaction.options.getString("value", true);
  writeStore(STORE, suggestions);
  await interaction.reply({ content: `Updated **${id}** → **${item.status}**.`, ephemeral: true });
}
