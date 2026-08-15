import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { buildCertificatePdf, getCertificate, issueCertificate, getCertificateById, isEligible } from "../modules/certificates/index.js";

export const data = new SlashCommandBuilder()
  .setName("certificate")
  .setDescription("Graduation certificate and public verification")
  .addSubcommand((sub) => sub.setName("issue").setDescription("Issue your graduation certificate if eligible"))
  .addSubcommand((sub) => sub.setName("verify").setDescription("Verify a certificate ID").addStringOption((o) => o.setName("id").setDescription("Certificate ID").setRequired(true)))
  .addSubcommand((sub) => sub.setName("status").setDescription("Check your certificate eligibility"));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "status") {
    const certificate = getCertificate(interaction.user.id);
    const eligible = isEligible(interaction.user.id);
    const embed = new EmbedBuilder().setColor(eligible ? "#2ECC71" : "#3498DB").setTitle("Certificate Status").setDescription(
      certificate ? `Issued: **${certificate.id}**` : eligible ? "You are eligible. Use `/certificate issue`." : "Not yet eligible. Pass every chapter assessment and the final examination."
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (sub === "verify") {
    const id = interaction.options.getString("id", true).trim().toUpperCase();
    const certificate = getCertificateById(id);
    const embed = certificate
      ? new EmbedBuilder().setColor("#2ECC71").setTitle("Certificate Verified").addFields({ name: "Certificate ID", value: certificate.id }, { name: "Graduate", value: certificate.name }, { name: "Issued", value: new Date(certificate.issuedAt).toUTCString() })
      : new EmbedBuilder().setColor("#E74C3C").setTitle("Certificate Not Found").setDescription("No certificate with that ID exists in the Academy registry.");
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const certificate = issueCertificate(interaction.user.id, interaction.user.username);
  if (!certificate) {
    await interaction.reply({ content: "You are not eligible yet. Complete every chapter assessment and pass the final examination first.", ephemeral: true });
    return;
  }

  const pdf = await buildCertificatePdf(certificate);
  const attachment = new AttachmentBuilder(pdf, { name: `${certificate.id}.pdf` });
  await interaction.reply({ content: `Your certificate is ready. **${certificate.id}**`, files: [attachment], ephemeral: true });
}
