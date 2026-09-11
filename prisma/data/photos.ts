/**
 * Photographies réelles de la commune.
 *
 * Contrairement aux visuels générés par `/api/visuel`, ces fichiers sont de
 * véritables photographies déposées dans `public/photos/`. Ils sont versionnés
 * avec le projet et chargés dans la médiathèque à l'installation, ce qui permet
 * de les réutiliser depuis le back-office sur n'importe quelle page.
 *
 * Les métadonnées EXIF ont été retirées avant intégration : elles contiennent
 * fréquemment la position GPS et le modèle d'appareil.
 */

export type Photo = {
  /** Clé stable, utilisée pour référencer la photo depuis les pages. */
  key: string;
  filename: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  folder: string;
};

export const PHOTOS: Photo[] = [
  {
    key: "eglise",
    filename: "eglise-de-chessy.jpg",
    url: "/photos/eglise-de-chessy.jpg",
    width: 2000,
    height: 1500,
    alt: "L'église de Chessy-les-Mines en pierres dorées, son auvent d'entrée et sa croix de pierre, avec la tour du château en arrière-plan",
    credit: "Commune de Chessy-les-Mines",
    folder: "patrimoine",
  },
  {
    key: "rues",
    filename: "rues-du-village.jpg",
    url: "/photos/rues-du-village.jpg",
    width: 1920,
    height: 1080,
    alt: "Ruelle du vieux bourg de Chessy-les-Mines bordée de maisons en pierres dorées, lanternes de fer forgé et façades fleuries",
    credit: "Commune de Chessy-les-Mines",
    folder: "village",
  },
  {
    key: "chateau",
    filename: "chateau-de-chessy.jpg",
    url: "/photos/chateau-de-chessy.jpg",
    width: 640,
    height: 480,
    alt: "Le château de Chessy-les-Mines, ses mâchicoulis et sa tour, éclairés par le soleil de fin de journée",
    credit: "Commune de Chessy-les-Mines",
    folder: "patrimoine",
  },
];

export const PHOTO_BY_KEY = new Map(PHOTOS.map((p) => [p.key, p]));

/** Référence d'image prête à être posée dans les données d'un bloc. */
export function photo(key: string): { url: string; alt: string } {
  const found = PHOTO_BY_KEY.get(key);
  if (!found) throw new Error(`Photographie inconnue : ${key}`);
  return { url: found.url, alt: found.alt };
}
