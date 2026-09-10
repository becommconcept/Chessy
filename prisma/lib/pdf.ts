/**
 * Générateur de PDF minimaliste utilisé par le seed.
 *
 * Les documents de démonstration (bulletins, comptes rendus, règlements) sont
 * de vrais fichiers PDF valides, afin que les liens de téléchargement du site
 * fonctionnent immédiatement. La mairie remplace ensuite chaque fichier par le
 * document réel depuis la médiathèque du back-office.
 */

/** Échappe une chaîne pour un littéral PDF, en encodage WinAnsi. */
function pdfString(value: string): string {
  const replacements: Record<string, string> = {
    "’": "'",
    "‘": "'",
    "“": '"',
    "”": '"',
    "—": "-",
    "–": "-",
    "…": "...",
    " ": " ",
  };
  const normalized = value.replace(/[’‘“”—–… ]/g, (char) => replacements[char] ?? char);

  let out = "";
  for (const char of normalized) {
    const code = char.codePointAt(0) ?? 32;
    if (char === "(" || char === ")" || char === "\\") {
      out += `\\${char}`;
    } else if (code < 32) {
      out += " ";
    } else if (code < 128) {
      out += char;
    } else if (code <= 255) {
      out += `\\${code.toString(8).padStart(3, "0")}`;
    } else {
      out += "?";
    }
  }
  return out;
}

/** Découpe un paragraphe en lignes d'une largeur approximative donnée. */
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export type PdfOptions = {
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  footer?: string;
};

/** Produit un PDF A4 d'une page contenant le titre et le texte fournis. */
export function buildSimplePdf(options: PdfOptions): Buffer {
  const { title, subtitle, paragraphs = [], footer } = options;

  const operations: string[] = [];
  let y = 780;

  // Bandeau de couleur azurite.
  operations.push("q 0.078 0.314 0.498 rg 0 802 595 40 re f Q");
  operations.push(
    `BT /F2 13 Tf 1 1 1 rg 42 816 Td (${pdfString("MAIRIE DE CHESSY-LES-MINES")}) Tj ET`,
  );

  y = 750;
  for (const line of wrap(title, 46)) {
    operations.push(`BT /F2 20 Tf 0.043 0.180 0.310 rg 42 ${y} Td (${pdfString(line)}) Tj ET`);
    y -= 26;
  }

  if (subtitle) {
    y -= 4;
    for (const line of wrap(subtitle, 74)) {
      operations.push(`BT /F1 12 Tf 0.31 0.35 0.40 rg 42 ${y} Td (${pdfString(line)}) Tj ET`);
      y -= 17;
    }
  }

  y -= 10;
  operations.push(`q 0.776 0.541 0.180 RG 1.5 w 42 ${y} m 160 ${y} l S Q`);
  y -= 30;

  for (const paragraph of paragraphs) {
    for (const line of wrap(paragraph, 88)) {
      if (y < 90) break;
      operations.push(`BT /F1 11 Tf 0.13 0.15 0.18 rg 42 ${y} Td (${pdfString(line)}) Tj ET`);
      y -= 16;
    }
    y -= 10;
  }

  const footerText =
    footer ??
    "Document de demonstration genere avec le site. A remplacer par le document officiel depuis le back-office.";
  operations.push(
    `BT /F1 8.5 Tf 0.45 0.48 0.52 rg 42 52 Td (${pdfString(footerText)}) Tj ET`,
  );
  operations.push(
    `BT /F1 8.5 Tf 0.45 0.48 0.52 rg 42 38 Td (${pdfString("Place de la Mairie - 69380 Chessy-les-Mines - 04 78 43 92 03 - accueil@chessy69.fr")}) Tj ET`,
  );

  const content = operations.join("\n");
  const contentBytes = Buffer.byteLength(content, "latin1");

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${contentBytes} >>\nstream\n${content}\nendstream`,
    `<< /Title (${pdfString(title)}) /Producer (Site de la commune de Chessy-les-Mines) >>`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
