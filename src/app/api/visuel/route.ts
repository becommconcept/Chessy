import { NextRequest } from "next/server";

/**
 * Générateur d'illustrations SVG.
 *
 * Le site est livré avec des visuels de démonstration produits à la volée :
 * aucune dépendance externe, aucun fichier lourd dans le dépôt, et un rendu
 * cohérent avec la charte (azurite et pierres dorées). La mairie remplace
 * ensuite chaque visuel par une photographie réelle depuis la médiathèque du
 * back-office, sans toucher au code.
 *
 * Exemple : /api/visuel?scene=village&seed=patrimoine&w=1600&h=900
 */

type Scene = "village" | "paysage" | "mine" | "salle" | "abstrait" | "portrait";

const SCENES: Scene[] = ["village", "paysage", "mine", "salle", "abstrait", "portrait"];

/** Générateur pseudo-aléatoire déterministe (mulberry32) : même graine, même image. */
function makeRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = {
  azur: { sky1: "#0B2E4F", sky2: "#14507F", far: "#1C6390", mid: "#256F97", near: "#0E3D62" },
  aube: { sky1: "#F4D9A8", sky2: "#E3A55E", far: "#B07A3C", mid: "#8A5D33", near: "#4A3722" },
  vigne: { sky1: "#DCEBE4", sky2: "#A9CBBC", far: "#5E9C82", mid: "#3C7A61", near: "#23503F" },
  pierre: { sky1: "#FBF1DE", sky2: "#EFD9AE", far: "#D8B87C", mid: "#C68A2E", near: "#8C601F" },
} as const;

type PaletteKey = keyof typeof PALETTES;

function pickPalette(scene: Scene, rnd: () => number): PaletteKey {
  if (scene === "mine") return "azur";
  if (scene === "salle") return "pierre";
  const keys: PaletteKey[] = ["azur", "aube", "vigne", "pierre"];
  return keys[Math.floor(rnd() * keys.length)];
}

/** Silhouette de collines : une courbe lissée sur toute la largeur. */
function hills(w: number, baseY: number, amplitude: number, rnd: () => number): string {
  const points: string[] = [];
  const steps = 7;
  for (let i = 0; i <= steps; i += 1) {
    const x = (w / steps) * i;
    const y = baseY - Math.sin((i / steps) * Math.PI) * amplitude * (0.6 + rnd() * 0.6);
    points.push(`${x.toFixed(0)},${y.toFixed(0)}`);
  }
  return points.join(" ");
}

