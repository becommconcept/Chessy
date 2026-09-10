# Mise en production

Liste des opérations à mener avant d'ouvrir le site au public, classées par
nature. Les points marqués **bloquant** ne doivent pas être reportés.

---

## 1. Contenus à compléter

| À faire                                                                                          | Où                                   | Bloquant |
| ------------------------------------------------------------------------------------------------ | ------------------------------------ | :------: |
| Renseigner les **noms des élus** (seul le maire est renseigné ; les autres portent la mention « Élu·e à compléter ») | `/admin/elus`                        |    ✅    |
| Remplacer le **texte d'accueil du maire** sur la page du conseil municipal                        | `/admin/pages` → Le conseil municipal |    ✅    |
| Collecter et saisir les **coordonnées des associations**                                          | `/admin/associations`                |          |
| Remplacer les **visuels de démonstration** par des photographies réelles                          | `/admin/medias`                      |    ✅    |
| Téléverser les **vrais documents** (bulletins, comptes rendus, PLU, règlements)                   | `/admin/documents`                   |    ✅    |
| Compléter l'**annuaire des commerces**                                                            | `/admin/pages` → Commerces et artisans |          |
| Vérifier chaque **lien vers un téléservice national** et chaque montant réglementaire             | `/admin/demarches`                   |    ✅    |
| Vérifier les **coordonnées et horaires** de la mairie                                             | `/admin/parametres`                  |    ✅    |
| Renseigner les **liens de réseaux sociaux** si la commune en a                                    | `/admin/parametres` → Réseaux sociaux |          |

Les documents PDF installés sont des **documents de démonstration** générés
automatiquement : ils rendent les liens de téléchargement fonctionnels, mais
n'ont aucune valeur. Remplacez-les avant l'ouverture.

---

## 2. Mentions légales et conformité

| À faire                                                                          | Où                                        | Bloquant |
| -------------------------------------------------------------------------------- | ----------------------------------------- | :------: |
| Renseigner l'**hébergeur** (raison sociale, adresse, téléphone)                   | page « Mentions légales »                  |    ✅    |
| Renseigner le **délégué à la protection des données**                             | page « Données personnelles »              |    ✅    |
| Faire réaliser un **audit RGAA** par un prestataire qualifié                       | prestataire externe                        |    ✅    |
| Publier la **déclaration d'accessibilité** issue de l'audit                        | page « Accessibilité »                     |    ✅    |
| Inscrire les traitements au **registre RGPD** de la collectivité                   | registre interne                           |    ✅    |
| Vérifier les **crédits photographiques** de chaque image publiée                   | `/admin/medias`                            |          |

Le tableau des traitements de données figure déjà en page « Données
personnelles » : vérifiez qu'il correspond bien aux usages retenus, et
complétez-le si de nouveaux services sont activés.

**Sur l'accessibilité.** Le socle technique est en place (voir
`ARCHITECTURE.md`), mais une déclaration de conformité ne peut être établie
qu'après audit par un tiers. C'est une obligation légale pour une collectivité,
et un audit révèle systématiquement des points d'amélioration sur les contenus
eux-mêmes — textes alternatifs, hiérarchie des titres, contrastes d'images.

---

## 3. Sécurité

| À faire                                                                           | Bloquant |
| --------------------------------------------------------------------------------- | :------: |
| **Changer les mots de passe** des trois comptes de démonstration                   |    ✅    |
| **Supprimer** les comptes qui ne correspondent à aucune personne réelle             |    ✅    |
| Définir un **`AUTH_SECRET`** long et aléatoire, distinct de celui de développement  |    ✅    |
| Créer un compte **nominatif par agent**, jamais de compte partagé                   |    ✅    |
| Servir le site **exclusivement en HTTPS**, avec redirection depuis HTTP             |    ✅    |
| Mettre en place une **sauvegarde quotidienne** de la base et du dossier `public/uploads` |    ✅    |
| Vérifier la restauration d'une sauvegarde au moins une fois                          |    ✅    |

Un mot de passe partagé entre agents annule l'intérêt du journal d'audit : plus
aucune action n'est rattachable à une personne.

