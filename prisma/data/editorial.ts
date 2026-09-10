/**
 * Contenus éditoriaux de démonstration : actualités, agenda, documents,
 * alertes. Les dates sont calculées par rapport au jour d'installation afin
 * que la démonstration reste toujours à jour.
 */
import { visuel } from "./reference";

export const NEWS_CATEGORIES = [
  { slug: "vie-municipale", name: "Vie municipale", color: "#14507F", order: 0 },
  { slug: "travaux", name: "Travaux et voirie", color: "#C68A2E", order: 1 },
  { slug: "enfance-jeunesse", name: "Enfance et jeunesse", color: "#1E7A5F", order: 2 },
  { slug: "vie-associative", name: "Vie associative", color: "#8A4FA0", order: 3 },
  { slug: "environnement", name: "Cadre de vie", color: "#2F8F7A", order: 4 },
  { slug: "culture-patrimoine", name: "Culture et patrimoine", color: "#B4562A", order: 5 },
];

function daysFromNow(days: number, hour = 9, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minutes, 0, 0);
  return date;
}

export function buildNews() {
  return [
    {
      slug: "reservez-la-salle-des-fetes-en-ligne",
      title: "La réservation de la salle des fêtes se fait désormais en ligne",
      excerpt:
        "Consultez les disponibilités en temps réel, calculez votre tarif et déposez votre demande en cinq minutes, sans passer par l'accueil.",
      categorySlug: "vie-municipale",
      cover: visuel("salle", "reservation-en-ligne", "Salle des fêtes"),
      featured: true,
      pinned: true,
      publishedAt: daysFromNow(-2, 10),
      content:
        "<p>La commune met en service un <strong>nouveau téléservice de réservation</strong> pour la salle des fêtes et la salle des associations. Le calendrier affiche les créneaux réellement disponibles, le tarif est calculé automatiquement selon votre situation, et vous recevez une référence de suivi dès le dépôt de votre demande.</p><h3>Comment ça marche ?</h3><ol><li>Choisissez la salle et le créneau souhaité dans le calendrier.</li><li>Indiquez votre situation : association de Chessy, habitant, association extérieure ou entreprise. Le tarif et la caution s'affichent instantanément.</li><li>Complétez vos coordonnées et précisez la nature de la manifestation.</li><li>Vous recevez un accusé de réception avec votre référence. Le secrétariat instruit la demande et vous informe de la décision.</li></ol><p>La réservation reste <strong>soumise à validation</strong> par la mairie : le dépôt en ligne pose une option sur le créneau, il ne vaut pas confirmation. Les pièces justificatives (assurance, justificatif de domicile) sont à remettre avant la remise des clés.</p><p>Le formulaire papier reste disponible à l'accueil pour celles et ceux qui préfèrent la démarche en présentiel.</p>",
    },
    {
      slug: "travaux-rue-du-bourg",
      title: "Travaux de réfection de la rue du Bourg : circulation modifiée",
      excerpt:
        "Les travaux de reprise de la chaussée et des trottoirs se déroulent sur trois semaines. Une déviation est mise en place aux heures de chantier.",
      categorySlug: "travaux",
      cover: visuel("village", "travaux-bourg", "Travaux de voirie"),
      featured: true,
      pinned: false,
      publishedAt: daysFromNow(-6, 14),
      content:
        "<p>Les travaux de réfection de la rue du Bourg débutent la semaine prochaine pour une durée prévisionnelle de <strong>trois semaines</strong>, sous réserve des conditions météorologiques.</p><h3>Ce qui change pour vous</h3><ul><li>La circulation est alternée par feux tricolores de 8h à 17h.</li><li>Le stationnement est interdit sur la section en travaux ; un stationnement provisoire est ouvert sur le parking de la salle des fêtes.</li><li>La collecte des déchets est assurée : sortez vos bacs en début de rue.</li><li>L'accès aux riverains et aux services de secours est maintenu en permanence.</li></ul><p>Ces travaux comprennent la reprise de la structure de chaussée, la mise en conformité des trottoirs pour l'accessibilité, l'enfouissement partiel des réseaux et le renouvellement de l'éclairage public par des luminaires à LED.</p><p>Nous vous remercions de votre compréhension pour la gêne occasionnée. Pour toute difficulté, contactez les services techniques.</p>",
    },
    {
      slug: "inscriptions-scolaires-2027",
      title: "Inscriptions scolaires : la campagne s'ouvre en janvier",
      excerpt:
        "Votre enfant fait sa première rentrée ou change d'école ? Les inscriptions à l'école publique La Chessylite débutent en janvier.",
      categorySlug: "enfance-jeunesse",
      cover: visuel("abstrait", "inscriptions-scolaires", "Inscriptions scolaires"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-11, 9),
      content:
        "<p>La campagne d'inscription à l'école publique <strong>La Chessylite</strong> s'ouvre au mois de janvier pour la rentrée suivante. Elle concerne les enfants nés en 2024 pour une première entrée en petite section, ainsi que tout enfant nouvellement arrivé sur la commune.</p><h3>Deux étapes</h3><p><strong>1. En mairie.</strong> Présentez-vous à l'accueil avec le livret de famille, un justificatif de domicile de moins de trois mois et le carnet de santé de l'enfant. Un dossier vous est remis.</p><p><strong>2. À l'école.</strong> Prenez rendez-vous avec la direction pour finaliser l'admission et découvrir les locaux.</p><p>Pensez également à inscrire votre enfant au <strong>restaurant scolaire</strong> et à l'<strong>accueil périscolaire</strong> : ces services nécessitent une inscription distincte sur le portail famille.</p>",
    },
    {
      slug: "azurite-de-chessy-exposition",
      title: "L'azurite de Chessy à l'honneur : une exposition à ne pas manquer",
      excerpt:
        "La chessylite, variété d'azurite découverte ici au XIXe siècle, compte parmi les plus belles du monde. L'AMAC lui consacre une exposition.",
      categorySlug: "culture-patrimoine",
      cover: visuel("mine", "azurite-exposition", "Azurite de Chessy"),
      featured: true,
      pinned: false,
      publishedAt: daysFromNow(-16, 11),
      content:
        "<p>Il y a une raison pour laquelle les collectionneurs du monde entier connaissent le nom de notre commune : c'est ici, au début du XIXe siècle, qu'a été identifiée une variété d'azurite si remarquable qu'elle a reçu le nom de <strong>chessylite</strong>.</p><h3>Deux mille ans d'exploitation</h3><p>Le cuivre de Chessy a été extrait dès l'époque romaine, puis les galeries ont été remises en activité à partir du XVe siècle sous l'impulsion de Jacques Cœur. Plusieurs filons ont été exploités successivement — la mine noire, la mine jaune — chacun livrant un minerai différent.</p><p>La découverte de la <strong>Mine Bleue</strong> a ouvert une période de prospérité entre 1811 et 1828 : c'est de cette veine que proviennent les cristaux d'azurite aujourd'hui exposés dans les grands musées de minéralogie.</p><h3>Une exposition et des sorties</h3><p>L'Association Minéralogique de L'Arbresle et Chessy-les-Mines (AMAC) présente une sélection de pièces, explique la formation du gisement et propose des sorties commentées sur le terrain. Un rendez-vous idéal en famille, dans le cadre du <strong>Geopark Beaujolais</strong>.</p>",
    },
    {
      slug: "panneau-pocket-alertes",
      title: "PanneauPocket : recevez les alertes de la commune sur votre téléphone",
      excerpt:
        "Coupure d'eau, alerte météo, information de dernière minute : l'application vous prévient gratuitement, sans inscription.",
      categorySlug: "vie-municipale",
      cover: visuel("abstrait", "panneau-pocket", "Alertes municipales"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-21, 16),
      content:
        "<p>La commune diffuse ses informations urgentes via l'application <strong>PanneauPocket</strong>, gratuite et sans création de compte. Téléchargez-la, recherchez « Chessy-les-Mines », placez la commune en favori : vous recevez une notification à chaque nouvelle publication.</p><p>L'application est utilisée pour les coupures d'eau ou d'électricité, les alertes météorologiques, les modifications de collecte des déchets, les fermetures exceptionnelles de services et les rappels d'échéances.</p><p>Ces mêmes messages sont désormais également repris dans le <strong>bandeau d'alerte</strong> en haut de ce site.</p>",
    },
    {
      slug: "budget-primitif-oriente-vers-l-ecole",
      title: "Budget primitif : la priorité donnée à l'école et à la sobriété énergétique",
      excerpt:
        "Le conseil municipal a adopté le budget primitif. Les investissements portent sur la rénovation thermique des bâtiments communaux.",
      categorySlug: "vie-municipale",
      cover: visuel("abstrait", "budget-primitif", "Budget communal"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-30, 10),
      content:
        "<p>Le conseil municipal a adopté le budget primitif de la commune. Il traduit trois priorités : la <strong>qualité de l'accueil des enfants</strong>, la <strong>maîtrise des dépenses de fonctionnement</strong> et la <strong>rénovation énergétique du patrimoine bâti</strong>.</p><h3>Principaux investissements</h3><ul><li>Rénovation thermique de l'école : isolation, menuiseries, ventilation.</li><li>Remplacement de l'éclairage public par des luminaires à LED, avec abaissement nocturne.</li><li>Réfection de voirie et mise en accessibilité des cheminements.</li><li>Renouvellement du matériel prêté aux associations.</li></ul><p>Le détail du budget, la note de présentation brève et synthétique ainsi que les comptes rendus du conseil municipal sont consultables dans l'espace documents de ce site.</p>",
    },
    {
      slug: "fleurissement-et-zero-phyto",
      title: "Fleurissement : la commune poursuit sa démarche zéro phyto",
      excerpt:
        "Plantations vivaces, prairies fleuries et gestion différenciée : le point sur les choix faits pour nos espaces verts.",
      categorySlug: "environnement",
      cover: visuel("paysage", "fleurissement", "Espaces verts"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-38, 15),
      content:
        "<p>Depuis l'interdiction des produits phytosanitaires dans les espaces publics, les agents communaux ont fait évoluer leurs pratiques : <strong>paillage</strong>, <strong>plantes couvre-sol</strong>, <strong>désherbage mécanique</strong> et <strong>gestion différenciée</strong> des espaces selon leur usage.</p><p>Concrètement, certaines zones sont tondues moins souvent pour favoriser la biodiversité, des prairies fleuries remplacent des gazons peu fréquentés, et les massifs privilégient des vivaces adaptées à la sécheresse estivale.</p><p>Quelques herbes spontanées apparaissent au pied des murs : ce n'est pas un défaut d'entretien, c'est le résultat d'un choix assumé, meilleur pour la ressource en eau et pour les pollinisateurs. Les habitants peuvent contribuer en entretenant le trottoir devant chez eux.</p>",
    },
    {
      slug: "forum-des-associations",
      title: "Forum des associations : trouvez votre activité pour l'année",
      excerpt:
        "Sport, musique, danse, arts martiaux, patrimoine, solidarité : toutes les associations de Chessy vous accueillent.",
      categorySlug: "vie-associative",
      cover: visuel("village", "forum-associations", "Forum des associations"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-45, 9),
      content:
        "<p>Le forum des associations réunit les bénévoles qui font vivre la commune toute l'année. C'est le moment idéal pour découvrir les activités proposées, poser vos questions et vous inscrire directement auprès des responsables.</p><p>Plus d'une dizaine d'associations sont présentes : école de musique, danse, arts martiaux, boule lyonnaise, aéromodélisme, minéralogie, entraide aux aînés, sou des écoles, comité des fêtes…</p><p>Vous souhaitez donner un coup de main ? La plupart des associations recherchent des bénévoles, même ponctuellement. L'annuaire complet est disponible sur ce site.</p>",
    },
    {
      slug: "collecte-des-dechets-nouveau-calendrier",
      title: "Collecte des déchets : le nouveau calendrier est disponible",
      excerpt:
        "Bacs gris et bacs jaunes, déchèterie, encombrants : retrouvez les jours de collecte et les consignes de tri.",
      categorySlug: "environnement",
      cover: visuel("abstrait", "collecte-dechets", "Collecte des déchets"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-52, 8),
      content:
        "<p>La collecte des déchets ménagers est assurée à l'échelle intercommunale. Sortez vos bacs la veille au soir et rentrez-les dès le passage effectué.</p><h3>Bien trier</h3><ul><li><strong>Bac jaune</strong> : emballages, papiers, cartonnettes, briques alimentaires, bouteilles et flacons en plastique, boîtes métalliques.</li><li><strong>Bac gris</strong> : ordures ménagères résiduelles.</li><li><strong>Colonnes à verre</strong> : bouteilles, bocaux et pots, sans bouchon ni couvercle.</li><li><strong>Déchèterie</strong> : encombrants, déchets verts, gravats, déchets dangereux, appareils électriques.</li></ul><p>Les dépôts sauvages sont passibles d'une amende. Si vous en constatez un, signalez-le via le formulaire de signalement de ce site : les services techniques intervienn"+"ent sous 48 heures ouvrées.</p>",
    },
    {
      slug: "conseil-municipal-des-enfants",
      title: "Le conseil municipal des enfants installe ses nouveaux élus",
      excerpt:
        "Les jeunes conseillers ont pris leurs fonctions et travaillent déjà sur leurs premiers projets pour la commune.",
      categorySlug: "enfance-jeunesse",
      cover: visuel("abstrait", "cme", "Conseil municipal des enfants"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-60, 17),
      content:
        "<p>Élus par leurs camarades, les jeunes conseillères et conseillers du <strong>conseil municipal des enfants</strong> ont été officiellement installés en mairie. Le CME est une école de citoyenneté : les enfants apprennent à formuler une idée, à la défendre, à composer avec un budget et à mener un projet jusqu'au bout.</p><p>Parmi les pistes de travail retenues cette année : l'aménagement de la cour de récréation, une action en faveur de la propreté du village, une boîte à livres et une rencontre intergénérationnelle avec les aînés de la commune.</p>",
    },
    {
      slug: "urbanisme-guichet-numerique",
      title: "Urbanisme : déposez vos autorisations en ligne",
      excerpt:
        "Déclaration préalable, permis de construire, certificat d'urbanisme : le dépôt dématérialisé est désormais possible.",
      categorySlug: "vie-municipale",
      cover: visuel("village", "urbanisme", "Urbanisme"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-68, 11),
      content:
        "<p>Les demandes d'autorisation d'urbanisme peuvent être déposées <strong>par voie dématérialisée</strong>. Vous suivez l'avancement de votre dossier, recevez les courriers d'instruction et transmettez les pièces complémentaires sans déplacement.</p><p>Avant de constituer votre dossier, deux réflexes utiles : consultez le <strong>plan local d'urbanisme</strong> pour connaître les règles applicables à votre parcelle, et sollicitez un rendez-vous avec le service urbanisme, qui vous évitera bien des allers-retours.</p><p>Les fiches pratiques de ce site détaillent, pour chaque type de travaux, le formulaire à utiliser, les pièces à joindre et le délai d'instruction.</p>",
    },
    {
      slug: "registre-canicule-personnes-vulnerables",
      title: "Registre des personnes vulnérables : pensez à vous inscrire",
      excerpt:
        "Le CCAS tient un registre confidentiel permettant de prendre des nouvelles des personnes fragiles en cas de canicule ou de grand froid.",
      categorySlug: "vie-municipale",
      cover: visuel("abstrait", "registre-ccas", "Registre du CCAS"),
      featured: false,
      pinned: false,
      publishedAt: daysFromNow(-80, 10),
      content:
        "<p>Le centre communal d'action sociale tient un <strong>registre nominatif confidentiel</strong> des personnes âgées, isolées ou en situation de handicap. En cas de déclenchement d'un plan d'alerte — canicule, grand froid, épisode sanitaire —, la commune contacte les personnes inscrites pour s'assurer que tout va bien.</p><p>L'inscription est <strong>volontaire et gratuite</strong>. Elle peut être faite par la personne elle-même, par un proche ou par un professionnel de santé, à l'accueil de la mairie ou par téléphone.</p>",
    },
  ];
}

