# Site de la commune de Chessy-les-Mines

Refonte complète du site municipal de **Chessy-les-Mines** (Rhône, 69380) : site
public moderne et responsive, back-office permettant à la mairie de tout
modifier elle-même, et trois services en ligne qui font gagner du temps aux
agents — réservation de salle, prêt de matériel, signalement dans l'espace
public.

> **Statut du dépôt.** Il s'agit d'une proposition complète et fonctionnelle,
> destinée à être présentée à la mairie. Le contenu installé reprend
> l'arborescence et les informations publiques du site actuel ; tout est
> modifiable depuis le back-office, sans intervention technique.

**Aperçus** : [`apercus/`](apercus/) — captures du site public, des trois
services en ligne et du back-office, sur ordinateur et sur téléphone.

---

## Démarrage en une commande

```bash
npm run setup     # installe, prépare la base SQLite et charge le contenu
npm run dev       # démarre le site sur http://localhost:3000
```

| Adresse                          | Contenu                                    |
| -------------------------------- | ------------------------------------------ |
| <http://localhost:3000>          | Le site public                             |
| <http://localhost:3000/admin>    | Le back-office (« espace mairie »)         |

**Comptes de démonstration** — mot de passe commun `chessy2026` :

| Adresse                        | Rôle              | Accès                                              |
| ------------------------------ | ----------------- | -------------------------------------------------- |
| `admin@chessy69.fr`            | Administrateur    | Tout, y compris paramètres et comptes              |
| `communication@chessy69.fr`    | Éditeur           | Contenus, médias, annuaires, demandes              |
| `accueil@chessy69.fr`          | Agent d'accueil   | Demandes, réservations et prêts uniquement         |

Autres commandes utiles :

```bash
npm run build        # compilation de production
npm run start        # sert la version compilée
npm run typecheck    # vérification TypeScript
npm run db:reset     # réinitialise la base et recharge le contenu de démonstration
```

---

## Ce que le site propose

### Côté habitants

**Un site complet.** 31 pages, organisées en cinq rubriques : La mairie,
Démarches, Vivre à Chessy, Cadre de vie et patrimoine, Actualités. Toutes les
sections du site actuel sont reprises et enrichies — conseil municipal, budget,
comptes rendus, CCAS, intercommunalité, petite enfance, écoles, aînés, santé,
commerces, transports, urbanisme, eau, déchets, environnement, patrimoine
minier.

**13 fiches démarches** avec, pour chacune, le public concerné, les pièces à
fournir, le délai, le coût et le lien direct vers le téléservice national quand
il existe.

**Trois services en ligne** qui vont plus loin qu'un formulaire de contact :

- **Réservation de salle** — calendrier des disponibilités réelles, tarif et
  caution calculés automatiquement selon la situation du demandeur, dépôt en
  quatre étapes, référence de suivi immédiate.
- **Prêt de matériel** — catalogue de 14 références avec le stock réellement
  disponible aux dates choisies, panier, caution calculée.
- **Signalement dans l'espace public** — catégorie, photographie, localisation
  sur un plan, transmission directe aux services techniques.

**Un suivi de demande** accessible avec une référence et une clé : l'habitant
sait où en est son dossier sans rappeler la mairie.

**Le reste** : actualités avec rubriques et flux RSS, agenda avec calendrier
mensuel et export iCalendar, annuaire des 14 associations, carte des
équipements, recherche interne sur l'ensemble des contenus, lettre
d'information, bandeaux d'alerte, plan du site.

### Côté mairie

Le back-office couvre l'ensemble de la vie du site :

- **Éditeur de pages par blocs** — 28 types de sections (bandeau, texte,
  cartes, chiffres clés, frise, galerie, onglets, tarifs, listes dynamiques…)
  que l'on ajoute, réordonne par glisser-déposer, masque, duplique ou supprime.
  Chaque page dispose d'un historique de versions restaurable.
- **Éditeur de texte enrichi** avec mode source HTML, collage nettoyé et
  assainissement systématique du balisage.
