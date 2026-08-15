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
import { getQuestionBank } from "../modules/quiz-engine/loader.js";
import { awardQuizXp } from "../modules/xp/index.js";
import { answerActivity } from "../modules/community/index.js";

const logger = getLogger("interactionCreate");

export const name = Events.InteractionCreate;
export const once = false;

function questionWasCorrect(questionId, optionIndex) {
  const question = getQuestionBank().questions.find((q) => q.id === questionId);
  return !!question && Number(optionIndex) === question.correctAnswer;
}

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

    if (!interaction.isButton()) return;

    if (interaction.customId === VERIFY_BUTTON_ID) {
      await handleVerifyButton(interaction);
      return;
    }

    if (interaction.customId.startsWith(`${SESSION_BUTTON_PREFIX}:`)) {
      const [, sessionId, questionId, optionIndex] = interaction.customId.split(":");
      await handleSessionAnswer(interaction, sessionId, questionId, Number(optionIndex));
      if (interaction.replied || interaction.deferred) {
        const result = awardQuizXp(interaction.user.id, questionWasCorrect(questionId, optionIndex));
        logger.info({ memberId: interaction.user.id, gained: result.gained, level: result.level }, "Quiz XP awarded");
      }
      return;
    }

    if (interaction.customId.startsWith(`${COMMUNITY_BUTTON_PREFIX}:`)) {
      const [, questionId, optionIndex] = interaction.customId.split(":");
      await handleCommunityAnswer(interaction, questionId, optionIndex);
      if (interaction.replied || interaction.deferred) {
        const result = awardQuizXp(interaction.user.id, questionWasCorrect(questionId, optionIndex));
        logger.info({ memberId: interaction.user.id, gained: result.gained, level: result.level }, "Quiz XP awarded");
      }
      return;
    }

    if (interaction.customId.startsWith("activity:")) {
      const [, activityId, option] = interaction.customId.split(":");
      const result = answerActivity(activityId, interaction.user.id, Number(option));
      if (!result) {
        await interaction.reply({ content: "This activity no longer exists.", ephemeral: true });
        return;
      }
      if (result.alreadyAnswered) {
        await interaction.reply({ content: "You've already answered this activity.", ephemeral: true });
        return;
      }
      await interaction.reply({ content: `Response recorded: **${result.activity.options[Number(option)]}**`, ephemeral: true });
    }
  } catch (err) {
    logger.error({ err }, "Error handling interaction");
    const errorReply = { content: "Something went wrong handling that. Please try again or contact a moderator.", ephemeral: true };
    if (interaction.deferred || interaction.replied) await interaction.followUp(errorReply).catch(() => {});
    else await interaction.reply(errorReply).catch(() => {});
  }
}