export function buildEvents() {
  return [
    {
      slug: "conseil-municipal-seance-publique",
      title: "Conseil municipal — séance publique",
      excerpt: "Séance ouverte au public. L'ordre du jour est affiché en mairie et publié sur ce site.",
      description:
        "<p>Le conseil municipal se réunit en séance publique. L'ordre du jour est affiché à la mairie et publié sur ce site cinq jours francs avant la séance.</p><p>Les habitants peuvent assister aux débats depuis les places réservées au public. Les comptes rendus des séances précédentes sont consultables dans l'espace documents.</p>",
      startAt: daysFromNow(6, 20, 0),
      endAt: daysFromNow(6, 22, 30),
      place: "Salle du conseil, mairie",
      address: "Place de la Mairie, 69380 Chessy-les-Mines",
      category: "MUNICIPAL",
      audience: "TOUT_PUBLIC",
      priceInfo: "Entrée libre",
      cover: visuel("abstrait", "conseil-municipal", "Conseil municipal"),
      featured: true,
    },
    {
      slug: "soiree-guinguette",
      title: "Soirée guinguette",
      excerpt: "Bal, buvette et repas champêtre : la soirée conviviale du comité des fêtes.",
      description:
        "<p>Guinguette, orchestre, buvette et restauration sur place : la soirée incontournable de la saison, organisée par le comité des fêtes.</p><p>Réservation conseillée pour le repas. Les bénéfices soutiennent les animations de l'année.</p>",
      startAt: daysFromNow(12, 19, 0),
      endAt: daysFromNow(12, 23, 59),
      place: "Place du village",
      category: "FESTIF",
      audience: "TOUT_PUBLIC",
      priceInfo: "Entrée libre — repas sur réservation",
      organizer: "Comité des fêtes",
      associationSlug: "comite-des-fetes",
      cover: visuel("village", "guinguette", "Soirée guinguette"),
      featured: true,
    },
    {
      slug: "bourse-aux-mineraux",
      title: "Bourse aux minéraux et exposition sur l'azurite",
      excerpt: "Exposants, pièces de collection et présentation du gisement de Chessy par l'AMAC.",
      description:
        "<p>L'Association Minéralogique de L'Arbresle et Chessy-les-Mines organise sa bourse aux minéraux : exposants, pièces de collection, fossiles et bien sûr l'<strong>azurite de Chessy</strong>, la fameuse chessylite.</p><p>Une exposition pédagogique explique la formation du gisement et l'histoire de l'exploitation, de l'époque romaine à la Mine Bleue du XIXe siècle. Animations pour les enfants et identification gratuite de vos échantillons.</p>",
      startAt: daysFromNow(19, 9, 0),
      endAt: daysFromNow(20, 18, 0),
      place: "Salle des fêtes",
      category: "CULTURE",
      audience: "FAMILLE",
      priceInfo: "Entrée libre",
      organizer: "AMAC",
      associationSlug: "amac",
      cover: visuel("mine", "bourse-mineraux", "Bourse aux minéraux"),
      featured: true,
    },
    {
      slug: "permanence-urbanisme",
      title: "Permanence du service urbanisme",
      excerpt: "Sur rendez-vous : conseils avant dépôt d'un dossier, lecture du PLU, questions de voisinage.",
      description:
        "<p>Permanence dédiée aux projets de construction et de rénovation : lecture des règles du plan local d'urbanisme applicables à votre parcelle, choix du bon formulaire, composition du dossier.</p><p>Rendez-vous à prendre auprès de l'accueil de la mairie.</p>",
      startAt: daysFromNow(4, 14, 0),
      endAt: daysFromNow(4, 17, 0),
      place: "Mairie",
      category: "MUNICIPAL",
      audience: "TOUT_PUBLIC",
      priceInfo: "Gratuit, sur rendez-vous",
      cover: visuel("abstrait", "permanence-urbanisme", "Permanence urbanisme"),
      featured: false,
    },
    {
      slug: "atelier-numerique-seniors",
      title: "Atelier numérique pour les aînés",
      excerpt: "Démarches en ligne, messagerie, photos : un accompagnement pas à pas, dans la bienveillance.",
      description:
        "<p>Un atelier en petit groupe pour se familiariser avec les usages du numérique : consulter ses courriels, effectuer une démarche administrative en ligne, envoyer des photos à ses petits-enfants, se prémunir des arnaques.</p><p>Apportez votre téléphone, votre tablette ou votre ordinateur portable. Du matériel est disponible sur place.</p>",
      startAt: daysFromNow(9, 14, 30),
      endAt: daysFromNow(9, 16, 30),
      place: "Salle des associations",
      category: "ASSOCIATIF",
      audience: "SENIORS",
      priceInfo: "Gratuit, sur inscription",
      organizer: "Cap Générations",
      associationSlug: "cap-generations",
      cover: visuel("abstrait", "atelier-numerique", "Atelier numérique"),
      featured: false,
    },
    {
      slug: "gala-de-danse",
      title: "Gala de danse",
      excerpt: "Le spectacle de fin d'année des élèves de Danse Art Concept.",
      description:
        "<p>Éveil, modern jazz, contemporain : les élèves de toutes les sections présentent le travail de l'année sur la scène de la salle des fêtes. Un moment attendu par les familles.</p>",
      startAt: daysFromNow(27, 20, 0),
      endAt: daysFromNow(27, 22, 0),
      place: "Salle des fêtes",
      category: "CULTURE",
      audience: "TOUT_PUBLIC",
      priceInfo: "Billetterie sur place",
      organizer: "Danse Art Concept",
      associationSlug: "danse-art-concept",
      cover: visuel("salle", "gala-danse", "Gala de danse"),
      featured: false,
    },
    {
      slug: "concours-de-boules",
      title: "Concours de boules — challenge de l'Amicale",
      excerpt: "Doublettes formées, buvette et casse-croûte au boulodrome communal.",
      description:
        "<p>Concours en doublettes formées, ouvert aux licenciés et aux amateurs. Inscriptions sur place jusqu'à 13h30, tirage au sort et début des parties à 14h.</p><p>Buvette et restauration légère tout au long de l'après-midi.</p>",
      startAt: daysFromNow(16, 14, 0),
      endAt: daysFromNow(16, 19, 0),
      place: "Boulodrome communal",
      category: "SPORT",
      audience: "TOUT_PUBLIC",
      priceInfo: "Participation aux frais d'inscription",
      organizer: "Amicale Boule de Chessy",
      associationSlug: "amicale-boule",
      cover: visuel("paysage", "concours-boules", "Concours de boules"),
      featured: false,
    },
    {
      slug: "marche-de-noel",
      title: "Marché de Noël",
      excerpt: "Artisans, producteurs, vin chaud et calèche du Père Noël au profit du sou des écoles.",
      description:
        "<p>Artisanat, produits du terroir, décorations, vin chaud et papillotes : le marché de Noël réunit une trentaine d'exposants. Les bénéfices financent les projets pédagogiques des écoliers.</p><p>Passage du Père Noël en fin d'après-midi et chorale des enfants.</p>",
      startAt: daysFromNow(72, 10, 0),
      endAt: daysFromNow(72, 19, 0),
      place: "Salle des fêtes et place du village",
      category: "FESTIF",
      audience: "FAMILLE",
      priceInfo: "Entrée libre",
      organizer: "Sou des écoles",
      associationSlug: "sou-des-ecoles",
      cover: visuel("village", "marche-noel", "Marché de Noël"),
      featured: true,
    },
    {
      slug: "collecte-de-sang",
      title: "Collecte de sang",
      excerpt: "Une heure de votre temps peut sauver jusqu'à trois vies. Sur rendez-vous.",
      description:
        "<p>L'Établissement français du sang organise une collecte à la salle des fêtes. La prise de rendez-vous en ligne est fortement conseillée pour limiter l'attente.</p><p>Pensez à vous munir d'une pièce d'identité et à ne pas venir à jeun.</p>",
      startAt: daysFromNow(33, 16, 0),
      endAt: daysFromNow(33, 19, 30),
      place: "Salle des fêtes",
      category: "ASSOCIATIF",
      audience: "TOUT_PUBLIC",
      priceInfo: "Gratuit",
      cover: visuel("abstrait", "collecte-sang", "Collecte de sang"),
      featured: false,
    },
    {
      slug: "nettoyage-de-printemps",
      title: "Matinée citoyenne : nettoyage du village",
      excerpt: "Gants, sacs et bonne humeur fournis. Rendez-vous devant la mairie.",
      description:
        "<p>Une matinée pour rendre au village sa propreté : ramassage des déchets le long des chemins et des abords de route, en famille ou entre voisins.</p><p>Le matériel est fourni par la commune. Un casse-croûte convivial clôture la matinée.</p>",
      startAt: daysFromNow(45, 9, 0),
      endAt: daysFromNow(45, 12, 30),
      place: "Départ devant la mairie",
      category: "MUNICIPAL",
      audience: "FAMILLE",
      priceInfo: "Gratuit",
      cover: visuel("paysage", "nettoyage-printemps", "Matinée citoyenne"),
      featured: false,
    },
    {
      slug: "ceremonie-du-11-novembre",
      title: "Cérémonie commémorative du 11 novembre",
      excerpt: "Rassemblement devant le monument aux morts, dépôt de gerbe et verre de l'amitié.",
      description:
        "<p>Commémoration de l'armistice de 1918 : rassemblement devant le monument aux morts, lecture du message officiel, dépôt de gerbe et minute de silence, avec la participation des enfants des écoles et de l'école de musique.</p><p>Un verre de l'amitié est servi à l'issue de la cérémonie.</p>",
      startAt: daysFromNow(62, 11, 0),
      endAt: daysFromNow(62, 12, 0),
      place: "Monument aux morts",
      category: "MUNICIPAL",
      audience: "TOUT_PUBLIC",
      priceInfo: "Entrée libre",
      cover: visuel("village", "ceremonie-11-novembre", "Cérémonie commémorative"),
      featured: false,
    },
    {
      slug: "audition-ecole-de-musique",
      title: "Audition de l'école de musique",
      excerpt: "Les élèves présentent leur travail : un moment simple et chaleureux.",
      description:
        "<p>Les élèves de l'école de musique, seuls ou en ensemble, présentent les pièces travaillées durant le trimestre. Entrée libre, dans la limite des places disponibles.</p>",
      startAt: daysFromNow(24, 18, 30),
      endAt: daysFromNow(24, 20, 0),
      place: "Salle des associations",
      category: "CULTURE",
      audience: "TOUT_PUBLIC",
      priceInfo: "Entrée libre",
      organizer: "École de musique",
      associationSlug: "ecole-de-musique",
      cover: visuel("salle", "audition-musique", "Audition musicale"),
      featured: false,
    },
    {
      slug: "vide-greniers",
      title: "Vide-greniers du sou des écoles",
      excerpt: "Une centaine d'emplacements, buvette et restauration sur place.",
      description:
        "<p>Vide-greniers annuel organisé par le sou des écoles. Réservation des emplacements à l'avance ; installation des exposants à partir de 6h.</p><p>Buvette, casse-croûte et pâtisseries maison tout au long de la journée.</p>",
      startAt: daysFromNow(-9, 7, 0),
      endAt: daysFromNow(-9, 18, 0),
      place: "Place du village et rues adjacentes",
      category: "FESTIF",
      audience: "FAMILLE",
      priceInfo: "Entrée libre",
      organizer: "Sou des écoles",
      associationSlug: "sou-des-ecoles",
      cover: visuel("village", "vide-greniers", "Vide-greniers"),
      featured: false,
    },
  ];
}

