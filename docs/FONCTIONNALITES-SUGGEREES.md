# Fonctionnalités complémentaires — pistes d'évolution

Ce document propose 24 évolutions au-delà de ce qui est déjà livré. Chacune est
présentée avec ce qu'elle apporte, à qui, et l'effort qu'elle représente.

L'ordre n'est pas anodin : les premières sections sont celles qui font
**gagner le plus de temps aux agents** par euro investi. Une commune de 2 000
habitants n'a pas besoin de tout : elle a besoin de ce qui allège réellement le
travail de l'accueil et évite les allers-retours avec les habitants.

**Légende de l'effort** — 🟢 quelques jours · 🟡 une à deux semaines ·
🔴 un mois ou plus, ou dépendant d'un tiers.

---

## 1. Faire gagner du temps au personnel

### 1.1 Prise de rendez-vous avec créneaux réels 🟡

Aujourd'hui, une demande de rendez-vous arrive comme un message, et un agent
rappelle pour convenir d'une date. En publiant les créneaux réellement
disponibles par service (urbanisme, service de l'eau, CCAS, état civil), le
rendez-vous se prend directement.

**Gain** : suppression de la boucle téléphonique — en pratique 2 à 3 appels
évités par rendez-vous. **Mécanisme** : le socle existe déjà (le moteur de
créneaux des salles est réutilisable), il faut y ajouter des plages horaires
par agent et une synchronisation avec l'agenda professionnel (CalDAV ou
Microsoft 365).

### 1.2 Convention et facture générées automatiquement 🟡

À la confirmation d'une réservation de salle, produire le PDF de la convention
de mise à disposition et l'avis des sommes à payer, pré-remplis à partir de la
demande, prêts à signer.

**Gain** : le poste de saisie le plus répétitif du secrétariat général. Une
convention de salle représente aujourd'hui 15 à 20 minutes de ressaisie ; il en
resterait la relecture. **Mécanisme** : générateur PDF (le module
`prisma/lib/pdf.ts` livré montre le principe), modèles de documents éditables
depuis le back-office.

### 1.3 États des lieux sur tablette 🟡

Un formulaire d'état des lieux d'entrée et de sortie, rempli sur place depuis un
téléphone, avec photographies horodatées et signature au doigt. Rattaché
automatiquement à la réservation.

**Gain** : fin des feuilles papier perdues, et surtout **preuve incontestable**
en cas de litige sur la caution — le sujet le plus conflictuel de la location de
salle.

### 1.4 Portail « mon compte habitant » 🔴

Un espace personnel où l'habitant retrouve toutes ses démarches, ses
réservations passées, ses factures d'eau, et où ses coordonnées sont
pré-remplies. Idéalement avec **FranceConnect**, qui évite de gérer des mots de
passe et garantit l'identité.

**Gain** : moins de demandes incomplètes, moins de saisie pour l'agent.
**Attention** : c'est le chantier le plus lourd, et le plus exigeant en termes
de sécurité et de RGPD. À n'envisager qu'une fois les autres services rodés.

### 1.5 Rappels automatiques 🟢

Trois courriels ou SMS qui suppriment autant de relances manuelles :

- **J-7 avant un prêt de matériel** : rappel du retrait, du véhicule nécessaire
  et de l'attestation d'assurance à apporter.
- **J-3 avant une réservation de salle** : rappel des modalités de remise des
  clés et des pièces manquantes.
- **J+1 après un retour de matériel non enregistré** : alerte interne pour
  l'agent.

**Gain** : les oublis d'usagers sont la première cause de perte de temps sur ces
services.

### 1.6 Tableau de bord d'activité 🟢

Des indicateurs simples pour le conseil municipal et le rapport d'activité :
nombre de réservations par salle et par mois, taux d'occupation, matériel le
plus emprunté, délai moyen de traitement des signalements, répartition par
catégorie.

**Gain** : arbitrages budgétaires objectivés (faut-il racheter des barnums ?),
et un rapport d'activité qui s'écrit tout seul.

### 1.7 Export comptable 🟢

Un export CSV des locations facturables sur une période, au format attendu par
le logiciel de gestion financière de la collectivité.

**Gain** : suppression d'une double saisie mensuelle.

