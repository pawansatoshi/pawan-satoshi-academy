import { getMember, getCompletedClasses, getMemberQuizStats } from "../../core/database.js";

export function getBadges(memberId) {
  const member = getMember(memberId);
  const completed = getCompletedClasses(memberId);
  const stats = getMemberQuizStats(memberId);
  const badges = [];
  if (member?.verified_at) badges.push({ id: "verified", name: "Verified Learner" });
  if (stats.total >= 10) badges.push({ id: "quiz-starter", name: "Quiz Starter" });
  if (stats.total >= 50) badges.push({ id: "quiz-builder", name: "Quiz Builder" });
  if (stats.correct >= 50) badges.push({ id: "accuracy", name: "Accuracy Builder" });
  if ((member?.streak_days || 0) >= 7) badges.push({ id: "streak-7", name: "7-Day Streak" });
  if (completed.length >= 6) badges.push({ id: "halfway", name: "Halfway Scholar" });
  if (completed.includes("graduation")) badges.push({ id: "graduate", name: "Academy Graduate" });
  return badges;
}