export function buildDocuments() {
  const year = new Date().getFullYear();
  return [
    {
      title: `Chessy Info — bulletin municipal, numéro de rentrée ${year}`,
      description:
        "Dossier : les services en ligne de la commune. Également au sommaire : travaux, vie associative, état civil.",
      category: "BULLETIN",
      year,
      order: 0,
    },
    {
      title: `Chessy Info — bulletin municipal, numéro de printemps ${year}`,
      description: "Dossier budget, retour sur les manifestations et calendrier des animations.",
      category: "BULLETIN",
      year,
      order: 1,
    },
    {
      title: `Chessy Info — bulletin municipal, numéro d'hiver ${year - 1}`,
      description: "Vœux du maire, rétrospective de l'année, agenda du premier semestre.",
      category: "BULLETIN",
      year: year - 1,
      order: 2,
    },
    {
      title: "Compte rendu du conseil municipal — séance de rentrée",
      description: "Délibérations relatives aux marchés de travaux, aux tarifs communaux et au personnel.",
      category: "COMPTE_RENDU",
      year,
      meetingDaysAgo: 34,
      order: 0,
    },
    {
      title: "Compte rendu du conseil municipal — séance d'été",
      description: "Adoption du compte administratif, subventions aux associations, questions diverses.",
      category: "COMPTE_RENDU",
      year,
      meetingDaysAgo: 76,
      order: 1,
    },
    {
      title: "Compte rendu du conseil municipal — séance de printemps",
      description: "Vote du budget primitif et des taux d'imposition, débat d'orientation budgétaire.",
      category: "COMPTE_RENDU",
      year,
      meetingDaysAgo: 140,
      order: 2,
    },
    {
      title: "Budget primitif — note de présentation brève et synthétique",
      description: "Présentation synthétique des sections de fonctionnement et d'investissement.",
      category: "BUDGET",
      year,
      order: 0,
    },
    {
      title: "Compte administratif de l'exercice précédent",
      description: "Résultats d'exécution du budget communal et affectation du résultat.",
      category: "BUDGET",
      year: year - 1,
      order: 1,
    },
    {
      title: "Règlement d'utilisation de la salle des fêtes",
      description: "Conditions de mise à disposition, obligations du locataire, état des lieux et caution.",
      category: "REGLEMENT",
      year,
      order: 0,
    },
    {
      title: "Règlement du prêt de matériel communal",
      description: "Matériel disponible, conditions d'emprunt, transport, responsabilité et restitution.",
      category: "REGLEMENT",
      year,
      order: 1,
    },
    {
      title: "Règlement du service de l'eau potable",
      description: "Abonnement, relevés, facturation, branchements et obligations réciproques.",
      category: "REGLEMENT",
      year,
      order: 2,
    },
    {
      title: "Plan local d'urbanisme — règlement écrit",
      description: "Règles applicables par zone : implantation, hauteur, aspect extérieur, stationnement.",
      category: "URBANISME",
      year,
      order: 0,
    },
    {
      title: "Plan local d'urbanisme — plan de zonage",
      description: "Document graphique délimitant les zones urbaines, agricoles et naturelles.",
      category: "URBANISME",
      year,
      order: 1,
    },
    {
      title: "Formulaire de déclaration de manifestation sur la commune",
      description: "À déposer au minimum deux mois avant la date de la manifestation.",
      category: "AUTRE",
      year,
      order: 0,
    },
    {
      title: "Arrêté temporaire de circulation — travaux rue du Bourg",
      description: "Circulation alternée et interdiction de stationnement pendant la durée du chantier.",
      category: "ARRETE",
      year,
      order: 0,
    },
  ];
}

export function buildAlerts() {
  return [
    {
      level: "INFO",
      title: "Réservez la salle des fêtes et le matériel communal directement en ligne",
      message: "Disponibilités en temps réel, tarif calculé automatiquement, suivi de votre demande.",
      linkHref: "/services/salle-des-fetes",
      linkLabel: "Voir les disponibilités",
      startAt: daysFromNow(-3),
      endAt: daysFromNow(40),
      active: true,
    },
    {
      level: "VIGILANCE",
      title: "Travaux rue du Bourg : circulation alternée de 8h à 17h",
      message: "Stationnement interdit sur la section en travaux. Déviation par la route des Mines.",
      linkHref: "/actualites/travaux-rue-du-bourg",
      linkLabel: "Détail des travaux",
      startAt: daysFromNow(-6),
      endAt: daysFromNow(15),
      active: false,
    },
  ];
}