Générer une clé de session :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## 4. Technique

### Base de données

SQLite convient à une commune de cette taille, mais **PostgreSQL est recommandé
en production** : sauvegardes à chaud, accès concurrents, outillage
d'exploitation.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
npx prisma migrate deploy
```

Aucun code applicatif n'est à modifier : les énumérations sont stockées en texte
précisément pour permettre cette bascule.

### Variables d'environnement

```env
DATABASE_URL="postgresql://…"          # ou file:./prod.db
AUTH_SECRET="<48 octets aléatoires>"
NEXT_PUBLIC_SITE_URL="https://www.chessy69.fr"

SMTP_HOST="…"
SMTP_PORT="587"
SMTP_USER="…"
SMTP_PASSWORD="…"
SMTP_FROM="Mairie de Chessy-les-Mines <ne-pas-repondre@chessy69.fr>"
MAIRIE_NOTIFY_EMAIL="accueil@chessy69.fr"
```

### Envoi de courriels

Sans configuration SMTP, les messages sont **journalisés dans la console** du
serveur : la démonstration se déroule intégralement, mais aucun courriel ne part.

Branchez le transporteur retenu par la collectivité dans `src/lib/notify.ts` —
la fonction `sendMail` est le seul point à compléter, son interface ne change
pas. Prévoyez une adresse d'expédition sur le domaine de la commune, avec les
enregistrements SPF et DKIM correspondants : sans cela, les courriels partent en
indésirables.

### Stockage des fichiers

Les téléversements vont dans `public/uploads/`. Sur un hébergement où le système
de fichiers n'est pas persistant (conteneurs éphémères, fonctions serverless),
il faut basculer vers un stockage objet : seule la fonction `saveUpload` de
`src/lib/upload.ts` est concernée.

### Reprise du référencement

Si les adresses des pages changent par rapport au site actuel, mettez en place
des **redirections permanentes** (301) depuis les anciennes URL. Sans cela, le
référencement acquis est perdu et les liens partagés par les habitants tombent
en erreur. Les anciennes adresses connues sont de la forme
`/cadre-de-vie/patrimoine/`, `/la-mairie-a-votre-service/demarches/…`,
`/vivre-a-chessy/famille/…`, `/les_associations/…`, `/reservation-salle-des-fetes/`.

Déclarez ensuite le site dans les outils pour webmasters et soumettez
`/sitemap.xml`.

---

## 5. Avant l'ouverture : vérifications

```bash
npm run typecheck                          # aucune erreur de typage
npm run build                              # compilation de production
npx tsx scripts/verifier-assainissement.ts # filtre XSS : 14 cas
```

À vérifier manuellement :

- [ ] Parcourir le site **au clavier seul** (Tab, Entrée, Échap) : le lien
      d'évitement, les menus, les formulaires et les boîtes de dialogue doivent
      être utilisables.
- [ ] Ouvrir le site sur un **téléphone réel**, pas seulement en simulation.
- [ ] Tester les **trois services en ligne** de bout en bout, jusqu'au courriel
      d'accusé de réception.
- [ ] Tester le **suivi de demande** avec une référence obtenue.
- [ ] Vérifier le **thème sombre** et le **contraste renforcé**.
- [ ] Vérifier l'affichage à **200 % de zoom**.
- [ ] Contrôler le rendu d'une **fiche démarche à l'impression**.
- [ ] Faire tester le back-office par **un agent qui n'a pas participé au
      projet** : c'est le seul moyen fiable de repérer ce qui n'est pas clair.

---

## 6. Après la mise en ligne

- **Former les agents** sur `docs/GUIDE-ADMIN.md`, en séance courte et en
  situation réelle.
- **Désigner un référent** du site, et un suppléant.
- **Fixer un rythme de publication** : une actualité par quinzaine suffit, à
  condition de s'y tenir. Un site abandonné après trois mois fait plus de mal
  qu'un site sobre tenu à jour.
- **Prévoir une revue annuelle** des fiches démarches et de l'annuaire des
  associations : c'est ce qui vieillit le plus vite.
- **Surveiller les demandes en attente** : une réservation non instruite bloque
  un créneau dans le calendrier public.
