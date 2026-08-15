import { ChannelType, PermissionFlagsBits } from "discord.js";
import { readStore, writeStore } from "../../core/store.js";
import { getConfigValue } from "../../core/database.js";

const TICKETS = "tickets";
const GROUPS = "study-groups";
const ACTIVITIES = "activities";

export function listTickets() { return readStore(TICKETS, []); }

export async function openTicket(guild, user, subject) {
  const tickets = listTickets();
  const existing = tickets.find((ticket) => ticket.userId === user.id && ticket.status === "open");
  if (existing) return { existing, channel: guild.channels.cache.get(existing.channelId) };

  const name = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)}-${Date.now().toString().slice(-4)}`;
  const moderatorRoleId = getConfigValue("role.moderator");
  const permissionOverwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
  ];
  if (moderatorRoleId) permissionOverwrites.push({ id: moderatorRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });

  const channel = await guild.channels.create({ name, type: ChannelType.GuildText, topic: `Academy support ticket: ${subject}`, permissionOverwrites });
  const ticket = { id: `T-${Date.now().toString(36).toUpperCase()}`, userId: user.id, channelId: channel.id, subject, status: "open", createdAt: new Date().toISOString() };
  writeStore(TICKETS, [...tickets, ticket]);
  await channel.send(`Support ticket **${ticket.id}** opened by <@${user.id}>. Subject: **${subject}**\nA moderator can close it with \/community ticket-close.`);
  return { ticket, channel };
}

export function closeTicket(ticketId, actorId) {
  const tickets = listTickets();
  const ticket = tickets.find((item) => item.id === ticketId && item.status === "open");
  if (!ticket) return null;
  ticket.status = "closed";
  ticket.closedAt = new Date().toISOString();
  ticket.closedBy = actorId;
  writeStore(TICKETS, tickets);
  return ticket;
}

export function listStudyGroups() { return readStore(GROUPS, []); }
export function createStudyGroup({ name, subject, ownerId }) {
  const groups = listStudyGroups();
  const group = { id: `G-${Date.now().toString(36).toUpperCase()}`, name, subject, ownerId, members: [ownerId], createdAt: new Date().toISOString() };
  writeStore(GROUPS, [...groups, group]);
  return group;
}
export function joinStudyGroup(groupId, memberId) {
  const groups = listStudyGroups();
  const group = groups.find((item) => item.id === groupId);
  if (!group) return null;
  if (!group.members.includes(memberId)) group.members.push(memberId);
  writeStore(GROUPS, groups);
  return group;
}

export function createActivity({ title, question, options, createdBy }) {
  const activities = readStore(ACTIVITIES, []);
  const activity = { id: `A-${Date.now().toString(36).toUpperCase()}`, title, question, options, createdBy, responses: {}, createdAt: new Date().toISOString() };
  writeStore(ACTIVITIES, [...activities, activity]);
  return activity;
}
export function answerActivity(activityId, memberId, option) {
  const activities = readStore(ACTIVITIES, []);
  const activity = activities.find((item) => item.id === activityId);
  if (!activity) return null;
  if (activity.responses[memberId] !== undefined) return { alreadyAnswered: true, activity };
  activity.responses[memberId] = option;
  writeStore(ACTIVITIES, activities);
  return { alreadyAnswered: false, activity };
}

export function exportCommunityData() {
  return { generatedAt: new Date().toISOString(), tickets: listTickets(), studyGroups: listStudyGroups(), activities: readStore(ACTIVITIES, []) };
}