---

## 2. Simplifier la vie des habitants

### 2.1 Inscriptions scolaires et périscolaires en ligne 🔴

Le sujet le plus demandé dans les communes de cette taille : inscription
scolaire, réservation des repas de cantine à la semaine, inscription au
périscolaire, avec facturation au quotient familial.

**Attention** : à arbitrer avec l'existant. Un portail famille est déjà utilisé
pour le restaurant scolaire ; dupliquer la fonction créerait de la confusion. La
bonne piste est plutôt une **passerelle** : un point d'entrée unique sur le site
qui redirige proprement vers le portail existant, avec les explications autour.

### 2.2 Guichet unique de dépôt de pièces 🟡

Un espace où l'habitant dépose les justificatifs manquants d'un dossier
(attestation d'assurance, justificatif de domicile, statuts d'association) sans
passer par le courriel.

**Gain** : fin des pièces jointes égarées dans une boîte partagée, et
traçabilité de ce qui a été reçu et quand.

### 2.3 Paiement en ligne 🔴

Régler une location de salle, une caution ou une facture d'eau par carte, via le
dispositif **PayFiP** de la DGFiP — le seul autorisé pour une régie municipale.

**Gain** : encaissement immédiat, plus de chèques à porter en trésorerie.
**Attention** : convention avec la DGFiP obligatoire, et délais administratifs
non négligeables. À provisionner longtemps à l'avance.

### 2.4 Recherche améliorée avec tolérance aux fautes 🟢

La recherche actuelle est insensible aux accents et à la casse, mais pas aux
fautes de frappe. Un index plein texte (SQLite FTS5) apporterait la correction
approximative et la mise en évidence des termes trouvés.

**Gain** : « carte didentité », « cantinne », « azurit » trouvent la bonne page.

### 2.5 Assistant de démarche par questions 🟡

Plutôt que de lire une fiche, l'habitant répond à trois questions (« Que voulez-vous
faire ? », « Pour qui ? », « Où habitez-vous ? ») et obtient la seule
information qui le concerne, avec la liste exacte des pièces à réunir.

**Gain** : c'est ce qui réduit le plus les appels « je ne sais pas quel papier
apporter ».

### 2.6 Notifications par SMS 🟡

Pour les alertes vraiment urgentes (coupure d'eau non programmée, route
coupée), le SMS touche les habitants qui n'ont pas d'application ni de
messagerie consultée dans la journée — souvent les plus âgés.

**Attention** : nécessite un opérateur payant et un consentement explicite
recueilli séparément.

### 2.7 Version audio des actualités 🟢

Un lecteur qui lit l'article à voix haute, utile aux personnes malvoyantes,
dyslexiques ou simplement occupées. Réalisable avec la synthèse vocale du
navigateur, donc sans coût et sans envoi de données à un tiers.

### 2.8 Traduction des pages essentielles 🟢

Traduire une dizaine de pages en anglais suffit : les démarches d'état civil,
l'installation d'un nouvel habitant, le patrimoine et les informations
touristiques. Le Geopark attire des visiteurs étrangers.

---

## 3. Faire vivre le site et la commune

### 3.1 Espace pour les associations 🟡

Un accès restreint permettant à chaque président de mettre à jour lui-même la
fiche de son association, de proposer un évènement pour l'agenda et de suivre
ses réservations de salle.

**Gain** : l'annuaire cesse de vieillir, et le secrétariat n'est plus
l'intermédiaire de chaque correction. C'est probablement la meilleure évolution
« vie locale » du lot.

### 3.2 Budget participatif et consultations 🟡

Un module de dépôt d'idées, de vote et de suivi de réalisation. Même à petite
échelle — quelques milliers d'euros — cela crée une participation réelle et
donne une lecture concrète de l'action municipale.

### 3.3 Parcours de découverte du patrimoine minier 🟡

Chessy possède un atout rare : l'azurite dite *chessylite*, connue des
collectionneurs du monde entier, et deux mille ans d'histoire minière. Un
parcours géolocalisé avec points d'intérêt, photographies d'archives et
témoignages ferait de cette page patrimoine une véritable ressource
touristique, en lien avec le Geopark Beaujolais et l'AMAC.

