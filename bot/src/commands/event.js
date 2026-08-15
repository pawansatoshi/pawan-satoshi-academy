// bot/src/commands/event.js
//
// /event create|edit|postpone|cancel|resume|disable|list|delete
//
// This is the ONLY interface for managing recurring events. Owner and
// Admin only. Nothing here redeploys the bot — every change takes
// effect on the next scheduler tick (within ~60 seconds).

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { requireAtLeast } from "../core/permissions.js";
import {
  createEvent,
  editEvent,
  postponeEvent,
  cancelEvent,
  resumeEvent,
  disableEvent,
  removeEvent,
  getEventsList,
  validateEventInput
} from "../modules/events/index.js";
import { istHourToUtcHour } from "../modules/events/recurrence.js";
import { getRecurringEventByKey } from "../core/database.js";

export const data = new SlashCommandBuilder()
  .setName("event")
  .setDescription("Manage recurring events (meetings, quizzes, challenges, announcements)")
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("Create a new recurring event")
      .addStringOption((o) => o.setName("key").setDescription("Short unique ID, e.g. sunday-meeting").setRequired(true))
      .addStringOption((o) => o.setName("title").setDescription("Display title").setRequired(true))
      .addChannelOption((o) => o.setName("channel").setDescription("Channel to post in").setRequired(true))
      .addStringOption((o) =>
        o.setName("type").setDescription("Event type").setRequired(true).addChoices(
          { name: "meeting", value: "meeting" },
          { name: "quiz", value: "quiz" },
          { name: "challenge", value: "challenge" },
          { name: "announcement", value: "announcement" },
          { name: "custom", value: "custom" }
        )
      )
      .addStringOption((o) =>
        o.setName("recurrence").setDescription("How often").setRequired(true).addChoices(
          { name: "daily", value: "daily" },
          { name: "weekly", value: "weekly" },
          { name: "monthly", value: "monthly" },
          { name: "once", value: "once" }
        )
      )
      .addIntegerOption((o) => o.setName("hour_ist").setDescription("Hour in IST, 0-23").setRequired(true).setMinValue(0).setMaxValue(23))
      .addStringOption((o) => o.setName("day").setDescription("For weekly: SUNDAY..SATURDAY. For monthly: day number 1-31").setRequired(false))
      .addStringOption((o) => o.setName("description").setDescription("Message body").setRequired(false))
      .addStringOption((o) => o.setName("quiz_subject").setDescription("Only for type=quiz: subject slug, e.g. bitcoin (blank = any subject)").setRequired(false))
      .addStringOption((o) => o.setName("quiz_class").setDescription("Only for type=quiz: class, e.g. class-8 (blank = any class)").setRequired(false))
      .addIntegerOption((o) => o.setName("quiz_count").setDescription("Only for type=quiz: how many questions to post (default: mode default)").setMinValue(1).setMaxValue(30).setRequired(false))
  )
  .addSubcommand((sub) =>
    sub
      .setName("edit")
      .setDescription("Edit an existing event")
      .addStringOption((o) => o.setName("key").setDescription("Event key").setRequired(true))
      .addStringOption((o) => o.setName("title").setDescription("New title").setRequired(false))
      .addStringOption((o) => o.setName("description").setDescription("New description").setRequired(false))
      .addIntegerOption((o) => o.setName("hour_ist").setDescription("New hour in IST").setRequired(false).setMinValue(0).setMaxValue(23))
      .addStringOption((o) => o.setName("day").setDescription("New day (weekly/monthly)").setRequired(false))
  )
  .addSubcommand((sub) =>
    sub
      .setName("postpone")
      .setDescription("Postpone the next occurrence to a specific date/time")
      .addStringOption((o) => o.setName("key").setDescription("Event key").setRequired(true))
      .addStringOption((o) => o.setName("until").setDescription("ISO datetime, e.g. 2026-08-10T13:30:00Z").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("cancel").setDescription("Cancel the next occurrence and clear scheduling")
      .addStringOption((o) => o.setName("key").setDescription("Event key").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("resume").setDescription("Resume a postponed/disabled event")
      .addStringOption((o) => o.setName("key").setDescription("Event key").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("disable").setDescription("Disable an event indefinitely (kept, not deleted)")
      .addStringOption((o) => o.setName("key").setDescription("Event key").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("delete").setDescription("Permanently delete an event definition")
      .addStringOption((o) => o.setName("key").setDescription("Event key").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("list").setDescription("List all recurring events")
      .addStringOption((o) =>
        o.setName("status").setDescription("Filter by status").setRequired(false).addChoices(
          { name: "active", value: "active" },
          { name: "postponed", value: "postponed" },
          { name: "cancelled", value: "cancelled" },
          { name: "disabled", value: "disabled" }
        )
      )
  );

export async function execute(interaction) {
  if (!(await requireAtLeast(interaction, "admin"))) return;

  const sub = interaction.options.getSubcommand();

  if (sub === "create") {
    const key = interaction.options.getString("key");
    const title = interaction.options.getString("title");
    const channel = interaction.options.getChannel("channel");
    const eventType = interaction.options.getString("type");
    const recurrenceRule = interaction.options.getString("recurrence");
    const hourIst = interaction.options.getInteger("hour_ist");
    const day = interaction.options.getString("day");
    const description = interaction.options.getString("description");
    const quizSubject = interaction.options.getString("quiz_subject");
    const quizClass = interaction.options.getString("quiz_class");
    const quizCount = interaction.options.getInteger("quiz_count");

    const errors = validateEventInput({ eventType, recurrenceRule, recurrenceDay: day });
    if (errors.length > 0) {
      await interaction.reply({ content: `❌ ${errors.join("\n")}`, ephemeral: true });
      return;
    }

    if (getRecurringEventByKey(key)) {
      await interaction.reply({ content: `❌ An event with key \`${key}\` already exists. Use \`/event edit\`.`, ephemeral: true });
      return;
    }

    const { hour, minute } = istHourToUtcHour(hourIst);
    const timeUtc = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    const row = createEvent({
      eventKey: key,
      title,
      description,
      channelId: channel.id,
      eventType,
      recurrenceRule,
      recurrenceDay: day,
      timeUtc,
      createdBy: interaction.user.id,
      quizSubject,
      quizClass,
      quizCount
    });

    await interaction.reply({ embeds: [eventSummaryEmbed(row, "Event created ✅")] });
    return;
  }

  if (sub === "edit") {
    const key = interaction.options.getString("key");
    const updates = {};
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const hourIst = interaction.options.getInteger("hour_ist");
    const day = interaction.options.getString("day");

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (day) updates.recurrence_day = day;
    if (hourIst !== null) {
      const { hour, minute } = istHourToUtcHour(hourIst);
      updates.recurrence_time_utc = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    const updated = editEvent(key, updates, interaction.user.id);
    if (!updated) {
      await interaction.reply({ content: `❌ No event found with key \`${key}\`.`, ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [eventSummaryEmbed(updated, "Event updated ✏️")] });
    return;
  }

  if (sub === "postpone") {
    const key = interaction.options.getString("key");
    const until = interaction.options.getString("until");
    if (Number.isNaN(Date.parse(until))) {
      await interaction.reply({ content: "❌ `until` must be a valid ISO datetime, e.g. `2026-08-10T13:30:00Z`.", ephemeral: true });
      return;
    }
    const updated = postponeEvent(key, new Date(until).toISOString(), interaction.user.id);
    if (!updated) {
      await interaction.reply({ content: `❌ No event found with key \`${key}\`.`, ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [eventSummaryEmbed(updated, "Event postponed ⏸️")] });
    return;
  }

  if (sub === "cancel") {
    const key = interaction.options.getString("key");
    cancelEvent(key, interaction.user.id);
    await interaction.reply({ content: `🚫 Event \`${key}\` cancelled. Its schedule is cleared — recreate or resume as needed.` });
    return;
  }

  if (sub === "resume") {
    const key = interaction.options.getString("key");
    const updated = resumeEvent(key, interaction.user.id);
    if (!updated) {
      await interaction.reply({ content: `❌ No event found with key \`${key}\`.`, ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [eventSummaryEmbed(updated, "Event resumed ▶️")] });
    return;
  }

  if (sub === "disable") {
    const key = interaction.options.getString("key");
    disableEvent(key, interaction.user.id);
    await interaction.reply({ content: `🔕 Event \`${key}\` disabled. It's kept in the system — resume it anytime with \`/event resume\`.` });
    return;
  }

  if (sub === "delete") {
    const key = interaction.options.getString("key");
    removeEvent(key, interaction.user.id);
    await interaction.reply({ content: `🗑️ Event \`${key}\` permanently deleted.` });
    return;
  }

  if (sub === "list") {
    const status = interaction.options.getString("status");
    const events = getEventsList(status);

    if (events.length === 0) {
      await interaction.reply({ content: "No recurring events found.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("Recurring Events")
      .setDescription(
        events
          .map((e) => `**${e.title}** \`${e.event_key}\` — ${e.status} — next: ${e.next_run_at || "—"}`)
          .join("\n")
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }
}

function eventSummaryEmbed(row, headline) {
  return new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle(headline)
    .addFields(
      { name: "Key", value: row.event_key, inline: true },
      { name: "Type", value: row.event_type, inline: true },
      { name: "Status", value: row.status, inline: true },
      { name: "Recurrence", value: row.recurrence_day ? `${row.recurrence_rule} (${row.recurrence_day})` : row.recurrence_rule, inline: true },
      { name: "Next run (UTC)", value: row.next_run_at || "—", inline: true }
    );
}