- **Médiathèque** avec téléversement par glisser-déposer, dossiers, texte
  alternatif et détection des fichiers non utilisés.
- **Actualités et agenda**, avec brouillons, épinglage et mises en avant.
- **Traitement des demandes** — réservations, prêts et signalements instruits
  au même endroit, avec courriel automatique à chaque décision, fil de
  discussion avec l'usager, affectation à un agent et note interne.
- **Annuaires** — associations, élus, équipements, fiches démarches, documents.
- **Inventaire** — salles, créneaux, grilles tarifaires, périodes de fermeture,
  stock de matériel.
- **Constructeur de menus**, paramètres du site, comptes utilisateurs à trois
  rôles, et **journal d'audit** horodaté de toutes les actions.

---

## Choix techniques

| Élément            | Choix                                          | Raison                                                                 |
| ------------------ | ---------------------------------------------- | ---------------------------------------------------------------------- |
| Cadre applicatif   | Next.js 15 (App Router), React 19, TypeScript  | Rendu serveur, pages pré-générées, un seul déploiement                 |
| Styles             | Tailwind CSS 4                                 | Charte centralisée, thème sombre et réglages d'accessibilité natifs    |
| Base de données    | Prisma + SQLite (PostgreSQL en production)     | Installation immédiate, migration sans changement de code              |
| Authentification   | Session signée (JWT `jose`) + `bcryptjs`       | Aucune dépendance à un service tiers                                   |
| Illustrations      | Générateur SVG interne (`/api/visuel`)         | Site illustré dès l'installation, sans dépôt d'images lourdes          |
| Cartographie       | Plan schématique dessiné à partir des données  | Aucun traceur tiers, fonctionne hors ligne, conforme RGPD              |
| Courriels          | Interface `sendMail` à brancher                | Journalisés en console sans configuration : la démonstration est complète |

**Aucun service extérieur n'est appelé** au chargement d'une page du site : ni
police distante, ni fond de carte, ni bibliothèque de statistiques. C'est un
choix assumé — il simplifie la conformité RGPD et rend le site rapide même sur
une connexion médiocre.

---

## Documentation

| Document                                                     | Pour qui                                        |
| ------------------------------------------------------------ | ----------------------------------------------- |
| [`docs/GUIDE-ADMIN.md`](docs/GUIDE-ADMIN.md)                 | Les agents et élus qui alimenteront le site     |
| [`docs/FONCTIONNALITES-SUGGEREES.md`](docs/FONCTIONNALITES-SUGGEREES.md) | La mairie : 24 pistes d'évolution chiffrées     |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)               | Développeurs : structure du code                |
| [`docs/MISE-EN-PRODUCTION.md`](docs/MISE-EN-PRODUCTION.md)   | Avant l'ouverture au public : RGAA, RGPD, à faire |

---

## Points à compléter avant mise en production

Ces éléments sont volontairement laissés en attente : ils supposent des
informations que seule la mairie détient, ou des décisions qui lui appartiennent.

1. **Noms des élus** autres que le maire — les fiches portent la mention « Élu·e
   à compléter ». Aucun nom n'a été inventé.
2. **Coordonnées des associations** — courriels, téléphones et référents sont à
   collecter auprès des présidents.
3. **Photographies** — les visuels livrés sont des illustrations générées,
   à remplacer par les photographies de la commune depuis la médiathèque.
4. **Documents PDF** — les fichiers installés sont des documents de
   démonstration ; les bulletins et comptes rendus réels doivent être téléversés.
5. **Mots de passe** des trois comptes de démonstration, à changer
   impérativement, et suppression des comptes inutiles.
6. **Hébergeur, délégué à la protection des données et audit RGAA** — à
   renseigner dans les pages légales.
7. **Envoi de courriels** — brancher le serveur SMTP de la collectivité dans
   `src/lib/notify.ts`.

Le détail figure dans [`docs/MISE-EN-PRODUCTION.md`](docs/MISE-EN-PRODUCTION.md).
