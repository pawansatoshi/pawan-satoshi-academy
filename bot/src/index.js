import { createServer } from "node:http";
import { readdirSync } from "node:fs";
import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import { config } from "./core/config.js";
import { getLogger } from "./core/logger.js";
import { initDatabase, closeDatabase } from "./core/database.js";
import { loadQuestionBank } from "./modules/quiz-engine/loader.js";
import { loadCurriculumMapping } from "./modules/progress/curriculum.js";
import { getCertificateById, buildCertificatePdf } from "./modules/certificates/index.js";

const logger = getLogger("index");

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(payload));
}

function startHealthServer() {
  const port = Number(process.env.PORT || 3000);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/health" || url.pathname === "/") {
      sendJson(res, 200, { status: "ok", service: "pawan-satoshi-academy-bot" });
      return;
    }

    const verifyMatch = url.pathname.match(/^\/verify\/certificate\/([^/]+)$/i);
    if (verifyMatch) {
      const certificate = getCertificateById(decodeURIComponent(verifyMatch[1]).toUpperCase());
      if (!certificate) {
        sendJson(res, 404, { verified: false, error: "certificate_not_found" });
        return;
      }
      sendJson(res, 200, { verified: true, id: certificate.id, name: certificate.name, issuedAt: certificate.issuedAt, title: certificate.title });
      return;
    }

    const pdfMatch = url.pathname.match(/^\/certificate\/([^/]+)\.pdf$/i);
    if (pdfMatch) {
      const certificate = getCertificateById(decodeURIComponent(pdfMatch[1]).toUpperCase());
      if (!certificate) {
        sendJson(res, 404, { error: "certificate_not_found" });
        return;
      }
      try {
        const pdf = await buildCertificatePdf(certificate);
        res.writeHead(200, { "content-type": "application/pdf", "content-disposition": `inline; filename="${certificate.id}.pdf"`, "cache-control": "no-store" });
        res.end(pdf);
      } catch (err) {
        logger.error({ err }, "Certificate PDF generation failed");
        sendJson(res, 500, { error: "certificate_generation_failed" });
      }
      return;
    }

    sendJson(res, 404, { error: "not_found" });
  });

  server.listen(port, "0.0.0.0", () => logger.info({ port }, "Health server listening"));
  return server;
}

async function main() {
  const healthServer = startHealthServer();
  initDatabase();

  const questionBanksDir = new URL("../../quizzes/question-banks", import.meta.url);
  loadQuestionBank(questionBanksDir.pathname);

  const curriculumMappingFile = new URL("../../quizzes/schema/subject-class-mapping.json", import.meta.url);
  loadCurriculumMapping(curriculumMappingFile.pathname);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.AutoModerationExecution
    ],
    partials: [Partials.GuildMember, Partials.Channel]
  });

  client.commands = new Collection();
  const commandsDir = new URL("./commands/", import.meta.url);
  for (const file of readdirSync(commandsDir).filter((f) => f.endsWith(".js"))) {
    const mod = await import(new URL(file, commandsDir));
    if (mod.data && mod.execute) client.commands.set(mod.data.name, mod);
  }
  logger.info({ count: client.commands.size }, "Loaded slash commands");

  const eventsDir = new URL("./events/", import.meta.url);
  for (const file of readdirSync(eventsDir).filter((f) => f.endsWith(".js"))) {
    const mod = await import(new URL(file, eventsDir));
    if (!mod.name || !mod.execute) continue;
    if (mod.once) client.once(mod.name, (...args) => mod.execute(...args));
    else client.on(mod.name, (...args) => mod.execute(...args));
  }
  logger.info("Loaded event handlers");

  process.on("SIGINT", () => shutdown(client, healthServer));
  process.on("SIGTERM", () => shutdown(client, healthServer));
  process.on("unhandledRejection", (err) => logger.error({ err }, "Unhandled promise rejection"));
  await client.login(config.discord.token);
}

async function shutdown(client, healthServer) {
  logger.info("Shutting down gracefully...");
  closeDatabase();
  client.destroy();
  healthServer.close();
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "Fatal error during startup");
  process.exit(1);
});