function sceneVillage(w: number, h: number, p: (typeof PALETTES)[PaletteKey], rnd: () => number): string {
  const ground = h * 0.78;
  const houses: string[] = [];
  let x = w * 0.06;
  while (x < w * 0.94) {
    const width = w * (0.07 + rnd() * 0.06);
    const height = h * (0.16 + rnd() * 0.2);
    const y = ground - height;
    const roof = height * 0.22;
    houses.push(
      `<g opacity="${(0.85 + rnd() * 0.15).toFixed(2)}">
        <rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${width.toFixed(0)}" height="${height.toFixed(0)}" fill="${p.far}" rx="2"/>
        <polygon points="${(x - width * 0.08).toFixed(0)},${y.toFixed(0)} ${(x + width / 2).toFixed(0)},${(y - roof).toFixed(0)} ${(x + width * 1.08).toFixed(0)},${y.toFixed(0)}" fill="${p.near}"/>
        <rect x="${(x + width * 0.2).toFixed(0)}" y="${(y + height * 0.3).toFixed(0)}" width="${(width * 0.18).toFixed(0)}" height="${(height * 0.22).toFixed(0)}" fill="#FBF1DE" opacity="0.55"/>
        <rect x="${(x + width * 0.6).toFixed(0)}" y="${(y + height * 0.3).toFixed(0)}" width="${(width * 0.18).toFixed(0)}" height="${(height * 0.22).toFixed(0)}" fill="#FBF1DE" opacity="0.4"/>
      </g>`,
    );
    x += width * (1.05 + rnd() * 0.25);
  }
  // Clocher de l'église
  const towerX = w * (0.36 + rnd() * 0.24);
  const towerW = w * 0.055;
  const towerH = h * 0.46;
  const towerY = ground - towerH;
  return `
    <polygon points="0,${h} 0,${(ground - h * 0.06).toFixed(0)} ${hills(w, ground - h * 0.04, h * 0.08, rnd)} ${w},${(ground - h * 0.06).toFixed(0)} ${w},${h}" fill="${p.mid}" opacity="0.35"/>
    ${houses.join("")}
    <g>
      <rect x="${towerX.toFixed(0)}" y="${towerY.toFixed(0)}" width="${towerW.toFixed(0)}" height="${towerH.toFixed(0)}" fill="${p.near}" rx="2"/>
      <polygon points="${(towerX - towerW * 0.25).toFixed(0)},${towerY.toFixed(0)} ${(towerX + towerW / 2).toFixed(0)},${(towerY - h * 0.11).toFixed(0)} ${(towerX + towerW * 1.25).toFixed(0)},${towerY.toFixed(0)}" fill="${p.near}"/>
      <circle cx="${(towerX + towerW / 2).toFixed(0)}" cy="${(towerY + towerH * 0.22).toFixed(0)}" r="${(towerW * 0.22).toFixed(0)}" fill="#FBF1DE" opacity="0.7"/>
    </g>
    <rect x="0" y="${ground.toFixed(0)}" width="${w}" height="${(h - ground).toFixed(0)}" fill="${p.near}"/>
  `;
}

function scenePaysage(w: number, h: number, p: (typeof PALETTES)[PaletteKey], rnd: () => number): string {
  const rows: string[] = [];
  const ground = h * 0.62;
  for (let i = 0; i < 9; i += 1) {
    const y = ground + ((h - ground) / 9) * i;
    const offset = (i % 2 === 0 ? 1 : -1) * w * 0.03 * rnd();
    rows.push(
      `<path d="M ${-w * 0.1} ${y.toFixed(0)} Q ${(w / 2 + offset).toFixed(0)} ${(y - h * 0.05).toFixed(0)} ${(w * 1.1).toFixed(0)} ${y.toFixed(0)}" stroke="${i % 2 === 0 ? p.mid : p.near}" stroke-width="${(2 + i * 1.4).toFixed(1)}" fill="none" opacity="${(0.35 + i * 0.06).toFixed(2)}"/>`,
    );
  }
  return `
    <circle cx="${(w * (0.68 + rnd() * 0.2)).toFixed(0)}" cy="${(h * 0.22).toFixed(0)}" r="${(h * 0.09).toFixed(0)}" fill="#FBF1DE" opacity="0.55"/>
    <polygon points="0,${h} 0,${(ground + h * 0.02).toFixed(0)} ${hills(w, ground, h * 0.16, rnd)} ${w},${(ground + h * 0.02).toFixed(0)} ${w},${h}" fill="${p.far}" opacity="0.75"/>
    <polygon points="0,${h} 0,${(ground + h * 0.09).toFixed(0)} ${hills(w, ground + h * 0.07, h * 0.1, rnd)} ${w},${(ground + h * 0.09).toFixed(0)} ${w},${h}" fill="${p.mid}"/>
    ${rows.join("")}
  `;
}

