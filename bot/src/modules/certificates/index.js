import PDFDocument from "pdfkit";
import crypto from "node:crypto";
import { getMember, getCompletedClasses } from "../../core/database.js";
import { readStore, writeStore } from "../../core/store.js";

const STORE = "certificates";

function certificateId(memberId) {
  return `PSA-${new Date().getUTCFullYear()}-${crypto.createHash("sha256").update(`${memberId}:${Date.now()}:${crypto.randomUUID()}`).digest("hex").slice(0, 12).toUpperCase()}`;
}

export function getCertificate(memberId) {
  return readStore(STORE, []).find((item) => item.memberId === memberId) || null;
}

export function getCertificateById(id) {
  return readStore(STORE, []).find((item) => item.id === id) || null;
}

export function isEligible(memberId) {
  return getCompletedClasses(memberId).includes("graduation");
}

export function issueCertificate(memberId, username = "Academy Graduate") {
  const existing = getCertificate(memberId);
  if (existing) return existing;
  if (!isEligible(memberId)) return null;

  const member = getMember(memberId);
  const certificate = {
    id: certificateId(memberId),
    memberId,
    name: member?.username || username,
    issuedAt: new Date().toISOString(),
    title: "Pawan Satoshi Academy Graduation Certificate",
    verificationPath: `/verify/certificate/${certificateId}`
  };
  writeStore(STORE, [...readStore(STORE, []), certificate]);
  return certificate;
}

export async function buildCertificatePdf(certificate) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 48 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(24, 24, 793, 545).lineWidth(2).stroke();
    doc.fontSize(28).font("Helvetica-Bold").text("PAWAN SATOSHI ACADEMY", { align: "center", y: 90 });
    doc.fontSize(16).font("Helvetica").text("CERTIFICATE OF GRADUATION", { align: "center", y: 140 });
    doc.moveDown(2);
    doc.fontSize(13).text("This certificate recognizes the successful completion of the Academy curriculum and required final examination.", { align: "center", width: 650, x: 95 });
    doc.fontSize(30).font("Helvetica-Bold").text(certificate.name, { align: "center", y: 260 });
    doc.fontSize(12).font("Helvetica").text(`Certificate ID: ${certificate.id}`, { align: "center", y: 330 });
    doc.text(`Issued: ${new Date(certificate.issuedAt).toUTCString()}`, { align: "center" });
    doc.fontSize(11).text("Verification: use the certificate ID with the Academy verification endpoint.", { align: "center", y: 455 });
    doc.end();
  });
}