**Gain** : visibilité touristique, et une matière pédagogique pour les écoles.

### 3.4 Annuaire des commerces et artisans 🟢

La page existe mais reste à alimenter. Un formulaire d'auto-inscription
soumis à validation permettrait de la constituer sans travail de saisie.

### 3.5 Petites annonces entre habitants 🟢

Covoiturage, dons d'objets, services entre voisins, recherche de jardin
partagé. À modérer, mais peu coûteux et générateur de visites régulières.

### 3.6 Archives du bulletin municipal 🟢

Numériser et indexer les anciens numéros de *Chessy Info* : une mémoire
communale consultable, et un contenu très recherché par les habitants de longue
date comme par les généalogistes.

---

## 4. Design et confort d'utilisation

### 4.1 Photographies professionnelles 🟢

**La priorité absolue** avant toute mise en ligne. Les visuels livrés sont des
illustrations générées : elles tiennent le site debout, mais rien ne remplace
une campagne photographique — le village en pierres dorées à la lumière de fin
de journée, l'église, les manifestations, les agents au travail. Prévoyez une
demi-journée de photographe et quelques prises aux quatre saisons.

### 4.2 Police Marianne 🟢

Le site est déjà configuré pour la typographie **Marianne**, celle de l'État. Il
suffit de déposer les fichiers de police dans le projet : le rendu devient
immédiatement plus institutionnel, sans aucun autre changement.

### 4.3 Vidéos courtes 🟢

Une minute de vidéo verticale explique une démarche mieux qu'une page de texte,
et se partage sur les réseaux. Le bloc vidéo est déjà disponible dans l'éditeur.

### 4.4 Mode « lecture facile » 🟡

Au-delà des réglages d'accessibilité déjà présents (taille du texte, contraste
renforcé, espacement, animations réduites), une version en **français facile à
lire et à comprendre** (FALC) des dix démarches principales rendrait le site
accessible aux personnes en situation de handicap mental et aux lecteurs peu à
l'aise avec l'écrit.

### 4.5 Application installable 🟢

Transformer le site en application installable sur l'écran d'accueil du
téléphone, avec consultation hors ligne des pages déjà visitées et notifications
d'alerte. Évite d'avoir à maintenir une application mobile distincte.

### 4.6 Bandeau d'urgence à activer en un geste 🟢

En cas de crise (inondation, coupure majeure, alerte sanitaire), un bouton
unique qui bascule le site en mode urgence : bandeau rouge, encart d'information
en tête de la page d'accueil, numéros utiles remontés partout.

**Gain** : dans l'urgence, personne n'a le temps de composer une page.

---

## Ordre de mise en œuvre suggéré

**Avant l'ouverture au public** — ce qui manque, pas ce qui embellit :
photographies (4.1), police Marianne (4.2), audit RGAA, contenus à compléter
(noms des élus, coordonnées des associations, documents réels).

**Premiers six mois** — les gains rapides et visibles : rappels automatiques
(1.5), tableau de bord (1.6), recherche tolérante aux fautes (2.4), espace
associations (3.1), bandeau d'urgence (4.6).

**Année suivante** — les chantiers structurants : prise de rendez-vous (1.1),
conventions automatiques (1.2), états des lieux sur tablette (1.3), guichet de
dépôt de pièces (2.2).

**Selon les moyens et les priorités politiques** : paiement PayFiP (2.3),
portail habitant et FranceConnect (1.4), budget participatif (3.2), parcours
patrimoine (3.3).

---

## Deux mises en garde

**Ne pas multiplier les points d'entrée.** Un habitant qui doit se souvenir
qu'il utilise un portail pour la cantine, un autre pour les salles et un
troisième pour les déchets finira par téléphoner — ce qui annule le gain de
temps recherché. Chaque nouveau service doit s'intégrer au site, ou être
clairement présenté comme une passerelle vers l'outil existant.

**Ne rien mettre en ligne qui ne sera pas tenu à jour.** Un annuaire des
commerces obsolète ou un agenda vide font plus de mal qu'une page absente : ils
apprennent à l'habitant que le site n'est pas fiable. Mieux vaut trois rubriques
tenues que dix abandonnées.