function sceneMine(w: number, h: number, p: (typeof PALETTES)[PaletteKey], rnd: () => number): string {
  const crystals: string[] = [];
  for (let i = 0; i < 14; i += 1) {
    const cx = w * (0.08 + rnd() * 0.84);
    const cy = h * (0.2 + rnd() * 0.7);
    const size = h * (0.03 + rnd() * 0.07);
    const rotate = Math.floor(rnd() * 360);
    crystals.push(
      `<g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)}) rotate(${rotate})" opacity="${(0.25 + rnd() * 0.5).toFixed(2)}">
        <polygon points="0,${(-size).toFixed(0)} ${(size * 0.62).toFixed(0)},${(-size * 0.3).toFixed(0)} ${(size * 0.4).toFixed(0)},${(size * 0.8).toFixed(0)} ${(-size * 0.4).toFixed(0)},${(size * 0.8).toFixed(0)} ${(-size * 0.62).toFixed(0)},${(-size * 0.3).toFixed(0)}" fill="#2A7BB8"/>
        <polygon points="0,${(-size).toFixed(0)} ${(size * 0.62).toFixed(0)},${(-size * 0.3).toFixed(0)} 0,${(size * 0.2).toFixed(0)}" fill="#4FA3D8" opacity="0.8"/>
      </g>`,
    );
  }
  // Voûte de galerie
  const archW = w * 0.34;
  const archH = h * 0.6;
  const archX = w / 2 - archW / 2;
  const archY = h - archH;
  return `
    ${crystals.join("")}
    <path d="M ${archX.toFixed(0)} ${h} L ${archX.toFixed(0)} ${(archY + archH * 0.4).toFixed(0)} Q ${(w / 2).toFixed(0)} ${(archY - archH * 0.12).toFixed(0)} ${(archX + archW).toFixed(0)} ${(archY + archH * 0.4).toFixed(0)} L ${(archX + archW).toFixed(0)} ${h} Z" fill="#061B2E" opacity="0.85"/>
    <path d="M ${(archX + archW * 0.14).toFixed(0)} ${h} L ${(archX + archW * 0.14).toFixed(0)} ${(archY + archH * 0.46).toFixed(0)} Q ${(w / 2).toFixed(0)} ${(archY + archH * 0.02).toFixed(0)} ${(archX + archW * 0.86).toFixed(0)} ${(archY + archH * 0.46).toFixed(0)} L ${(archX + archW * 0.86).toFixed(0)} ${h} Z" fill="#2A7BB8" opacity="0.18"/>
    <rect x="0" y="${(h * 0.94).toFixed(0)}" width="${w}" height="${(h * 0.06).toFixed(0)}" fill="${p.near}"/>
  `;
}

function sceneSalle(w: number, h: number, p: (typeof PALETTES)[PaletteKey], rnd: () => number): string {
  const tables: string[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const cx = w * (0.16 + col * 0.23) + (row % 2) * w * 0.03;
      const cy = h * (0.56 + row * 0.14);
      const rx = w * (0.055 - row * 0.006);
      tables.push(
        `<g opacity="${(0.55 + rnd() * 0.35).toFixed(2)}">
          <ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.42).toFixed(0)}" fill="#FBF1DE" opacity="0.85"/>
          <ellipse cx="${cx.toFixed(0)}" cy="${(cy + rx * 0.12).toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.42).toFixed(0)}" fill="${p.mid}" opacity="0.35"/>
        </g>`,
      );
    }
  }
  const windows: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const x = w * (0.1 + i * 0.22);
    windows.push(
      `<g><rect x="${x.toFixed(0)}" y="${(h * 0.12).toFixed(0)}" width="${(w * 0.13).toFixed(0)}" height="${(h * 0.3).toFixed(0)}" rx="${(w * 0.065).toFixed(0)}" fill="#FBF1DE" opacity="0.5"/>
      <rect x="${(x + w * 0.062).toFixed(0)}" y="${(h * 0.12).toFixed(0)}" width="2" height="${(h * 0.3).toFixed(0)}" fill="${p.near}" opacity="0.35"/></g>`,
    );
  }
  return `
    <rect x="0" y="${(h * 0.46).toFixed(0)}" width="${w}" height="${(h * 0.54).toFixed(0)}" fill="${p.far}" opacity="0.4"/>
    ${windows.join("")}
    ${tables.join("")}
  `;
}

