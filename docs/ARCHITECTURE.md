# Architecture technique

## Vue d'ensemble

Application **Next.js 15** (App Router) en TypeScript strict, rendue côté
serveur, avec une base **Prisma / SQLite** (portable vers PostgreSQL sans
modification du code applicatif).

Trois espaces cohabitent dans la même application :

| Espace          | Chemin                    | Rendu                                                      |
| --------------- | ------------------------- | ---------------------------------------------------------- |
| Site public     | `src/app/(site)/`         | Pages pré-générées, revalidation par intervalle            |
| Back-office     | `src/app/admin/`          | Rendu à la demande, protégé par le middleware              |
| Interfaces      | `src/app/api/`            | Points d'entrée JSON pour les formulaires publics          |

## Arborescence

```
prisma/
  schema.prisma            Modèle de données (27 tables)
  seed.ts                  Installation du contenu initial
  data/                    Contenus de démonstration (référence, éditorial, pages)
  lib/pdf.ts               Générateur de PDF minimaliste (documents de démonstration)

src/
  app/
    (site)/                Site public
      page.tsx             Accueil (page « accueil » du gestionnaire de contenu)
      [...slug]/           Toutes les pages du gestionnaire de contenu
      actualites/          Liste, fiche, filtres, pagination
      agenda/              Calendrier mensuel, fiche, export iCalendar
      demarches/           Liste et fiches pratiques
      associations/        Annuaire et fiches
      services/            Réservation de salle, prêt de matériel, signalement
      contact, recherche, suivi, plan-du-site
    admin/                 Back-office (27 écrans)
      actions-*.ts         Actions serveur, regroupées par domaine
    api/                   recherche, demandes, réservations, téléversement, visuel
    connexion/             Authentification
    sitemap.ts, robots.ts, flux.xml, agenda.ics

  components/
    blocks/                Moteur de blocs : registre → rendu
    site/                  En-tête, pied de page, cartes, formulaires publics
    services/              Tunnels de réservation, de prêt et de signalement
    admin/                 Éditeur de blocs, éditeur de texte, médiathèque, tableaux
    ui/                    Primitives : boutons, champs, grilles, icônes

  lib/
    auth.ts, session.ts    Sessions signées, rôles, journal d'audit
    blocks.ts              Registre des 28 types de blocs et de leurs champs
    booking.ts             Règles de disponibilité des salles et du matériel
    sanitize.ts            Filtre XSS par liste blanche
    settings.ts            Réglages du site, avec valeurs de repli
    search.ts              Recherche interne
    enums.ts, utils.ts     Énumérations françaises et fonctions utilitaires

  styles/globals.css       Charte graphique, thème sombre, réglages d'accessibilité

scripts/
  generer-icones.mjs       Génère la table d'icônes depuis lucide-react
  verifier-assainissement.ts  Contrôle du filtre XSS (14 cas)
  session-de-test.ts       Cookie de session pour les vérifications automatisées
```

## Le moteur de blocs

C'est la pièce centrale du gestionnaire de contenu, et elle repose sur une seule
idée : **un type de bloc se décrit, il ne se programme pas deux fois**.

1. `src/lib/blocks.ts` déclare, pour chaque type de bloc, son libellé, sa
   description, son icône et **la liste de ses champs** (texte, texte enrichi,
   nombre, booléen, liste déroulante, média, répéteur imbriqué).
2. `src/components/admin/FieldRenderer.tsx` construit automatiquement le
   formulaire d'administration à partir de cette description. Aucun formulaire
   n'est écrit à la main.
3. `src/components/blocks/BlockRenderer.tsx` associe chaque type à son composant
   de rendu public.

Ajouter un bloc au site consiste donc à décrire ses champs et à écrire son
composant de rendu. Un type inconnu — contenu créé par une version plus récente
du back-office — est ignoré silencieusement côté public plutôt que de faire
échouer la page.

Les données d'un bloc sont stockées en JSON dans `Block.data`, assainies à
l'enregistrement (`sanitizeBlockData`) et relues avec `safeJson`, qui ne lève
jamais d'exception.

## Sécurité

| Risque                        | Traitement                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Injection de script (XSS)     | Filtre par liste blanche (`src/lib/sanitize.ts`), 14 cas de contrôle          |
| Accès non autorisé            | Middleware sur `/admin`, revalidation du compte à chaque page, gardes par rôle |
| Élévation de privilège        | Un administrateur ne peut ni se retirer ses droits ni se désactiver            |
| Téléversement malveillant     | Type déclaré ignoré, signature binaire vérifiée, nom régénéré, SVG refusé     |
| Dépôt anonyme abusif          | Téléversement limité par adresse et par fenêtre glissante                     |
| Divulgation de données        | Le suivi d'une demande exige référence **et** jeton aléatoire                 |
| Redirection ouverte           | Seules les redirections internes sont acceptées après connexion               |
| Falsification de tarif        | Disponibilité, créneau et tarif recalculés côté serveur à chaque dépôt        |
| Énumération de comptes        | Message d'erreur identique que le compte existe ou non, comparaison à temps constant |

## Accessibilité

Le socle est intégré au code, pas ajouté après coup : liens d'évitement,
structure sémantique, `aria-current` sur la navigation, motifs ARIA respectés
pour les onglets, accordéons, combobox de recherche et boîtes de dialogue,
libellés explicites sur tous les champs, anneau de focus visible et contrasté,
tableaux avec `caption` et en-têtes de ligne.

Le menu « Confort de lecture » ajoute cinq réglages conservés dans le navigateur
de l'internaute : thème clair/sombre/système, taille du texte sur trois niveaux,
contraste renforcé, espacement adapté à la dyslexie, réduction des animations.
La préférence système `prefers-reduced-motion` est respectée sans réglage.

## Performances

- Pages du gestionnaire de contenu **pré-générées** au build, revalidées par
  intervalle.
- Aucun appel réseau vers un tiers au chargement d'une page.
- Icônes importées nommément (table générée) plutôt qu'en bloc.
- Images matricielles servies par `next/image` (AVIF/WebP, chargement différé) ;
  les visuels SVG générés sont servis directement, l'optimiseur n'apportant rien
  sur ce format.
- Environ 102 Ko de JavaScript partagé sur l'ensemble du site.

## Passage en production

Voir [`MISE-EN-PRODUCTION.md`](MISE-EN-PRODUCTION.md).

Pour basculer sur PostgreSQL : changer `provider` dans `prisma/schema.prisma`,
ajuster `DATABASE_URL`, puis `prisma migrate deploy`. Aucun code applicatif à
modifier — les énumérations sont stockées en texte précisément pour cela.
