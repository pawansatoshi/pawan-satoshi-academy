import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LESSON_ROOT = new URL("../../../academy/lessons/", import.meta.url).pathname;

function loadLessons(dir = LESSON_ROOT, result = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) loadLessons(path, result);
    else if (entry.name.endsWith(".md") && entry.name !== "README.md") result.push({ title: entry.name.replace(/\.md$/, ""), text: readFileSync(path, "utf8") });
  }
  return result;
}

function tokens(value) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((token) => token.length > 2));
}

function score(query, text) {
  const q = tokens(query);
  const t = tokens(text);
  let total = 0;
  for (const token of q) if (t.has(token)) total += 1;
  return total;
}

export function retrieve(query, limit = 3) {
  const lessons = loadLessons();
  return lessons.map((lesson) => ({ ...lesson, score: score(query, lesson.text) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

export function answer(query) {
  const results = retrieve(query, 3);
  if (results.length === 0) return { answer: "I could not find a relevant Academy lesson. Try a more specific question or ask a moderator for guidance.", sources: [] };
  const excerpts = results.map((item) => {
    const lines = item.text.split("\n").filter((line) => line.trim() && !line.startsWith("#")).slice(0, 7);
    return `**${item.title}**\n${lines.join(" ")}`;
  });
  return { answer: `Based on the Academy lesson corpus:\n\n${excerpts.join("\n\n")}`, sources: results.map((item) => item.title) };
}
