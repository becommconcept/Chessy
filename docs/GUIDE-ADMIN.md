# Guide de l'espace mairie

Ce guide s'adresse aux agents et aux élus qui alimentent le site. Il ne suppose
aucune connaissance technique.

---

## Se connecter

Rendez-vous sur **`/admin`** (ou cliquez sur « Espace mairie » en bas de
n'importe quelle page du site). Saisissez l'adresse électronique et le mot de
passe qui vous ont été communiqués.

Trois rôles existent, avec des accès différents :

| Rôle                | Ce qu'il peut faire                                                             |
| ------------------- | ------------------------------------------------------------------------------- |
| **Administrateur**  | Tout, y compris les paramètres du site et la gestion des comptes                |
| **Éditeur**         | Les contenus : pages, actualités, agenda, médias, annuaires, salles et matériel |
| **Agent d'accueil** | Les demandes des habitants : messages, signalements, réservations, prêts        |

Toutes vos actions sont enregistrées dans le journal, avec votre nom et
l'horodatage. Ce n'est pas de la surveillance : c'est ce qui permet de retrouver
qui a modifié quoi, et de restaurer sereinement en cas d'erreur.

---

## Le tableau de bord

C'est votre point de départ. Il affiche en haut ce qui **attend une action de
votre part** : réservations à instruire, prêts à accorder, signalements
nouveaux. En dessous, les demandes récentes, l'état des contenus et les
dernières actions effectuées par vos collègues.

Si les quatre indicateurs sont au vert, il n'y a rien à traiter.

---

## Modifier une page du site

### Le principe

Une page est une **pile de sections** — appelées blocs. Un bandeau en haut, un
texte, une grille de cartes, une galerie photos, un formulaire… Vous les
ajoutez, les déplacez, les masquez ou les supprimez librement.

### En pratique

1. **Pages du site** dans le menu de gauche, puis **Modifier** sur la page
   voulue.
2. À gauche s'affiche la liste des sections. Cliquez sur l'une d'elles : son
   formulaire apparaît à droite.
3. Modifiez, puis **Enregistrer et publier** en haut à droite.

### Les actions sur une section

Elles apparaissent au survol d'une section dans la liste de gauche :

| Icône                 | Action                                                          |
| --------------------- | --------------------------------------------------------------- |
| Poignée à gauche      | Glisser pour déplacer la section                                |
| Flèches haut / bas    | Déplacer d'un cran (accessible au clavier)                      |
| Œil                   | Masquer la section sans la supprimer                            |
| Double page           | Dupliquer la section                                            |
| Corbeille             | Supprimer la section                                            |
| **+** entre deux sections | Insérer une nouvelle section à cet endroit précis           |

### Les trois onglets de l'éditeur

- **Contenu et mise en page** — les sections et leur contenu.
- **Réglages de la page** — titre, adresse, rubrique parente, image de
  rubrique, ordre d'affichage, présence dans les menus.
- **Référencement** — titre et description affichés dans les résultats de
  recherche, avec un aperçu de ce que verra un internaute sur Google.

### Brouillon ou publication

- **Brouillon** : la page n'est pas visible du public, n'apparaît ni dans les
  menus, ni dans la recherche, ni dans le plan du site. Idéal pour préparer une
  page tranquillement.
- **Publier** : la page devient visible immédiatement.

### Revenir en arrière

Avant une modification importante, allez dans **Réglages de la page** →
**Versions** → **Enregistrer une version**. Vous pourrez y revenir. Les vingt
dernières versions de chaque page sont conservées.

---

## Écrire un texte qui se lit bien

L'éditeur de texte propose les outils utiles et pas davantage : paragraphe,
titre de niveau 2, titre de niveau 3, gras, italique, listes, citation, lien.

Quelques règles qui changent tout :

- **Découpez avec des intertitres.** Un bloc de dix lignes sans respiration
  n'est pas lu. Trois intertitres transforment la même information en quelque
  chose de consultable.
- **L'essentiel d'abord.** L'habitant cherche une réponse, pas un récit
  chronologique.
- **Écrivez comme vous parlez à l'accueil.** « Vous devez apporter » plutôt que
  « le requérant produira ». « Il faut compter un mois » plutôt que « le délai
  d'instruction est fixé à trente jours ».
- **N'utilisez pas le gras pour tout.** Si tout est en gras, plus rien ne
  ressort.
- **Le collage est nettoyé volontairement.** Coller depuis Word ne ramène que le
  texte : c'est ce qui garde le site homogène. Remettez ensuite en forme avec la
  barre d'outils.
- **N'utilisez pas de titre de niveau 1** dans le texte : il est déjà porté par
  le titre de la page.

Le bouton **Code HTML** existe pour les cas particuliers (tableau complexe,
mise en forme spécifique). En cas de doute, ne l'utilisez pas.

---

## Les images

### Ajouter une image

Depuis n'importe quel champ image, ou depuis **Médiathèque** dans le menu.
Glissez vos fichiers dans la zone prévue, ou cliquez pour les choisir.

Formats acceptés : JPEG, PNG, WebP, GIF jusqu'à 6 Mo, et PDF jusqu'à 20 Mo.

### Le texte alternatif : le renseigner systématiquement

Chaque image doit avoir un **texte alternatif** : une courte phrase qui décrit
ce que l'image montre. Les personnes qui utilisent un lecteur d'écran n'ont que
cela pour comprendre l'image, et c'est une obligation légale (RGAA).

- ✅ « La salle des fêtes aménagée pour un repas de famille »
- ❌ « photo1.jpg », « image », « salle »

La médiathèque signale les images sans texte alternatif : traitez-les.

### Poids des images

Une photographie sortie d'un appareil pèse souvent 5 à 8 Mo, alors que 300 Ko
suffisent à l'écran. Redimensionnez à 1600 pixels de large avant de téléverser :
le site sera nettement plus rapide, en particulier sur téléphone.

---

## Publier une actualité

**Actualités** → **Nouvelle actualité**.

- **Titre** — précis et informatif. « Travaux rue du Bourg : circulation
  modifiée » plutôt que « Information travaux ».
- **Chapeau** — deux ou trois phrases. C'est ce qui s'affiche dans les listes,
  sur la page d'accueil et dans le flux RSS. S'il est vide, il est généré
  automatiquement, mais un chapeau rédigé est toujours meilleur.
- **Article** — le texte complet, avec des intertitres.
- **Image de couverture** — format paysage, au moins 1200 × 675 pixels.
- **Rubrique** — pour que les habitants puissent filtrer.
- **Épingler à la une** — l'article reste en tête de liste quelle que soit sa
  date. À réserver aux informations importantes, et à retirer ensuite.

---

## Tenir l'agenda

**Agenda** → **Nouvel évènement**. Les champs importants :

- **Début** et **fin** — la fin peut rester vide pour un évènement ponctuel.
  Cochez « toute la journée » pour masquer les horaires.
- **Lieu** et **adresse** — le lieu s'affiche partout, l'adresse sert au plan.
- **Association organisatrice** — rattache l'évènement à sa fiche.
- **Type de manifestation** — détermine la couleur dans le calendrier.

Chaque évènement publié devient téléchargeable au format iCalendar : les
habitants l'ajoutent à l'agenda de leur téléphone en un clic.

---

## Traiter une réservation de salle

**Réservations de salle** dans le menu. Le compteur doré indique le nombre de
demandes en attente.

### Comprendre les états

| État                | Ce que ça signifie                                                              |
| ------------------- | ------------------------------------------------------------------------------- |
| **En attente**      | Déposée. Le créneau est **déjà bloqué** dans le calendrier public.               |
| **Pré-réservée**    | Vous avez posé une option, en attendant une pièce justificative.                 |
| **Confirmée**       | Réservation ferme. L'usager est prévenu par courriel.                            |
| **Refusée**         | Le créneau est libéré immédiatement. L'usager est prévenu.                       |
| **Annulée**         | Idem, à la demande de l'usager ou de la commune.                                 |

**Point important** : une demande en attente bloque déjà le créneau. Personne
d'autre ne peut le demander. Traitez donc les demandes régulièrement, sinon des
créneaux restent immobilisés pour rien.

### La marche à suivre

1. Ouvrez la demande. Si un bandeau doré signale une **demande concurrente** sur
   le même créneau, arbitrez d'abord entre les deux.
2. Vérifiez la situation déclarée : c'est elle qui détermine le tarif. La grille
   tarifaire de la salle est rappelée en bas à droite.
3. Ajustez le tarif ou la caution si nécessaire — les montants sont en
   **centimes** : 30000 correspond à 300 €.
4. Choisissez la décision, rédigez le **message au demandeur** (il est envoyé
   par courriel : indiquez les modalités de remise des clés et les pièces à
   fournir), puis enregistrez.

La **note interne** n'est jamais transmise à l'usager : utilisez-la pour le
suivi entre agents.

### Bloquer des dates

**Salles et matériel** → **Périodes de fermeture**. Travaux, élections,
manifestation municipale : les dates bloquées disparaissent du calendrier
public.

---

## Traiter un prêt de matériel

**Prêts de matériel**. Le cycle complet :

**En attente** → **Accordé** (l'usager est prévenu) → **Matériel retiré** le
jour du départ → **Restitué** au retour.

Marquez bien les deux dernières étapes : c'est ce qui garde le stock affiché aux
habitants exact. Un matériel encore marqué « sorti » n'est pas proposé à un
autre demandeur.

La fiche de la demande affiche, pour chaque article, le **stock restant
disponible hors cette demande** : en vert si la quantité suffit, en rouge sinon.

Au retrait, vérifiez l'attestation d'assurance et comptez le matériel devant le
demandeur. Notez tout défaut constaté dans la note interne.

---

## Traiter un signalement ou un message

**Messages et signalements**. Les signalements de voirie, d'éclairage et d'eau
arrivent automatiquement en **priorité haute**.

La fiche affiche le message, la photographie et la localisation exacte, avec un
lien pour ouvrir le point dans OpenStreetMap.

Vous pouvez :

- changer l'**état** (nouveau, en cours, traité, clos) ;
- **affecter** la demande à un agent ;
- écrire une **note interne** (entreprise contactée, date d'intervention) ;
- **répondre au déposant** : votre réponse part par courriel et s'affiche dans
  sa page de suivi. La demande passe automatiquement « en cours ».

### Un signalement qui ne relève pas de la commune

Route départementale, réseau électrique, éclairage sous contrat, conteneurs
intercommunaux : transférez au gestionnaire compétent, **puis répondez au
déposant** en le lui indiquant. Une réponse claire vaut toujours mieux qu'un
silence, même quand la commune ne peut pas intervenir.

---

## Publier un bandeau d'alerte

**Bandeaux d'alerte** → **Nouveau bandeau**. Le message s'affiche en haut de
toutes les pages du site.

Trois niveaux :

- **Information** (bleu) — une nouveauté, un rappel.
- **Vigilance** (doré) — une gêne temporaire : travaux, coupure programmée.
- **Urgence** (rouge) — une situation qui demande une réaction immédiate.

L'internaute peut masquer une information ou une vigilance, **pas une urgence**.
Réservez donc le rouge aux situations qui le justifient : un bandeau d'urgence
permanent n'est plus lu.

Renseignez une **date de fin** : le bandeau disparaît tout seul, et vous
n'oublierez pas de le retirer.

---

## Les annuaires

- **Associations** — le renseignement le plus demandé par les habitants est le
  **contact** et le **créneau d'activité**. Le plus efficace pour compléter
  l'annuaire : envoyer à chaque président la liste des champs par courriel, et
  saisir sa réponse.
- **Élus** — ne publiez que ce qui relève de la fonction : nom, intitulé,
  délégations, adresse de fonction. Jamais le téléphone personnel ni l'adresse
  du domicile.
- **Équipements** — renseignez la latitude et la longitude, sinon l'équipement
  n'apparaît pas sur le plan. Relevez-les sur openstreetmap.org : clic droit sur
  le point, « Afficher l'adresse ».
- **Fiches démarches** — vérifiez **chaque année** les liens vers les
  téléservices nationaux et les montants réglementaires : ce sont eux qui
  vieillissent le plus vite. Un lien mort génère immédiatement des appels.
- **Documents** — avant de téléverser un PDF, vérifiez qu'il ne contient pas de
  données personnelles à occulter, et privilégiez un PDF avec texte
  sélectionnable plutôt qu'un scan d'image.

---

## Les menus

**Menus de navigation**. Quatre menus se règlent ici :

- **Menu principal** — les rubriques du haut de page. Une entrée de premier
  niveau devient une rubrique du grand menu déroulant ; ses entrées filles
  s'affichent dans le panneau, avec description et icône.
- **Services en ligne** — les services mis en avant sur mobile.
- **Trois colonnes du pied de page**.

Cochez **« mise en avant »** pour faire ressortir une entrée sur fond doré : à
réserver aux services en ligne.

---

## Paramètres du site

Réservé aux administrateurs. Huit groupes de réglages : identité de la commune,
coordonnées, horaires d'ouverture, réseaux sociaux, pied de page, apparence,
services en ligne, référencement.

Les **horaires** alimentent l'en-tête (avec l'indicateur « ouvert / fermé »
calculé en temps réel), le pied de page et la page de contact. Séparez plusieurs
plages horaires par un point-virgule, laissez vide pour un jour de fermeture.

---

## En cas de doute

- **J'ai supprimé une section par erreur** — ne rechargez pas la page et
  n'enregistrez pas : quittez l'éditeur, les modifications non enregistrées sont
  perdues et la page reprend son état précédent. Si vous avez déjà enregistré,
  restaurez une version dans **Réglages de la page** → **Versions**.
- **Je ne trouve plus une page** — elle est peut-être en brouillon. Le filtre
  est en haut de la liste des pages.
- **Une modification n'apparaît pas sur le site** — vérifiez que la page est
  bien publiée, puis rechargez en forçant l'actualisation (Ctrl+F5, ou Cmd+Maj+R
  sur Mac).
- **Je ne sais pas si je peux publier quelque chose** — demandez à l'élu
  délégué à la communication. Un contenu retiré après publication laisse
  toujours une trace.
