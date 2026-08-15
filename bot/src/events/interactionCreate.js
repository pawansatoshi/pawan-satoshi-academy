// bot/src/events/interactionCreate.js

import { Events } from "discord.js";
import { getLogger } from "../core/logger.js";
import { VERIFY_BUTTON_ID, handleVerifyButton } from "../modules/verification/index.js";
import {
  SESSION_BUTTON_PREFIX,
  COMMUNITY_BUTTON_PREFIX,
  handleSessionAnswer,
  handleCommunityAnswer
} from "../modules/quiz-engine/index.js";

const logger = getLogger("interactionCreate");

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        logger.warn({ commandName: interaction.commandName }, "Unknown command invoked");
        return;
      }
      await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === VERIFY_BUTTON_ID) {
        await handleVerifyButton(interaction);
        return;
      }

      if (interaction.customId.startsWith(`${SESSION_BUTTON_PREFIX}:`)) {
        // Format: quiz_session:<sessionId>:<questionId>:<optionIndex>
        const [, sessionId, questionId, optionIndex] = interaction.customId.split(":");
        await handleSessionAnswer(interaction, sessionId, questionId, Number(optionIndex));
        return;
      }

      if (interaction.customId.startsWith(`${COMMUNITY_BUTTON_PREFIX}:`)) {
        // Format: quiz_community:<questionId>:<optionIndex>
        const [, questionId, optionIndex] = interaction.customId.split(":");
        await handleCommunityAnswer(interaction, questionId, optionIndex);
        return;
      }
    }
  } catch (err) {
    logger.error({ err }, "Error handling interaction");
    const errorReply = { content: "Something went wrong handling that. Please try again or contact a moderator.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(errorReply).catch(() => {});
    } else {
      await interaction.reply(errorReply).catch(() => {});
    }
  }
}