function sceneAbstrait(w: number, h: number, p: (typeof PALETTES)[PaletteKey], rnd: () => number): string {
  const shapes: string[] = [];
  for (let i = 0; i < 18; i += 1) {
    const cx = rnd() * w;
    const cy = rnd() * h;
    const r = h * (0.04 + rnd() * 0.22);
    const fill = [p.far, p.mid, p.near, "#FBF1DE"][Math.floor(rnd() * 4)];
    shapes.push(
      rnd() > 0.45
        ? `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${(0.08 + rnd() * 0.22).toFixed(2)}"/>`
        : `<rect x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" width="${(r * 1.6).toFixed(0)}" height="${(r * 1.6).toFixed(0)}" rx="${(r * 0.3).toFixed(0)}" fill="${fill}" opacity="${(0.08 + rnd() * 0.18).toFixed(2)}" transform="rotate(${Math.floor(rnd() * 60)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`,
    );
  }
  return shapes.join("");
}

function scenePortrait(w: number, h: number, p: (typeof PALETTES)[PaletteKey]): string {
  const cx = w / 2;
  const headR = Math.min(w, h) * 0.17;
  const headY = h * 0.36;
  return `
    <circle cx="${cx.toFixed(0)}" cy="${headY.toFixed(0)}" r="${headR.toFixed(0)}" fill="#FBF1DE" opacity="0.55"/>
    <path d="M ${(cx - headR * 2).toFixed(0)} ${h} Q ${cx.toFixed(0)} ${(headY + headR * 0.9).toFixed(0)} ${(cx + headR * 2).toFixed(0)} ${h} Z" fill="#FBF1DE" opacity="0.4"/>
    <rect x="0" y="${(h * 0.9).toFixed(0)}" width="${w}" height="${(h * 0.1).toFixed(0)}" fill="${p.near}" opacity="0.4"/>
  `;
}

function buildSvg(options: {
  scene: Scene;
  seed: string;
  width: number;
  height: number;
  label?: string;
}): string {
  const { scene, seed, width: w, height: h, label } = options;
  const rnd = makeRandom(`${scene}:${seed}`);
  const paletteKey = pickPalette(scene, rnd);
  const p = PALETTES[paletteKey];

  const body =
    scene === "village"
      ? sceneVillage(w, h, p, rnd)
      : scene === "paysage"
        ? scenePaysage(w, h, p, rnd)
        : scene === "mine"
          ? sceneMine(w, h, p, rnd)
          : scene === "salle"
            ? sceneSalle(w, h, p, rnd)
            : scene === "portrait"
              ? scenePortrait(w, h, p)
              : sceneAbstrait(w, h, p, rnd);

  const caption = label
    ? `<g><rect x="0" y="${(h - h * 0.16).toFixed(0)}" width="${w}" height="${(h * 0.16).toFixed(0)}" fill="#0B2E4F" opacity="0.45"/>
        <text x="${(w * 0.04).toFixed(0)}" y="${(h - h * 0.055).toFixed(0)}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="${Math.max(13, Math.round(h * 0.055))}" font-weight="600" fill="#FFFFFF" opacity="0.92">${escapeXml(label)}</text></g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${escapeXml(label ?? "Illustration")}">
  <defs>
    <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.sky1}"/>
      <stop offset="100%" stop-color="${p.sky2}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.6" fill="#FFFFFF" opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#ciel)"/>
  <rect width="${w}" height="${h}" fill="url(#halo)"/>
  ${body}
  <rect width="${w}" height="${h}" fill="url(#grain)"/>
  ${caption}
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sceneParam = params.get("scene") ?? "abstrait";
  const scene = (SCENES as string[]).includes(sceneParam) ? (sceneParam as Scene) : "abstrait";
  const seed = params.get("seed") ?? scene;
  const width = clamp(Number(params.get("w") ?? 1600) || 1600, 80, 3000);
  const height = clamp(Number(params.get("h") ?? 900) || 900, 80, 3000);
  const label = params.get("label") ?? undefined;

  const svg = buildSvg({ scene, seed, width, height, label });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
