/**
 * Contrôle du filtre d'assainissement HTML.
 *
 * Lancé par `npx tsx scripts/verifier-assainissement.ts`, ce script vérifie
 * que les injections classiques sont neutralisées et que le balisage légitime
 * est préservé. Il sort en erreur si un cas échoue, ce qui permet de
 * l'intégrer à une chaîne d'intégration continue.
 */
import { sanitizeHtml } from "../src/lib/sanitize";

type Attendu = { doitContenir?: string[]; neDoitPasContenir?: string[] };

const CAS: Array<{ nom: string; entree: string; attendu: Attendu }> = [
  {
    nom: "texte enrichi légitime",
    entree: "<p>Bonjour <strong>Chessy</strong> et <em>bienvenue</em></p>",
    attendu: { doitContenir: ["<strong>", "<em>", "Bonjour"] },
  },
  {
    nom: "attribut événementiel",
    entree: '<p onclick="alert(1)">Clic</p>',
    attendu: { neDoitPasContenir: ["onclick", "alert"], doitContenir: ["<p>Clic</p>"] },
  },
  {
    nom: "script et son contenu",
    entree: "<script>alert(1)</script><p>Après</p>",
    attendu: { neDoitPasContenir: ["script", "alert"], doitContenir: ["<p>Après</p>"] },
  },
  {
    nom: "URL javascript:",
    entree: '<a href="javascript:alert(1)">Lien</a>',
    attendu: { neDoitPasContenir: ["javascript"], doitContenir: ["Lien"] },
  },
  {
    nom: "URL data: dans une image",
    entree: '<img src="data:text/html;base64,PHNjcmlwdD4=" alt="x">',
    attendu: { neDoitPasContenir: ["data:"] },
  },
  {
    nom: "lien externe protégé",
    entree: '<a href="https://exemple.fr" target="_blank">Lien</a>',
    attendu: { doitContenir: ['href="https://exemple.fr"', 'rel="noopener noreferrer"'] },
  },
  {
    nom: "iframe",
    entree: '<iframe src="https://exemple.fr"></iframe>Texte',
    attendu: { neDoitPasContenir: ["iframe"], doitContenir: ["Texte"] },
  },
  {
    nom: "svg contenant un script",
    entree: "<svg><script>alert(1)</script></svg>Texte",
    attendu: { neDoitPasContenir: ["svg", "script", "alert"], doitContenir: ["Texte"] },
  },
  {
    nom: "attribut style",
    entree: '<div style="position:fixed;top:0">x</div>',
    attendu: { neDoitPasContenir: ["style", "position"] },
  },
  {
    nom: "balises non fermées",
    entree: "<p>Non fermé <em>texte",
    attendu: { doitContenir: ["</em>", "</p>"] },
  },
  {
    nom: "tableau structuré",
    entree: '<table><tbody><tr><th scope="col">A</th><td colspan="2">B</td></tr></tbody></table>',
    attendu: { doitContenir: ['scope="col"', 'colspan="2"', "<table>"] },
  },
  {
    nom: "entités déjà échappées",
    entree: "<p>a &amp; b &lt; c</p>",
    attendu: { doitContenir: ["&amp;", "&lt;"] },
  },
  {
    nom: "chevron mal formé",
    entree: '<p>3 < 5</p><img src=x onerror=alert(1)>',
    attendu: { neDoitPasContenir: ["onerror", "alert(1)"] },
  },
  {
    nom: "casse mélangée et espaces",
    entree: '<ScRiPt >alert(1)</ScRiPt><P>ok</P>',
    attendu: { neDoitPasContenir: ["alert"], doitContenir: ["ok"] },
  },
];

let echecs = 0;

for (const cas of CAS) {
  const sortie = sanitizeHtml(cas.entree);
  const problemes: string[] = [];

  for (const attendu of cas.attendu.doitContenir ?? []) {
    if (!sortie.includes(attendu)) problemes.push(`absent : « ${attendu} »`);
  }
  for (const interdit of cas.attendu.neDoitPasContenir ?? []) {
    if (sortie.toLowerCase().includes(interdit.toLowerCase())) {
      problemes.push(`présent alors qu'interdit : « ${interdit} »`);
    }
  }

  if (problemes.length === 0) {
    console.log(`  ✓ ${cas.nom}`);
  } else {
    echecs += 1;
    console.error(`  ✗ ${cas.nom}`);
    console.error(`      entrée : ${cas.entree}`);
    console.error(`      sortie : ${sortie}`);
    for (const probleme of problemes) console.error(`      → ${probleme}`);
  }
}

console.log(
  echecs === 0
    ? `\n✓ ${CAS.length} cas d'assainissement vérifiés.`
    : `\n✗ ${echecs} cas en échec sur ${CAS.length}.`,
);
process.exit(echecs === 0 ? 0 : 1);
