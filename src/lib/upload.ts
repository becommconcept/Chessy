import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/db";
import { randomToken, slugify } from "@/lib/utils";

/** Types acceptés, avec leur signature binaire de contrôle. */
const IMAGE_TYPES: Record<string, { extension: string; magic: number[][] }> = {
  "image/jpeg": { extension: "jpg", magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { extension: "png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  "image/webp": { extension: "webp", magic: [[0x52, 0x49, 0x46, 0x46]] },
  "image/gif": { extension: "gif", magic: [[0x47, 0x49, 0x46, 0x38]] },
};

const DOCUMENT_TYPES: Record<string, { extension: string; magic: number[][] }> = {
  "application/pdf": { extension: "pdf", magic: [[0x25, 0x50, 0x44, 0x46]] },
};

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 Mo
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024; // 20 Mo

export type UploadResult =
  | { ok: true; mediaId: string; url: string; mimeType: string; size: number }
  | { ok: false; error: string };

/**
 * Enregistre un fichier téléversé et crée son entrée de médiathèque.
 *
 * Le type déclaré par le navigateur n'est jamais cru sur parole : la signature
 * binaire du fichier est vérifiée, le nom est régénéré côté serveur, et
 * l'extension est déduite du type réel. Aucun fichier exécutable ni SVG (qui
 * peut porter du script) n'est accepté par cette voie.
 */
export async function saveUpload(input: {
  file: File;
  folder: string;
  alt?: string;
  credit?: string;
  uploadedById?: string | null;
  allow?: "images" | "documents" | "tous";
}): Promise<UploadResult> {
  const { file, folder } = input;
  const allow = input.allow ?? "images";

  if (!file || typeof file === "string") return { ok: false, error: "Aucun fichier reçu." };

  const catalogue =
    allow === "images"
      ? IMAGE_TYPES
      : allow === "documents"
        ? DOCUMENT_TYPES
        : { ...IMAGE_TYPES, ...DOCUMENT_TYPES };

  const declared = file.type.toLowerCase();
  const descriptor = catalogue[declared];
  if (!descriptor) {
    return {
      ok: false,
      error:
        allow === "documents"
          ? "Seuls les fichiers PDF sont acceptés."
          : "Format non accepté. Utilisez une image JPEG, PNG, WebP ou GIF.",
    };
  }

  const limit = declared === "application/pdf" ? MAX_DOCUMENT_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return {
      ok: false,
      error: `Fichier trop volumineux (${Math.round(file.size / 1024 / 1024)} Mo). Maximum autorisé : ${Math.round(limit / 1024 / 1024)} Mo.`,
    };
  }
  if (file.size === 0) return { ok: false, error: "Le fichier reçu est vide." };

  const buffer = Buffer.from(await file.arrayBuffer());

  const matchesMagic = descriptor.magic.some((signature) =>
    signature.every((byte, index) => buffer[index] === byte),
  );
  if (!matchesMagic) {
    return {
      ok: false,
      error: "Le contenu du fichier ne correspond pas à son format annoncé.",
    };
  }

  const safeFolder = slugify(folder) || "general";
  const directory = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(directory, { recursive: true });

  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "fichier";
  const filename = `${base.slice(0, 50)}-${randomToken(8)}.${descriptor.extension}`;
  await writeFile(path.join(directory, filename), buffer);

  const url = `/uploads/${safeFolder}/${filename}`;
  const dimensions = declared.startsWith("image/") ? readImageSize(buffer, declared) : null;

  const media = await prisma.media.create({
    data: {
      filename,
      url,
      mimeType: declared,
      size: buffer.byteLength,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
      alt: input.alt ?? "",
      credit: input.credit ?? null,
      folder: safeFolder,
      uploadedById: input.uploadedById ?? null,
    },
    select: { id: true },
  });

  return { ok: true, mediaId: media.id, url, mimeType: declared, size: buffer.byteLength };
}

/**
 * Lit les dimensions d'une image depuis ses premiers octets.
 *
 * Évite d'embarquer une bibliothèque de traitement d'image pour la seule
 * information dont l'affichage a besoin (ratio, attributs width/height).
 */
function readImageSize(buffer: Buffer, mimeType: string): { width: number; height: number } | null {
  try {
    if (mimeType === "image/png") {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }

    if (mimeType === "image/gif") {
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }

    if (mimeType === "image/jpeg") {
      let offset = 2;
      while (offset < buffer.length - 9) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        // Marqueurs SOF (hors DHT/DAC/DRI) portant les dimensions
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
      }
      return null;
    }

    if (mimeType === "image/webp") {
      // WebP simple (VP8X) : dimensions sur 24 bits, décrémentées de 1
      if (buffer.subarray(12, 16).toString("ascii") === "VP8X") {
        const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
        const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
        return { width, height };
      }
      return null;
    }
  } catch {
    return null;
  }
  return null;
}
