import "server-only";

/**
 * Notifications par courriel.
 *
 * Le projet est livré sans dépendance SMTP : sans configuration, les messages
 * sont journalisés dans la console du serveur, ce qui permet de dérouler tout
 * le parcours en démonstration. En production, il suffit de brancher ici le
 * transporteur retenu par la collectivité (SMTP mutualisé, service tiers) —
 * l'interface `sendMail` ne change pas.
 */
export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendMail(message: MailMessage): Promise<{ sent: boolean; reason?: string }> {
  const host = process.env.SMTP_HOST;

  if (!host) {
    console.info(
      [
        "",
        "──────────── COURRIEL (non envoyé : SMTP non configuré) ────────────",
        `À        : ${message.to}`,
        `Objet    : ${message.subject}`,
        message.replyTo ? `Répondre à : ${message.replyTo}` : null,
        "",
        message.text,
        "────────────────────────────────────────────────────────────────────",
        "",
      ]
        .filter((line) => line !== null)
        .join("\n"),
    );
    return { sent: false, reason: "SMTP non configuré" };
  }

  // Branchement réel à effectuer lors de la mise en production.
  console.warn(
    `[courriel] SMTP_HOST est défini (${host}) mais aucun transporteur n'est branché. ` +
      "Complétez src/lib/notify.ts avec le client SMTP retenu.",
  );
  return { sent: false, reason: "Transporteur SMTP non branché" };
}

/** Accusé de réception adressé à l'usager. */
export function acknowledgementMail(input: {
  to: string;
  name: string;
  reference: string;
  token: string;
  subject: string;
  kind: string;
}): MailMessage {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    to: input.to,
    subject: `[Mairie de Chessy-les-Mines] ${input.kind} — référence ${input.reference}`,
    text: [
      `Bonjour ${input.name},`,
      "",
      `Nous avons bien reçu votre ${input.kind.toLowerCase()} : « ${input.subject} ».`,
      "",
      `Référence de suivi : ${input.reference}`,
      `Suivre l'avancement : ${base}/suivi?ref=${encodeURIComponent(input.reference)}&cle=${input.token}`,
      "",
      "Nos services l'examinent et reviendront vers vous. Vous pouvez consulter à tout",
      "moment l'état de votre demande depuis le lien ci-dessus.",
      "",
      "Bien cordialement,",
      "Mairie de Chessy-les-Mines",
      "Place de la Mairie — 69380 Chessy-les-Mines — 04 78 43 92 03",
      "",
      "Ce message est automatique : merci de ne pas y répondre directement.",
    ].join("\n"),
  };
}

/** Alerte adressée au service compétent. */
export function internalMail(input: {
  subject: string;
  reference: string;
  summary: string[];
  adminPath: string;
}): MailMessage {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    to: process.env.MAIRIE_NOTIFY_EMAIL ?? "accueil@chessy69.fr",
    subject: `[Site] ${input.subject} — ${input.reference}`,
    text: [
      `Nouvelle demande déposée sur le site : ${input.reference}`,
      "",
      ...input.summary,
      "",
      `Traiter la demande : ${base}${input.adminPath}`,
    ].join("\n"),
  };
}
