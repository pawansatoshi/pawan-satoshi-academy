import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, PermissionFlagsBits } from "discord.js";
import { openTicket, closeTicket, listTickets, createStudyGroup, listStudyGroups, joinStudyGroup, createActivity, exportCommunityData } from "../modules/community/index.js";

export const data = new SlashCommandBuilder()
  .setName("community")
  .setDescription("Academy community operations")
  .addSubcommand((sub) => sub.setName("ticket-open").setDescription("Open a private support ticket").addStringOption((o) => o.setName("subject").setDescription("What do you need help with?").setRequired(true).setMaxLength(120)))
  .addSubcommand((sub) => sub.setName("ticket-close").setDescription("Close a support ticket").addStringOption((o) => o.setName("id").setDescription("Ticket ID").setRequired(true)))
  .addSubcommand((sub) => sub.setName("ticket-list").setDescription("List your tickets"))
  .addSubcommand((sub) => sub.setName("group-create").setDescription("Create a study group").addStringOption((o) => o.setName("name").setDescription("Group name").setRequired(true)).addStringOption((o) => o.setName("subject").setDescription("Study subject").setRequired(true)))
  .addSubcommand((sub) => sub.setName("group-list").setDescription("List study groups"))
  .addSubcommand((sub) => sub.setName("group-join").setDescription("Join a study group").addStringOption((o) => o.setName("id").setDescription("Group ID").setRequired(true)))
  .addSubcommand((sub) => sub.setName("activity").setDescription("Post a community poll/activity").addStringOption((o) => o.setName("title").setDescription("Activity title").setRequired(true)).addStringOption((o) => o.setName("question").setDescription("Question").setRequired(true)).addStringOption((o) => o.setName("options").setDescription("Comma-separated choices, 2-4").setRequired(true)))
  .addSubcommand((sub) => sub.setName("export").setDescription("Export community operations data").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  if (sub === "ticket-open") {
    const result = await openTicket(interaction.guild, interaction.user, interaction.options.getString("subject", true));
    await interaction.reply({ content: result.existing ? `You already have an open ticket: <#${result.existing.channelId}>` : `Ticket opened: <#${result.channel.id}>`, ephemeral: true });
    return;
  }
  if (sub === "ticket-close") {
    const id = interaction.options.getString("id", true).toUpperCase();
    const ticket = closeTicket(id, interaction.user.id);
    if (!ticket) { await interaction.reply({ content: "Open ticket not found.", ephemeral: true }); return; }
    const channel = interaction.guild.channels.cache.get(ticket.channelId);
    if (channel) await channel.delete(`Ticket ${ticket.id} closed`).catch(() => {});
    await interaction.reply({ content: `Closed **${ticket.id}**.`, ephemeral: true });
    return;
  }
  if (sub === "ticket-list") {
    const mine = listTickets().filter((ticket) => ticket.userId === interaction.user.id).slice(-10).reverse();
    const text = mine.length ? mine.map((ticket) => `${ticket.status === "open" ? "🟢" : "⚪"} **${ticket.id}** — ${ticket.subject}`).join("\n") : "No tickets yet.";
    await interaction.reply({ embeds: [new EmbedBuilder().setColor("#8E9BFF").setTitle("Your Tickets").setDescription(text)], ephemeral: true });
    return;
  }
  if (sub === "group-create") {
    const group = createStudyGroup({ name: interaction.options.getString("name", true), subject: interaction.options.getString("subject", true), ownerId: interaction.user.id });
    await interaction.reply({ content: `Study group created: **${group.name}**\nID: **${group.id}**\nSubject: ${group.subject}`, ephemeral: true });
    return;
  }
  if (sub === "group-list") {
    const groups = listStudyGroups().slice(-15).reverse();
    const text = groups.length ? groups.map((group) => `**${group.id}** — ${group.name} · ${group.subject} · ${group.members.length} member(s)`).join("\n") : "No study groups yet.";
    await interaction.reply({ embeds: [new EmbedBuilder().setColor("#8E9BFF").setTitle("Study Groups").setDescription(text)], ephemeral: true });
    return;
  }
  if (sub === "group-join") {
    const group = joinStudyGroup(interaction.options.getString("id", true).toUpperCase(), interaction.user.id);
    await interaction.reply({ content: group ? `Joined **${group.name}**.` : "Study group not found.", ephemeral: true });
    return;
  }
  if (sub === "activity") {
    const options = interaction.options.getString("options", true).split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
    if (options.length < 2) { await interaction.reply({ content: "Provide at least two comma-separated choices.", ephemeral: true }); return; }
    const activity = createActivity({ title: interaction.options.getString("title", true), question: interaction.options.getString("question", true), options, createdBy: interaction.user.id });
    const row = new ActionRowBuilder().addComponents(options.map((option, index) => new ButtonBuilder().setCustomId(`activity:${activity.id}:${index}`).setLabel(option.slice(0, 80)).setStyle(ButtonStyle.Primary)));
    await interaction.reply({ embeds: [new EmbedBuilder().setColor("#8E9BFF").setTitle(activity.title).setDescription(activity.question)], components: [row] });
    return;
  }
  const file = Buffer.from(JSON.stringify(exportCommunityData(), null, 2));
  await interaction.reply({ content: "Community export generated.", files: [new AttachmentBuilder(file, { name: `academy-community-export-${Date.now()}.json` })], ephemeral: true });
}
