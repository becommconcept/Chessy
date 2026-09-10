/**
 * Assainissement du HTML produit par l'éditeur du back-office.
 *
 * Les contenus riches sont rendus tels quels dans les pages publiques : même
 * si seuls des agents habilités peuvent les saisir, on ne fait pas confiance
 * au HTML reçu. Le filtre fonctionne par liste blanche — balises et attributs
 * explicitement autorisés — plutôt qu'en tentant de repérer ce qui est
 * dangereux, approche systématiquement contournable.
 *
 * Le module ne dépend ni du DOM ni d'une bibliothèque externe : il tourne
 * indifféremment côté serveur (validation avant enregistrement) et côté
 * client.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sup",
  "sub",
  "h2",
  "h3",
  "h4",
  "h5",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "hr",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "figure",
  "figcaption",
  "img",
  "code",
  "pre",
  "small",
  "abbr",
  "span",
  "div",
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  th: new Set(["scope", "colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
  abbr: new Set(["title"]),
};

/** Schémas d'URL acceptés dans `href` et `src`. */
const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

type Token =
  | { kind: "text"; value: string }
  | { kind: "open"; name: string; attributes: string; selfClosing: boolean }
  | { kind: "close"; name: string };

/** Découpe grossièrement le document en balises et fragments de texte. */
function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: "text", value: html.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    const name = match[1].toLowerCase();
    const attributes = match[2] ?? "";

    if (raw.startsWith("</")) {
      tokens.push({ kind: "close", name });
    } else {
      tokens.push({
        kind: "open",
        name,
        attributes,
        selfClosing: attributes.trimEnd().endsWith("/") || ["br", "hr", "img"].includes(name),
      });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < html.length) {
    tokens.push({ kind: "text", value: html.slice(lastIndex) });
  }

  return tokens;
}

/** Reconstruit la liste d'attributs conservés pour une balise donnée. */
function cleanAttributes(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRIBUTES[tag];
  if (!allowed) return "";

  const kept: string[] = [];
  const pattern = /([a-zA-Z][a-zA-Z0-9:_-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw)) !== null) {
    const name = match[1].toLowerCase();
    if (!allowed.has(name)) continue;

    let value = match[3] ?? match[4] ?? match[5] ?? "";
    value = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();

    if (name === "href" || name === "src") {
      if (!SAFE_URL.test(value)) continue;
    }

    if (name === "target") {
      // On n'autorise que l'ouverture dans un nouvel onglet, jamais un nom de
      // fenêtre arbitraire.
      if (value !== "_blank") continue;
    }

    if ((name === "width" || name === "height") && !/^\d{1,5}$/.test(value)) continue;

    kept.push(`${name}="${escapeAttribute(value)}"`);
  }

  // Tout lien externe ouvert dans un nouvel onglet reçoit `rel` protecteur.
  if (tag === "a") {
    const hasBlank = kept.some((attribute) => attribute === 'target="_blank"');
    if (hasBlank && !kept.some((attribute) => attribute.startsWith("rel="))) {
      kept.push('rel="noopener noreferrer"');
    }
  }

  return kept.length > 0 ? ` ${kept.join(" ")}` : "";
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
  // Le texte peut contenir des entités déjà valides : on les préserve.
  return value.replace(/&(?!#?[a-zA-Z0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Nettoie un contenu HTML et referme les balises restées ouvertes.
 *
 * Les balises interdites sont supprimées avec leur contenu lorsqu'il s'agit de
 * `script`, `style`, `iframe`, `object` ou `svg` ; pour les autres, seule la
 * balise disparaît, le texte utile étant conservé.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";

  const tokens = tokenize(input);
  const output: string[] = [];
  const stack: string[] = [];

  /** Profondeur d'imbrication dans un élément dont le contenu est jeté. */
  let dropDepth = 0;
  const DROP_CONTENT = new Set(["script", "style", "iframe", "object", "embed", "svg", "math", "noscript", "template"]);

  for (const token of tokens) {
    if (token.kind === "text") {
      if (dropDepth === 0) output.push(escapeText(token.value));
      continue;
    }

    if (token.kind === "open") {
      if (DROP_CONTENT.has(token.name)) {
        if (!token.selfClosing) dropDepth += 1;
        continue;
      }
      if (dropDepth > 0) continue;
      if (!ALLOWED_TAGS.has(token.name)) continue;

      const attributes = cleanAttributes(token.name, token.attributes);

      if (token.selfClosing || ["br", "hr", "img"].includes(token.name)) {
        output.push(`<${token.name}${attributes} />`);
        continue;
      }

      output.push(`<${token.name}${attributes}>`);
      stack.push(token.name);
      continue;
    }

    // Fermeture
    if (DROP_CONTENT.has(token.name)) {
      if (dropDepth > 0) dropDepth -= 1;
      continue;
    }
    if (dropDepth > 0) continue;
    if (!ALLOWED_TAGS.has(token.name)) continue;

    const index = stack.lastIndexOf(token.name);
    if (index === -1) continue;

    // Referme au passage les balises laissées ouvertes à l'intérieur.
    for (let position = stack.length - 1; position >= index; position -= 1) {
      output.push(`</${stack[position]}>`);
    }
    stack.length = index;
  }

  while (stack.length > 0) {
    output.push(`</${stack.pop()}>`);
  }

  return output.join("").trim();
}

/** Assainit récursivement les chaînes HTML d'une charge utile de bloc. */
export function sanitizeBlockData(value: unknown): unknown {
  if (typeof value === "string") {
    // Une chaîne ne contenant aucune balise est laissée intacte.
    return /<[a-zA-Z/]/.test(value) ? sanitizeHtml(value) : value;
  }
  if (Array.isArray(value)) return value.map(sanitizeBlockData);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        sanitizeBlockData(nested),
      ]),
    );
  }
  return value;
}
