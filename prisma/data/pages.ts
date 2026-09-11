/**
 * Arborescence du site et contenu des pages installées par le seed.
 *
 * Chaque page est décrite par ses métadonnées et la liste ordonnée de ses
 * blocs. Tout est ensuite modifiable depuis le back-office : texte, images,
 * ordre des blocs, ajout ou suppression de sections.
 */
import { visuel } from "./reference";

export type SeedBlock = { type: string; data: Record<string, unknown> };

export type SeedPage = {
  slug: string;
  title: string;
  navLabel?: string;
  excerpt?: string;
  parent?: string;
  template?: "STANDARD" | "LARGE" | "ACCUEIL";
  order?: number;
  showInNav?: boolean;
  icon?: string;
  cover?: string;
  seoDescription?: string;
  blocks: SeedBlock[];
};

const b = (type: string, data: Record<string, unknown>): SeedBlock => ({ type, data });

/* ========================================================================= */
/* Accueil                                                                   */
/* ========================================================================= */

const ACCUEIL: SeedPage = {
  slug: "accueil",
  title: "Bienvenue à Chessy-les-Mines",
  navLabel: "Accueil",
  template: "ACCUEIL",
  order: 0,
  showInNav: false,
  icon: "Home",
  excerpt:
    "Site officiel de la commune de Chessy-les-Mines : démarches en ligne, actualités, agenda et services aux habitants.",
  seoDescription:
    "Mairie de Chessy-les-Mines (69380) : effectuez vos démarches, réservez la salle des fêtes, empruntez du matériel, suivez l'actualité et l'agenda de la commune.",
  blocks: [
    b("hero", {
      eyebrow: "Beaujolais des Pierres Dorées · Rhône",
      title: "Chessy-les-Mines",
      subtitle:
        "Un village de 2 080 habitants où l'azurite a écrit l'histoire, et où la mairie se met au service du quotidien : démarches en ligne, réservation de salle, prêt de matériel.",
      image: { url: visuel("village", "accueil-hero"), alt: "Vue du village de Chessy-les-Mines" },
      height: "grande",
      align: "left",
      showSearch: true,
      actions: [
        { label: "Faire une démarche", href: "/demarches", icon: "ClipboardList" },
        { label: "Réserver une salle", href: "/services/salle-des-fetes", icon: "CalendarCheck" },
        { label: "Signaler un problème", href: "/services/signalement", icon: "TriangleAlert" },
      ],
    }),
    b("quickLinks", {
      title: "Vos démarches les plus demandées",
      subtitle: "Cinq minutes suffisent, sans déplacement en mairie.",
      columns: "4",
      links: [
        {
          label: "Réserver la salle des fêtes",
          href: "/services/salle-des-fetes",
          icon: "PartyPopper",
          description: "Disponibilités en direct et tarif calculé automatiquement",
        },
        {
          label: "Emprunter du matériel",
          href: "/services/pret-de-materiel",
          icon: "Package",
          description: "Tables, chaises, barnums, sonorisation",
        },
        {
          label: "Signaler un problème",
          href: "/services/signalement",
          icon: "TriangleAlert",
          description: "Voirie, éclairage, propreté — avec photo et localisation",
        },
        {
          label: "Acte de naissance",
          href: "/demarches/acte-de-naissance",
          icon: "FileText",
          description: "Copie intégrale ou extrait, gratuitement",
        },
        {
          label: "Carte d'identité / passeport",
          href: "/demarches/carte-identite-passeport",
          icon: "IdCard",
          description: "Pré-demande en ligne et prise de rendez-vous",
        },
        {
          label: "Déclaration de travaux",
          href: "/demarches/declaration-prealable-travaux",
          icon: "Hammer",
          description: "Clôture, abri de jardin, façade, panneaux solaires",
        },
        {
          label: "Inscription scolaire",
          href: "/demarches/inscription-scolaire",
          icon: "GraduationCap",
          description: "École publique La Chessylite",
        },
        {
          label: "Suivre ma demande",
          href: "/suivi",
          icon: "Search",
          description: "Avec votre référence de suivi",
        },
      ],
    }),
    b("newsList", {
      title: "L'actualité de la commune",
      subtitle: "Décisions, travaux, vie associative : l'essentiel de ce qui bouge à Chessy.",
      limit: 4,
      layout: "vedette",
      showMore: true,
    }),
    b("serviceTeaser", {
      service: "salle",
      title: "La salle des fêtes se réserve maintenant en ligne",
      text: "Choisissez votre créneau dans le calendrier, indiquez votre situation, et le tarif comme la caution s'affichent immédiatement. Vous recevez une référence de suivi et la mairie instruit votre demande. Fini les allers-retours pour connaître les disponibilités.",
      ctaLabel: "Voir le calendrier des disponibilités",
      image: { url: visuel("salle", "teaser-salle"), alt: "Intérieur de la salle des fêtes" },
    }),
    b("agendaList", {
      title: "Les prochains rendez-vous",
      subtitle: "Conseil municipal, manifestations associatives, permanences.",
      limit: 5,
      layout: "liste",
      showMore: true,
    }),
    b("stats", {
      title: "Chessy en quelques chiffres",
      subtitle: "Une commune à taille humaine, au cœur du Beaujolais.",
      tone: "azur",
      items: [
        { value: 2080, suffix: " hab.", label: "Habitants (Cassissiennes et Cassissiens)", icon: "Users" },
        { value: 14, suffix: "", label: "Associations qui font vivre le village", icon: "HeartHandshake" },
        { value: 2000, suffix: " ans", label: "D'histoire minière, depuis l'époque romaine", icon: "Pickaxe" },
        { value: 6, suffix: ",4 km²", label: "De superficie communale", icon: "MapPin" },
      ],
    }),
    b("cardGrid", {
      title: "Découvrir Chessy-les-Mines",
      subtitle: "Un patrimoine minier unique, un cadre de vie préservé.",
      columns: "3",
      variant: "image",
      cards: [
        {
          title: "L'azurite, la « chessylite »",
          text: "C'est ici qu'a été identifiée l'une des plus belles azurites du monde. Deux mille ans d'exploitation du cuivre ont façonné le sous-sol et le nom du village.",
          image: { url: visuel("mine", "carte-azurite"), alt: "Cristaux d'azurite" },
          href: "/cadre-de-vie/patrimoine",
          badge: "Patrimoine",
        },
        {
          title: "L'église et le château",
          text: "Une église bâtie au XIIe siècle par les moines de Savigny, un château inscrit au titre des monuments historiques : la pierre dorée raconte le Beaujolais.",
          image: { url: visuel("village", "carte-eglise"), alt: "Église du village" },
          href: "/cadre-de-vie/patrimoine",
          badge: "Architecture",
        },
        {
          title: "Le Geopark Beaujolais",
          text: "Chessy-les-Mines est un site remarquable du Geopark mondial UNESCO du Beaujolais. Sentiers, points de vue et géotourisme à deux pas de chez vous.",
          image: { url: visuel("paysage", "carte-geopark"), alt: "Paysage de vignes du Beaujolais" },
          href: "/cadre-de-vie/environnement",
          badge: "Nature",
        },
      ],
    }),
    b("columns", {
      title: "La mairie à votre service",
      items: [
        {
          title: "Accueil du public",
          icon: "Clock",
          html: "<p>Lundi, mardi, jeudi et vendredi de <strong>14h30 à 18h30</strong>.<br>Mercredi de <strong>9h à 12h</strong>.</p><p>Sans rendez-vous pour l'état civil et les renseignements courants.</p>",
        },
        {
          title: "Nous joindre",
          icon: "Phone",
          html: "<p><strong>04 78 43 92 03</strong><br><a href=\"mailto:accueil@chessy69.fr\">accueil@chessy69.fr</a></p><p>Place de la Mairie<br>69380 Chessy-les-Mines</p>",
        },
        {
          title: "Alertes et informations",
          icon: "BellRing",
          html: "<p>Coupure d'eau, alerte météo, information urgente : la commune diffuse ses messages sur <strong>PanneauPocket</strong> et dans le bandeau de ce site.</p><p><a href=\"/la-mairie/informations-urgentes\">En savoir plus</a></p>",
        },
      ],
    }),
    b("serviceTeaser", {
      service: "signalement",
      title: "Un lampadaire en panne ? Un nid-de-poule ?",
      text: "Signalez-le en deux minutes : décrivez le problème, ajoutez une photo, placez le point sur le plan. Les services techniques reçoivent l'information immédiatement et vous suivez l'avancement avec votre référence.",
      ctaLabel: "Faire un signalement",
      image: { url: visuel("abstrait", "teaser-signalement"), alt: "Illustration d'un signalement" },
    }),
  ],
};

/* ========================================================================= */
/* La mairie                                                                 */
/* ========================================================================= */

const MAIRIE: SeedPage[] = [
  {
    slug: "la-mairie",
    title: "La mairie",
    navLabel: "La mairie",
    order: 1,
    icon: "Landmark",
    excerpt:
      "Le conseil municipal, les services, le budget, les comptes rendus et l'action sociale de la commune.",
    cover: visuel("village", "la-mairie-cover", "La mairie"),
    blocks: [
      b("richText", {
        title: "Une équipe au service des habitants",
        html: "<p>La mairie de Chessy-les-Mines réunit les <strong>élus du conseil municipal</strong>, qui décident des orientations de la commune, et les <strong>agents municipaux</strong>, qui les mettent en œuvre au quotidien : accueil du public, état civil, urbanisme, école, entretien de la voirie et des bâtiments, espaces verts, service de l'eau.</p><p>Cette rubrique rassemble tout ce qui concerne le fonctionnement de l'institution : qui décide quoi, avec quel budget, et comment consulter les décisions prises.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "",
        subtitle: "",
        columns: "3",
        variant: "icone",
        cards: [
          {
            title: "Le conseil municipal",
            text: "Le maire, les adjoints, les conseillers et les commissions de travail.",
            icon: "Users",
            href: "/la-mairie/conseil-municipal",
          },
          {
            title: "Comptes rendus et délibérations",
            text: "Les décisions du conseil, séance par séance, en téléchargement.",
            icon: "FileStack",
            href: "/la-mairie/comptes-rendus",
          },
          {
            title: "Budget et finances",
            text: "Budget primitif, compte administratif, fiscalité locale.",
            icon: "PiggyBank",
            href: "/la-mairie/budget",
          },
          {
            title: "Les services municipaux",
            text: "Qui contacter, pour quelle démarche, et à quels horaires.",
            icon: "Building2",
            href: "/la-mairie/services-municipaux",
          },
          {
            title: "CCAS et solidarités",
            text: "Aide sociale de proximité, aînés, registre des personnes vulnérables.",
            icon: "HeartHandshake",
            href: "/la-mairie/ccas",
          },
          {
            title: "Intercommunalité",
            text: "Les compétences exercées par la Communauté de communes Beaujolais Pierres Dorées.",
            icon: "Network",
            href: "/la-mairie/intercommunalite",
          },
          {
            title: "Bulletin municipal",
            text: "Tous les numéros de Chessy Info à télécharger.",
            icon: "Newspaper",
            href: "/la-mairie/bulletin-municipal",
          },
          {
            title: "Marchés publics",
            text: "Consultations en cours et avis d'attribution.",
            icon: "Gavel",
            href: "/la-mairie/marches-publics",
          },
          {
            title: "Informations urgentes",
            text: "PanneauPocket, alertes météo, numéros utiles.",
            icon: "BellRing",
            href: "/la-mairie/informations-urgentes",
          },
        ],
      }),
      b("contactCard", {
        title: "Contacter la mairie",
        intro: "L'accueil vous reçoit sans rendez-vous pour la plupart des démarches.",
        showMap: true,
        showHours: true,
      }),
    ],
  },
  {
    slug: "la-mairie/conseil-municipal",
    title: "Le conseil municipal",
    navLabel: "Le conseil municipal",
    parent: "la-mairie",
    order: 0,
    icon: "Users",
    excerpt: "Le maire, les adjoints, les conseillers municipaux et les commissions de travail.",
    blocks: [
      b("richText", {
        title: "Le rôle du conseil municipal",
        html: "<p>Le conseil municipal règle par ses délibérations les affaires de la commune. Il vote le <strong>budget</strong>, approuve les <strong>comptes</strong>, décide des travaux, fixe les tarifs des services publics locaux, attribue les subventions aux associations et gère le patrimoine communal.</p><p>Il se réunit au moins une fois par trimestre en <strong>séance publique</strong>. L'ordre du jour est affiché en mairie et publié sur ce site cinq jours francs avant la séance : chacun peut venir écouter les débats.</p><p>Le maire est l'exécutif de la commune : il prépare et exécute les délibérations, dirige les services, est officier d'état civil et officier de police judiciaire.</p>",
        width: "lecture",
      }),
      b("personGrid", {
        title: "Les élus",
        subtitle: "Mandat en cours. Les délégations précisent les domaines suivis par chaque élu.",
        role: "",
        showDelegations: true,
      }),
      b("accordion", {
        title: "Les commissions municipales",
        subtitle:
          "Les commissions préparent les dossiers avant leur passage en conseil. Elles sont présidées par le maire et animées par l'adjoint délégué.",
        items: [
          {
            question: "Finances et administration générale",
            answer:
              "<p>Prépare le budget primitif et le compte administratif, suit l'exécution budgétaire, la fiscalité locale et les ressources humaines.</p>",
          },
          {
            question: "Travaux, voirie et urbanisme",
            answer:
              "<p>Instruit les projets d'aménagement, suit les chantiers communaux, prépare les avis sur les autorisations d'urbanisme et le plan local d'urbanisme.</p>",
          },
          {
            question: "Enfance, jeunesse et affaires scolaires",
            answer:
              "<p>Suit la vie des écoles, le restaurant scolaire, l'accueil périscolaire, le conseil municipal des enfants et les relations avec les partenaires de la petite enfance.</p>",
          },
          {
            question: "Vie associative, culture et communication",
            answer:
              "<p>Accompagne les associations, coordonne le calendrier des manifestations, l'attribution des salles, le bulletin municipal et ce site internet.</p>",
          },
          {
            question: "Cadre de vie et environnement",
            answer:
              "<p>Espaces verts, fleurissement, gestion de l'eau, biodiversité, sobriété énergétique et propreté du village.</p>",
          },
          {
            question: "Centre communal d'action sociale (CCAS)",
            answer:
              "<p>Aide sociale de proximité, accompagnement des aînés, registre des personnes vulnérables, lien avec les services sociaux du Département.</p>",
          },
        ],
      }),
      b("cta", {
        title: "Assister à une séance du conseil",
        text: "Les séances sont publiques. Consultez la date de la prochaine séance dans l'agenda de la commune.",
        tone: "azur",
        actions: [
          { label: "Voir l'agenda", href: "/agenda", icon: "CalendarDays" },
          { label: "Lire les comptes rendus", href: "/la-mairie/comptes-rendus", icon: "FileText" },
        ],
      }),
    ],
  },
  {
    slug: "la-mairie/comptes-rendus",
    title: "Comptes rendus et délibérations",
    navLabel: "Comptes rendus",
    parent: "la-mairie",
    order: 1,
    icon: "FileStack",
    excerpt: "Les décisions du conseil municipal, séance par séance.",
    blocks: [
      b("richText", {
        title: "",
        html: "<p>Les comptes rendus des séances du conseil municipal sont publiés après chaque réunion. Ils reprennent les délibérations adoptées, les votes et les questions diverses abordées.</p><p>Les délibérations et arrêtés réglementaires sont également affichés sur le panneau officiel de la mairie, conformément au code général des collectivités territoriales.</p>",
        width: "lecture",
      }),
      b("documents", {
        title: "Comptes rendus du conseil municipal",
        subtitle: "Classés par date de séance, du plus récent au plus ancien.",
        category: "COMPTE_RENDU",
        limit: 30,
        groupByYear: true,
      }),
      b("documents", {
        title: "Arrêtés municipaux",
        subtitle: "Arrêtés de circulation, d'occupation du domaine public et de police.",
        category: "ARRETE",
        limit: 20,
        groupByYear: true,
      }),
      b("alertBox", {
        level: "INFO",
        title: "Vous cherchez un document plus ancien ?",
        html: "<p>Les registres des délibérations sont consultables sur place, à l'accueil de la mairie. Adressez votre demande par courriel à <a href=\"mailto:accueil@chessy69.fr\">accueil@chessy69.fr</a> en précisant la période recherchée.</p>",
      }),
    ],
  },
  {
    slug: "la-mairie/budget",
    title: "Budget et finances",
    navLabel: "Budget et finances",
    parent: "la-mairie",
    order: 2,
    icon: "PiggyBank",
    excerpt: "Budget primitif, compte administratif, fiscalité locale et transparence financière.",
    blocks: [
      b("richText", {
        title: "Comment se construit le budget communal",
        html: "<p>Le budget communal se compose de deux sections. La <strong>section de fonctionnement</strong> couvre les dépenses courantes : salaires des agents, énergie, entretien, fournitures scolaires, subventions aux associations. La <strong>section d'investissement</strong> finance ce qui reste : travaux de voirie, rénovation des bâtiments, achat de matériel durable.</p><p>Les recettes proviennent principalement des <strong>impôts locaux</strong> (taxe foncière), des <strong>dotations de l'État</strong>, des redevances des services publics locaux et des subventions du Département, de la Région et de l'État pour les projets d'investissement.</p>",
        width: "lecture",
      }),
      b("steps", {
        title: "Le calendrier budgétaire",
        subtitle: "Quatre temps forts qui structurent l'année financière de la commune.",
        items: [
          {
            title: "Débat d'orientation budgétaire",
            text: "En début d'année, le conseil débat des grandes priorités et de la capacité d'investissement de la commune.",
          },
          {
            title: "Vote du budget primitif",
            text: "Le budget prévisionnel de l'année est adopté, ainsi que les taux d'imposition communaux.",
          },
          {
            title: "Décisions modificatives",
            text: "En cours d'année, le conseil ajuste les crédits en fonction des dépenses et recettes réelles.",
          },
          {
            title: "Compte administratif",
            text: "L'année suivante, le conseil constate l'exécution réelle du budget et affecte le résultat.",
          },
        ],
      }),
      b("documents", {
        title: "Documents budgétaires",
        subtitle: "Budget primitif, note de présentation synthétique et compte administratif.",
        category: "BUDGET",
        limit: 20,
        groupByYear: true,
      }),
      b("accordion", {
        title: "Questions fréquentes sur les finances communales",
        subtitle: "",
        items: [
          {
            question: "Où va ma taxe foncière ?",
            answer:
              "<p>La taxe foncière est répartie entre plusieurs collectivités : la commune, l'intercommunalité, le Département et les syndicats auxquels la commune adhère. La part communale finance les services de proximité : école, voirie, espaces verts, salle des fêtes, entretien des bâtiments.</p>",
          },
          {
            question: "Comment sont attribuées les subventions aux associations ?",
            answer:
              "<p>Chaque association dépose un dossier annuel comprenant son bilan, son budget prévisionnel et son projet. La commission vie associative examine les demandes, puis le conseil municipal vote les attributions lors du budget primitif.</p>",
          },
          {
            question: "Puis-je consulter les documents budgétaires détaillés ?",
            answer:
              "<p>Oui. Les documents budgétaires sont publics et téléchargeables sur cette page. Les annexes complètes sont consultables à l'accueil de la mairie, aux heures d'ouverture.</p>",
          },
        ],
      }),
    ],
  },
  {
    slug: "la-mairie/services-municipaux",
    title: "Les services municipaux",
    navLabel: "Les services municipaux",
    parent: "la-mairie",
    order: 3,
    icon: "Building2",
    excerpt: "Qui contacter, pour quelle démarche, et à quels horaires.",
    blocks: [
      b("richText", {
        title: "L'organisation des services",
        html: "<p>Les agents municipaux assurent la continuité du service public sur la commune. Une équipe resserrée, polyvalente, que vous croisez à l'accueil de la mairie comme sur la voirie.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "",
        columns: "2",
        variant: "icone",
        cards: [
          {
            title: "Accueil et état civil",
            text: "Actes d'état civil, recensement citoyen, listes électorales, attestations, renseignements généraux. Sans rendez-vous aux heures d'ouverture.",
            icon: "Users",
            badge: "04 78 43 92 03",
          },
          {
            title: "Urbanisme",
            text: "Autorisations d'urbanisme, consultation du plan local d'urbanisme, certificats, cadastre. Permanence sur rendez-vous.",
            icon: "Ruler",
            href: "/cadre-de-vie/urbanisme",
          },
          {
            title: "Service de l'eau",
            text: "Abonnements, relevés de compteur, facturation, branchements et fuites.",
            icon: "Droplets",
            href: "/cadre-de-vie/eau-assainissement",
            badge: "service.eau@chessy69.fr",
          },
          {
            title: "Services techniques",
            text: "Voirie, espaces verts, bâtiments communaux, prêt de matériel, préparation des manifestations.",
            icon: "Wrench",
            href: "/services/pret-de-materiel",
          },
          {
            title: "Affaires scolaires et périscolaire",
            text: "Inscriptions scolaires, restaurant scolaire, accueil périscolaire, transport.",
            icon: "GraduationCap",
            href: "/vivre-a-chessy/ecoles",
          },
          {
            title: "Secrétariat général",
            text: "Location des salles, déclarations de manifestation, marchés publics, préparation des conseils.",
            icon: "FileSignature",
            href: "/services/salle-des-fetes",
          },
        ],
      }),
      b("contactCard", {
        title: "Horaires et accès",
        intro: "",
        showMap: true,
        showHours: true,
      }),
      b("alertBox", {
        level: "INFO",
        title: "Besoin d'un rendez-vous ?",
        html: "<p>Pour l'urbanisme, le service de l'eau ou une question qui demande du temps, demandez un rendez-vous : vous serez reçu par l'agent compétent, dossier préparé.</p><p><a href=\"/contact\">Demander un rendez-vous</a></p>",
      }),
    ],
  },
  {
    slug: "la-mairie/ccas",
    title: "CCAS et solidarités",
    navLabel: "CCAS et solidarités",
    parent: "la-mairie",
    order: 4,
    icon: "HeartHandshake",
    excerpt: "L'action sociale de proximité : aînés, familles, personnes en difficulté.",
    blocks: [
      b("richText", {
        title: "Le centre communal d'action sociale",
        html: "<p>Le CCAS est l'outil de <strong>solidarité de proximité</strong> de la commune. Présidé par le maire, administré par des élus et des représentants de la société civile, il accompagne les habitants confrontés à une difficulté : perte d'autonomie, isolement, accident de la vie, difficulté administrative.</p><p>Les échanges avec le CCAS sont <strong>confidentiels</strong>. N'hésitez pas à solliciter un entretien : mieux vaut demander tôt que laisser une situation s'installer.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "Ce que le CCAS peut faire pour vous",
        columns: "2",
        variant: "icone",
        cards: [
          {
            title: "Registre des personnes vulnérables",
            text: "Inscription volontaire et confidentielle. En cas de canicule, de grand froid ou d'alerte sanitaire, la commune prend de vos nouvelles.",
            icon: "ShieldCheck",
          },
          {
            title: "Aide aux démarches",
            text: "Accompagnement pour constituer un dossier : APA, aide au logement, retraite, complémentaire santé solidaire.",
            icon: "FileText",
          },
          {
            title: "Domiciliation",
            text: "Élection de domicile pour les personnes sans résidence stable, permettant l'accès aux droits.",
            icon: "MapPin",
          },
          {
            title: "Lien avec les aînés",
            text: "Visites de convivialité, colis de fin d'année, repas des aînés et animations avec les associations partenaires.",
            icon: "Heart",
          },
        ],
      }),
      b("accordion", {
        title: "Vos interlocuteurs selon la situation",
        subtitle: "",
        items: [
          {
            question: "Difficultés financières, budget, surendettement",
            answer:
              "<p>Le CCAS peut orienter vers l'assistante sociale du Département et instruire une demande d'aide facultative. Prenez contact avec l'accueil de la mairie pour un rendez-vous confidentiel.</p>",
          },
          {
            question: "Perte d'autonomie, maintien à domicile",
            answer:
              "<p>Portage de repas, aide à domicile, adaptation du logement, allocation personnalisée d'autonomie : le CCAS vous aide à identifier le bon dispositif et à monter le dossier.</p>",
          },
          {
            question: "Handicap",
            answer:
              "<p>Les demandes relatives à la reconnaissance du handicap, à l'AAH ou à la carte mobilité inclusion sont instruites par la Maison départementale des personnes handicapées. Le CCAS vous accompagne dans la constitution du dossier.</p>",
          },
          {
            question: "Violences intrafamiliales",
            answer:
              "<p>En cas de danger immédiat, appelez le 17. Le 3919 est un numéro national d'écoute, gratuit et anonyme. La mairie peut vous orienter vers les associations spécialisées du territoire.</p>",
          },
        ],
      }),
      b("cta", {
        title: "Solliciter un entretien confidentiel",
        text: "Écrivez-nous ou passez à l'accueil : un rendez-vous vous sera proposé rapidement.",
        tone: "sable",
        actions: [{ label: "Contacter la mairie", href: "/contact", icon: "Mail" }],
      }),
    ],
  },
  {
    slug: "la-mairie/intercommunalite",
    title: "Intercommunalité",
    navLabel: "Intercommunalité",
    parent: "la-mairie",
    order: 5,
    icon: "Network",
    excerpt:
      "Chessy-les-Mines est membre de la Communauté de communes Beaujolais Pierres Dorées.",
    blocks: [
      b("richText", {
        title: "Une commune, un territoire",
        html: "<p>Chessy-les-Mines est membre de la <strong>Communauté de communes Beaujolais Pierres Dorées</strong> (CCBPD). Certaines compétences sont exercées à cette échelle intercommunale, car elles supposent des moyens qu'une commune de 2 000 habitants ne peut mobiliser seule.</p><p>Concrètement, cela veut dire que pour certaines démarches — accueil de loisirs, déchets, développement économique — votre interlocuteur est la communauté de communes plutôt que la mairie. Cette page vous aide à savoir qui fait quoi.</p>",
        width: "lecture",
      }),
      b("columns", {
        title: "Qui fait quoi ?",
        items: [
          {
            title: "La commune",
            icon: "Landmark",
            html: "<ul><li>État civil et élections</li><li>Écoles maternelle et élémentaire</li><li>Voirie communale et éclairage public</li><li>Espaces verts et propreté</li><li>Salles communales et prêt de matériel</li><li>Service de l'eau potable</li><li>Urbanisme : instruction et délivrance des autorisations</li><li>Action sociale de proximité (CCAS)</li></ul>",
          },
          {
            title: "La communauté de communes",
            icon: "Network",
            html: "<ul><li>Collecte et traitement des déchets</li><li>Accueils de loisirs (ALSH) et coordination petite enfance</li><li>Développement économique et zones d'activités</li><li>Tourisme et promotion du territoire</li><li>Assainissement collectif</li><li>Mobilités et transports à la demande</li><li>Habitat et rénovation énergétique</li></ul>",
          },
          {
            title: "Le Département et la Région",
            icon: "Map",
            html: "<ul><li><strong>Département du Rhône</strong> : collèges, routes départementales, action sociale, aide à l'autonomie, protection de l'enfance</li><li><strong>Région Auvergne-Rhône-Alpes</strong> : lycées, formation professionnelle, transports régionaux, développement économique</li></ul>",
          },
        ],
      }),
      b("cta", {
        title: "Site de la Communauté de communes Beaujolais Pierres Dorées",
        text: "Déchets, petite enfance, accueils de loisirs, habitat : retrouvez les services intercommunaux.",
        tone: "azur",
        actions: [
          {
            label: "Aller sur le site de la CCBPD",
            href: "https://www.cc-pierresdorees.com",
            icon: "ExternalLink",
          },
        ],
      }),
    ],
  },
  {
    slug: "la-mairie/bulletin-municipal",
    title: "Bulletin municipal Chessy Info",
    navLabel: "Bulletin municipal",
    parent: "la-mairie",
    order: 6,
    icon: "Newspaper",
    excerpt: "Tous les numéros du bulletin d'informations municipales à télécharger.",
    blocks: [
      b("richText", {
        title: "",
        html: "<p><strong>Chessy Info</strong> est le bulletin d'informations municipales de la commune. Distribué dans toutes les boîtes aux lettres, il revient sur les décisions du conseil, les travaux réalisés, la vie des écoles et des associations, et présente l'agenda des mois à venir.</p><p>Vous ne l'avez pas reçu ? Des exemplaires sont disponibles à l'accueil de la mairie, et tous les numéros sont téléchargeables ci-dessous.</p>",
        width: "lecture",
      }),
      b("documents", {
        title: "Les numéros de Chessy Info",
        subtitle: "",
        category: "BULLETIN",
        limit: 40,
        groupByYear: true,
      }),
      b("newsletter", {
        title: "Préférez-vous être informé par courriel ?",
        text: "Inscrivez-vous à la lettre d'information : vous recevrez l'essentiel entre deux numéros du bulletin.",
        tone: "sable",
      }),
    ],
  },
  {
    slug: "la-mairie/marches-publics",
    title: "Marchés publics",
    navLabel: "Marchés publics",
    parent: "la-mairie",
    order: 7,
    icon: "Gavel",
    excerpt: "Consultations en cours, avis d'attribution et modalités de réponse.",
    blocks: [
      b("richText", {
        title: "Répondre à une consultation de la commune",
        html: "<p>La commune publie ses avis de marchés selon les seuils réglementaires. Les consultations en cours sont annoncées sur cette page et, le cas échéant, sur le profil d'acheteur dématérialisé et au Bulletin officiel des annonces des marchés publics.</p><h3>Vous êtes une entreprise du territoire ?</h3><p>Pour les achats de faible montant, la commune peut solliciter directement des devis. Faites-vous connaître auprès du secrétariat général en précisant votre domaine d'activité et vos références.</p>",
        width: "lecture",
      }),
      b("alertBox", {
        level: "INFO",
        title: "Aucune consultation en cours",
        html: "<p>Il n'y a pas d'avis de marché ouvert actuellement. Cette page est mise à jour dès la publication d'une nouvelle consultation.</p>",
      }),
      b("documents", {
        title: "Documents et avis d'attribution",
        subtitle: "",
        category: "AUTRE",
        limit: 15,
        groupByYear: true,
      }),
    ],
  },
  {
    slug: "la-mairie/informations-urgentes",
    title: "Informations urgentes et alertes",
    navLabel: "Informations urgentes",
    parent: "la-mairie",
    order: 8,
    icon: "BellRing",
    excerpt: "PanneauPocket, alertes météo, numéros utiles et conduite à tenir.",
    blocks: [
      b("richText", {
        title: "Être prévenu, savoir quoi faire",
        html: "<p>Coupure d'eau, alerte météorologique, route barrée, épisode de pollution : la commune diffuse ses informations urgentes par plusieurs canaux complémentaires. Le plus rapide reste la notification sur votre téléphone.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "Les canaux d'information",
        columns: "3",
        variant: "icone",
        cards: [
          {
            title: "PanneauPocket",
            text: "Application gratuite, sans création de compte : recherchez « Chessy-les-Mines », mettez la commune en favori et recevez les notifications.",
            icon: "Smartphone",
            href: "https://app.panneaupocket.com/ville/779546136-chessy-les-mines-69380",
            badge: "Recommandé",
          },
          {
            title: "Bandeau d'alerte du site",
            text: "Les messages urgents apparaissent en haut de toutes les pages de ce site, avec un lien vers le détail.",
            icon: "Megaphone",
          },
          {
            title: "Lettre d'information",
            text: "Un courriel mensuel, et une diffusion exceptionnelle en cas d'évènement majeur.",
            icon: "Mail",
          },
        ],
      }),
      b("pricingTable", {
        title: "Numéros utiles",
        subtitle: "À conserver près du téléphone.",
        colLabel: "Service",
        colValue: "Numéro",
        rows: [
          { label: "Urgences européennes", value: "112", note: "Tous secours, depuis toute l'Europe" },
          { label: "SAMU", value: "15", note: "Urgence médicale" },
          { label: "Police / gendarmerie", value: "17", note: "" },
          { label: "Pompiers", value: "18", note: "" },
          { label: "Urgences pour les personnes sourdes et malentendantes", value: "114", note: "Par SMS ou fax" },
          { label: "Enfance en danger", value: "119", note: "Gratuit, 24h/24" },
          { label: "Violences femmes info", value: "3919", note: "Anonyme et gratuit" },
          { label: "Mairie de Chessy-les-Mines", value: "04 78 43 92 03", note: "Aux heures d'ouverture" },
          { label: "Fuite ou problème sur le réseau d'eau", value: "04 78 43 92 03", note: "Service de l'eau de la commune" },
        ],
      }),
      b("accordion", {
        title: "Que faire en cas de…",
        subtitle: "",
        items: [
          {
            question: "Coupure d'eau",
            answer:
              "<p>Vérifiez d'abord si vos voisins sont concernés, puis consultez PanneauPocket : les coupures programmées y sont annoncées. En cas de coupure non annoncée ou de fuite sur la voie publique, appelez la mairie. Après une coupure, laissez couler l'eau quelques minutes avant de la consommer.</p>",
          },
          {
            question: "Alerte canicule",
            answer:
              "<p>Buvez régulièrement sans attendre la soif, fermez les volets aux heures chaudes, prenez des nouvelles de vos voisins isolés. Les personnes inscrites au registre du CCAS sont contactées par la commune.</p>",
          },
          {
            question: "Vent violent ou orage",
            answer:
              "<p>Restez à l'abri, éloignez-vous des arbres et des lignes électriques, rentrez ou arrimez le mobilier extérieur. Signalez à la mairie tout arbre menaçant ou branche tombée sur la voie publique.</p>",
          },
          {
            question: "Neige et verglas",
            answer:
              "<p>Les agents interviennent en priorité sur les axes principaux et les accès aux équipements publics. Chaque riverain est tenu de déneiger le trottoir devant chez lui. Renseignez-vous sur le fonctionnement du transport scolaire avant de partir.</p>",
          },
        ],
      }),
    ],
  },
];

/* ========================================================================= */
/* Démarches                                                                 */
/* ========================================================================= */

const DEMARCHES_PAGES: SeedPage[] = [
  {
    slug: "demarches",
    title: "Démarches et services",
    navLabel: "Démarches",
    order: 2,
    icon: "ClipboardList",
    template: "LARGE",
    excerpt:
      "Toutes les démarches administratives de la commune, avec les pièces à fournir et les délais.",
    cover: visuel("abstrait", "demarches-cover", "Démarches"),
    seoDescription:
      "Acte de naissance, carte d'identité, urbanisme, inscription scolaire, service de l'eau : toutes les démarches en mairie de Chessy-les-Mines, en ligne ou sur place.",
    blocks: [
      b("richText", {
        title: "Trouvez la bonne démarche, du premier coup",
        html: "<p>Chaque fiche indique <strong>qui peut faire la démarche</strong>, <strong>les pièces à fournir</strong>, <strong>le délai</strong> et <strong>le coût</strong>. Quand un téléservice national existe, le lien direct est fourni : vous n'avez pas à chercher.</p><p>Une question qui n'entre dans aucune case ? Écrivez-nous : nous vous orientons vers le bon interlocuteur.</p>",
        width: "lecture",
      }),
      b("quickLinks", {
        title: "Faire tout de suite, en ligne",
        subtitle: "Les services proposés directement par la commune.",
        columns: "3",
        links: [
          {
            label: "Réserver une salle communale",
            href: "/services/salle-des-fetes",
            icon: "PartyPopper",
            description: "Salle des fêtes et salle des associations",
          },
          {
            label: "Emprunter du matériel",
            href: "/services/pret-de-materiel",
            icon: "Package",
            description: "Tables, chaises, barnums, sonorisation",
          },
          {
            label: "Signaler un problème",
            href: "/services/signalement",
            icon: "TriangleAlert",
            description: "Voirie, éclairage, propreté, eau",
          },
          {
            label: "Demander un rendez-vous",
            href: "/contact?type=RENDEZ_VOUS",
            icon: "CalendarClock",
            description: "Urbanisme, service de l'eau, CCAS",
          },
          {
            label: "Suivre une demande",
            href: "/suivi",
            icon: "Search",
            description: "Avec votre référence de suivi",
          },
          {
            label: "Écrire à la mairie",
            href: "/contact",
            icon: "Mail",
            description: "Réponse sous 5 jours ouvrés",
          },
        ],
      }),
      b("demarchesList", {
        title: "Toutes les démarches",
        subtitle: "Classées par thème.",
        category: "",
        groupByCategory: true,
      }),
      b("alertBox", {
        level: "VIGILANCE",
        title: "Méfiez-vous des sites payants",
        html: "<p>Les démarches administratives officielles sont gratuites ou à tarif réglementé. Certains sites privés facturent des services que l'administration rend sans frais. Passez toujours par les liens de cette page ou par <a href=\"https://www.service-public.fr\" rel=\"noopener\">service-public.fr</a>.</p>",
      }),
      b("cta", {
        title: "Besoin d'aide pour une démarche en ligne ?",
        text: "L'accueil de la mairie peut vous accompagner. Des ateliers numériques sont également organisés pour les personnes qui souhaitent gagner en autonomie.",
        tone: "sable",
        actions: [
          { label: "Nous contacter", href: "/contact", icon: "Mail" },
          { label: "Voir l'agenda des ateliers", href: "/agenda", icon: "CalendarDays" },
        ],
      }),
    ],
  },
];

/* ========================================================================= */
/* Vivre à Chessy                                                            */
/* ========================================================================= */

const VIVRE: SeedPage[] = [
  {
    slug: "vivre-a-chessy",
    title: "Vivre à Chessy",
    navLabel: "Vivre à Chessy",
    order: 3,
    icon: "Users",
    excerpt: "Petite enfance, écoles, jeunesse, aînés, santé, commerces et mobilités.",
    cover: visuel("village", "vivre-cover", "Vivre à Chessy"),
    blocks: [
      b("richText", {
        title: "Le quotidien, à tous les âges",
        html: "<p>De la crèche à la retraite, cette rubrique rassemble les services qui accompagnent les habitants au quotidien : accueil des tout-petits, écoles et périscolaire, loisirs des jeunes, animations pour les aînés, santé de proximité, commerces et déplacements.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "",
        columns: "3",
        variant: "image",
        cards: [
          {
            title: "Petite enfance",
            text: "Multi-accueil Le Petit Chessillon, assistantes maternelles, relais petite enfance.",
            image: { url: visuel("abstrait", "petite-enfance"), alt: "Petite enfance" },
            href: "/vivre-a-chessy/petite-enfance",
          },
          {
            title: "Écoles et restaurant scolaire",
            text: "École publique La Chessylite, école Saint-Joseph, cantine et périscolaire.",
            image: { url: visuel("abstrait", "ecoles"), alt: "Écoles" },
            href: "/vivre-a-chessy/ecoles",
          },
          {
            title: "Enfance et jeunesse",
            text: "Accueils de loisirs, conseil municipal des enfants, activités des associations.",
            image: { url: visuel("paysage", "jeunesse"), alt: "Enfance et jeunesse" },
            href: "/vivre-a-chessy/enfance-jeunesse",
          },
          {
            title: "Aînés",
            text: "Animations, entraide, registre des personnes vulnérables, maintien à domicile.",
            image: { url: visuel("abstrait", "aines"), alt: "Aînés" },
            href: "/vivre-a-chessy/aines",
          },
          {
            title: "Santé",
            text: "Professionnels de santé du secteur, pharmacies de garde, numéros utiles.",
            image: { url: visuel("abstrait", "sante"), alt: "Santé" },
            href: "/vivre-a-chessy/sante",
          },
          {
            title: "Commerces et artisans",
            text: "Les professionnels installés sur la commune et le marché hebdomadaire.",
            image: { url: visuel("village", "commerces"), alt: "Commerces" },
            href: "/vivre-a-chessy/commerces",
          },
          {
            title: "Transports et mobilités",
            text: "Cars, gare, covoiturage, transport à la demande, mobilités douces.",
            image: { url: visuel("paysage", "transports"), alt: "Transports" },
            href: "/vivre-a-chessy/transports",
          },
          {
            title: "Les associations",
            text: "Quatorze associations font vivre le village toute l'année.",
            image: { url: visuel("village", "associations-carte"), alt: "Associations" },
            href: "/associations",
            badge: "Annuaire",
          },
          {
            title: "Nouveaux habitants",
            text: "Vous venez d'arriver ? Les démarches et les bons réflexes en un coup d'œil.",
            image: { url: visuel("village", "nouveaux-habitants"), alt: "Nouveaux habitants" },
            href: "/vivre-a-chessy/nouveaux-habitants",
          },
        ],
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/petite-enfance",
    title: "Petite enfance",
    navLabel: "Petite enfance",
    parent: "vivre-a-chessy",
    order: 0,
    icon: "Baby",
    excerpt: "Multi-accueil, assistantes maternelles et relais petite enfance.",
    blocks: [
      b("richText", {
        title: "Faire garder son enfant de 0 à 3 ans",
        html: "<p>Plusieurs modes d'accueil coexistent sur la commune et à l'échelle du territoire. Le bon choix dépend de vos horaires, de votre budget et du rythme de votre enfant — et il n'y a pas de mauvaise réponse.</p>",
        width: "lecture",
      }),
      b("columns", {
        title: "Les modes d'accueil",
        items: [
          {
            title: "Multi-accueil Le Petit Chessillon",
            icon: "Baby",
            html: "<p>Structure collective accueillant les enfants de <strong>10 semaines à 3 ans</strong>, en accueil régulier (contrat sur l'année) ou occasionnel (à la demande, selon les places disponibles).</p><p>L'équipe est composée de professionnelles de la petite enfance. Les projets pédagogiques privilégient la motricité libre, l'éveil sensoriel et la préparation en douceur à l'entrée à l'école.</p>",
          },
          {
            title: "Assistantes maternelles",
            icon: "Home",
            html: "<p>L'accueil individuel au domicile d'une professionnelle agréée offre souplesse d'horaires et petit effectif. La liste des assistantes maternelles agréées disponibles est tenue à jour par le relais petite enfance et consultable en mairie.</p><p>Vous devenez l'employeur : le relais vous accompagne sur le contrat, la rémunération et les aides de la CAF.</p>",
          },
          {
            title: "Relais petite enfance (RPE)",
            icon: "HeartHandshake",
            html: "<p>Service <strong>gratuit</strong> coordonné à l'échelle intercommunale, le relais informe les familles sur les modes d'accueil et les aides, accompagne les professionnelles et anime des temps de jeu partagés parents-enfants.</p><p>C'est le premier interlocuteur à contacter quand on cherche une solution de garde.</p>",
          },
        ],
      }),
      b("steps", {
        title: "Chercher une place : la marche à suivre",
        subtitle: "Anticipez : les demandes se déposent souvent plusieurs mois avant la date souhaitée.",
        items: [
          {
            title: "Contactez le relais petite enfance",
            text: "Il fait le point avec vous sur les solutions disponibles, les aides financières et les places à venir.",
          },
          {
            title: "Déposez votre demande",
            text: "Pour le multi-accueil, remplissez le dossier de pré-inscription en indiquant vos besoins d'horaires.",
          },
          {
            title: "Rencontrez la structure ou la professionnelle",
            text: "Une visite permet de se projeter et de poser toutes vos questions.",
          },
          {
            title: "Finalisez le contrat",
            text: "Contrat d'accueil, fiche sanitaire, autorisations : tout est calé avant le premier jour, avec une période d'adaptation progressive.",
          },
        ],
      }),
      b("alertBox", {
        level: "INFO",
        title: "Aides financières",
        html: "<p>Le complément mode de garde de la CAF, le crédit d'impôt pour la garde d'enfant et la tarification au quotient familial réduisent fortement le coût réel. Faites une simulation sur <a href=\"https://www.monenfant.fr\" rel=\"noopener\">monenfant.fr</a> avant de choisir.</p>",
      }),
      b("cta", {
        title: "Une question sur la petite enfance ?",
        text: "L'accueil de la mairie vous met en relation avec le bon interlocuteur.",
        tone: "sable",
        actions: [{ label: "Nous écrire", href: "/contact?objet=Petite%20enfance", icon: "Mail" }],
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/ecoles",
    title: "Écoles et restaurant scolaire",
    navLabel: "Écoles",
    parent: "vivre-a-chessy",
    order: 1,
    icon: "GraduationCap",
    excerpt: "École publique La Chessylite, école Saint-Joseph, cantine et périscolaire.",
    blocks: [
      b("richText", {
        title: "Deux écoles dans le village",
        html: "<p>Chessy-les-Mines accueille l'<strong>école publique La Chessylite</strong> — dont le nom rend hommage à l'azurite du village — et l'<strong>école privée Saint-Joseph</strong>, sous contrat d'association avec l'État.</p><p>La commune assure pour l'école publique : les locaux et leur entretien, les fournitures scolaires, le restaurant scolaire, l'accueil périscolaire et le financement des projets pédagogiques, en lien avec le sou des écoles.</p>",
        width: "lecture",
      }),
      b("tabs", {
        title: "",
        items: [
          {
            label: "Inscription à l'école",
            html: "<h3>Quand ?</h3><p>La campagne d'inscription s'ouvre en <strong>janvier</strong> pour la rentrée de septembre. Elle concerne les enfants qui entrent en petite section et tout enfant nouvellement arrivé sur la commune.</p><h3>Comment ?</h3><p>L'inscription se fait en deux temps : d'abord l'<strong>inscription administrative en mairie</strong>, puis l'<strong>admission auprès de la direction de l'école</strong>, sur rendez-vous.</p><h3>Pièces à apporter en mairie</h3><ul><li>livret de famille ou acte de naissance de l'enfant ;</li><li>justificatif de domicile de moins de trois mois ;</li><li>carnet de santé (vaccinations à jour) ;</li><li>certificat de radiation en cas de changement d'école.</li></ul>",
          },
          {
            label: "Restaurant scolaire",
            html: "<h3>Inscription préalable obligatoire</h3><p>Les enfants doivent être <strong>inscrits au préalable</strong> par leurs parents sur le portail famille pour déjeuner au restaurant scolaire. Sans inscription, l'enfant ne peut pas être accueilli : cette règle permet de commander le bon nombre de repas et de limiter le gaspillage.</p><h3>Les repas</h3><p>Les repas sont préparés par un prestataire de restauration collective. Les menus sont publiés par période et affichés à l'école ainsi qu'en mairie.</p><h3>Tarifs</h3><p>Le tarif du repas est fixé par le conseil municipal. Une modulation selon le quotient familial est appliquée : pensez à transmettre votre attestation CAF.</p><h3>Allergies et régimes</h3><p>Signalez toute allergie ou intolérance dès l'inscription : un protocole d'accueil individualisé peut être mis en place avec le médecin scolaire.</p>",
          },
          {
            label: "Accueil périscolaire et ALSH",
            html: "<h3>Périscolaire</h3><p>Un accueil est proposé le matin avant la classe et le soir après la classe, encadré par des animateurs. L'inscription se fait sur le portail famille, à la période ou à l'unité.</p><h3>Accueils de loisirs sans hébergement</h3><p>Les <strong>ALSH</strong> — mercredis et vacances scolaires — sont coordonnés à l'échelle de la <strong>Communauté de communes Beaujolais Pierres Dorées</strong>. Les inscriptions et la facturation passent donc par l'intercommunalité.</p><h3>Transport scolaire</h3><p>Le transport scolaire vers les collèges et lycées du secteur est organisé par la Région. L'inscription est annuelle et se fait en ligne, au printemps.</p>",
          },
          {
            label: "Le sou des écoles",
            html: "<h3>Une association essentielle</h3><p>Le <strong>sou des écoles</strong> finance les sorties, les spectacles, les intervenants et le matériel pédagogique grâce aux manifestations qu'il organise : vide-greniers, marché de Noël, kermesse, ventes de gâteaux.</p><p>Toutes les familles sont bienvenues, même pour un coup de main ponctuel sur une seule manifestation : c'est souvent comme cela qu'on commence.</p><p><a href=\"/associations/sou-des-ecoles\">Découvrir le sou des écoles</a></p>",
          },
        ],
      }),
      b("cardGrid", {
        title: "Démarches liées",
        columns: "2",
        variant: "icone",
        cards: [
          {
            title: "Inscrire mon enfant à l'école",
            text: "La fiche complète : pièces à fournir, calendrier, contacts.",
            icon: "GraduationCap",
            href: "/demarches/inscription-scolaire",
          },
          {
            title: "Restaurant scolaire et périscolaire",
            text: "Modalités d'inscription, tarifs, menus et fiche sanitaire.",
            icon: "UtensilsCrossed",
            href: "/demarches/restaurant-scolaire-periscolaire",
          },
        ],
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/enfance-jeunesse",
    title: "Enfance et jeunesse",
    navLabel: "Enfance et jeunesse",
    parent: "vivre-a-chessy",
    order: 2,
    icon: "Blocks",
    excerpt: "Accueils de loisirs, conseil municipal des enfants et activités des associations.",
    blocks: [
      b("richText", {
        title: "Grandir à Chessy",
        html: "<p>Entre les accueils de loisirs, les associations sportives et culturelles et le conseil municipal des enfants, les jeunes Cassissiens ne manquent pas d'occasions de s'occuper, d'apprendre et de prendre des responsabilités.</p>",
        width: "lecture",
      }),
      b("imageText", {
        eyebrow: "Citoyenneté",
        title: "Le conseil municipal des enfants",
        html: "<p>Élus par leurs camarades, les jeunes conseillères et conseillers siègent en mairie et portent des projets concrets pour la commune : aménagement de la cour, boîte à livres, action propreté, rencontre intergénérationnelle avec les aînés.</p><p>Le CME est une <strong>véritable école de citoyenneté</strong> : on y apprend à formuler une idée, à la défendre devant les autres, à composer avec un budget et à mener un projet jusqu'au bout. Les séances sont préparées avec un élu référent et un animateur.</p>",
        image: { url: visuel("abstrait", "cme-illustration"), alt: "Conseil municipal des enfants" },
        position: "right",
        tone: "blanc",
        actions: [{ label: "Voir l'agenda", href: "/agenda", icon: "CalendarDays" }],
      }),
      b("columns", {
        title: "Les temps de loisirs",
        items: [
          {
            title: "Accueils de loisirs (ALSH)",
            icon: "Tent",
            html: "<p>Les mercredis et les vacances scolaires, les accueils de loisirs proposent activités manuelles, sport, sorties et grands jeux. Ils sont coordonnés par la <strong>Communauté de communes Beaujolais Pierres Dorées</strong>, qui gère les inscriptions et la facturation au quotient familial.</p>",
          },
          {
            title: "Les associations",
            icon: "Trophy",
            html: "<p>Danse, arts martiaux, musique, aéromodélisme, boule lyonnaise : la plupart des associations de la commune proposent des sections enfants ou ados. Les inscriptions ont lieu à la rentrée, souvent lors du forum des associations.</p><p><a href=\"/associations\">Voir l'annuaire des associations</a></p>",
          },
          {
            title: "Jeunesse et orientation",
            icon: "Compass",
            html: "<p>Le <strong>recensement citoyen</strong> est obligatoire à 16 ans et conditionne l'inscription au permis et aux examens. La <strong>Maison Familiale Rurale</strong> de Chessy propose des formations par alternance, et la Mission locale accompagne les 16-25 ans dans leur insertion.</p><p><a href=\"/demarches/recensement-citoyen\">Se faire recenser</a></p>",
          },
        ],
      }),
      b("agendaList", {
        title: "Prochaines animations",
        subtitle: "",
        limit: 4,
        layout: "grille",
        showMore: true,
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/aines",
    title: "Les aînés",
    navLabel: "Aînés",
    parent: "vivre-a-chessy",
    order: 3,
    icon: "Heart",
    excerpt: "Animations, entraide, maintien à domicile et registre des personnes vulnérables.",
    blocks: [
      b("richText", {
        title: "Bien vivre sa retraite à Chessy",
        html: "<p>Rester chez soi, garder du lien, continuer à sortir : la commune et ses associations s'organisent pour que l'avancée en âge ne rime pas avec isolement.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "",
        columns: "2",
        variant: "icone",
        cards: [
          {
            title: "Comité d'Entraide au 3e Âge",
            text: "Après-midis jeux, sorties, repas partagés et voyages. Un rendez-vous régulier et chaleureux, ouvert à tous les retraités du secteur.",
            icon: "Users",
            href: "/associations/comite-entraide-3eme-age",
          },
          {
            title: "Registre des personnes vulnérables",
            text: "Inscription volontaire et confidentielle auprès du CCAS. En cas de canicule ou de grand froid, la commune prend de vos nouvelles.",
            icon: "ShieldCheck",
            href: "/la-mairie/ccas",
          },
          {
            title: "Maintien à domicile",
            text: "Aide à domicile, portage de repas, téléassistance, adaptation du logement : le CCAS vous aide à identifier le bon dispositif et à monter le dossier d'APA.",
            icon: "Home",
            href: "/la-mairie/ccas",
          },
          {
            title: "Ateliers numériques",
            text: "Prendre en main son téléphone, faire une démarche en ligne, éviter les arnaques : des ateliers en petit groupe, sans jugement.",
            icon: "Laptop",
            href: "/agenda",
          },
          {
            title: "Colis et repas des aînés",
            text: "Chaque fin d'année, la commune organise un temps convivial et distribue un colis aux aînés qui ne peuvent s'y rendre.",
            icon: "Gift",
          },
          {
            title: "Cap Générations",
            text: "Association intergénérationnelle : ateliers partagés, entraide numérique, rencontres entre les âges.",
            icon: "HeartHandshake",
            href: "/associations/cap-generations",
          },
        ],
      }),
      b("alertBox", {
        level: "INFO",
        title: "Vous vous inquiétez pour un voisin isolé ?",
        html: "<p>Signalez-le discrètement au CCAS : une visite de convivialité peut être organisée. Mieux vaut un signalement inutile qu'une situation qui s'aggrave sans que personne ne s'en aperçoive.</p><p><a href=\"/contact?objet=CCAS\">Prévenir le CCAS</a></p>",
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/sante",
    title: "Santé",
    navLabel: "Santé",
    parent: "vivre-a-chessy",
    order: 4,
    icon: "Stethoscope",
    excerpt: "Professionnels de santé du secteur, pharmacies de garde et numéros utiles.",
    blocks: [
      b("richText", {
        title: "Se soigner près de chez soi",
        html: "<p>Les professionnels de santé installés sur la commune et dans les villages voisins assurent les soins de proximité. Pour les urgences et les gardes, des dispositifs spécifiques existent en soirée et le week-end.</p>",
        width: "lecture",
      }),
      b("pricingTable", {
        title: "Numéros de santé à connaître",
        subtitle: "",
        colLabel: "Situation",
        colValue: "Numéro",
        rows: [
          { label: "Urgence vitale", value: "15 ou 112", note: "SAMU — arrêt cardiaque, détresse respiratoire, malaise grave" },
          { label: "Médecin de garde le soir et le week-end", value: "116 117", note: "Permanence des soins ambulatoires" },
          { label: "Pharmacie de garde", value: "3237", note: "Service payant — ou affichage en pharmacie" },
          { label: "Urgences pour les personnes sourdes et malentendantes", value: "114", note: "Par SMS" },
          { label: "Centre antipoison", value: "04 72 11 69 11", note: "Centre antipoison de Lyon" },
          { label: "Sida info service", value: "0 800 840 800", note: "Anonyme et gratuit" },
          { label: "Alcool info service", value: "0 980 980 930", note: "" },
          { label: "Écoute et soutien psychologique", value: "3114", note: "Prévention du suicide, 24h/24, gratuit" },
        ],
      }),
      b("accordion", {
        title: "Questions pratiques",
        subtitle: "",
        items: [
          {
            question: "Je cherche un médecin traitant",
            answer:
              "<p>Consultez l'annuaire santé de l'Assurance maladie sur <a href=\"https://annuairesante.ameli.fr\" rel=\"noopener\">annuairesante.ameli.fr</a> : il indique les professionnels du secteur, leurs tarifs et s'ils acceptent de nouveaux patients. En cas de difficulté persistante, la conciliation de l'Assurance maladie peut vous aider.</p>",
          },
          {
            question: "Comment obtenir un rendez-vous rapidement ?",
            answer:
              "<p>Pour un besoin non urgent mais rapide, le 116 117 peut vous orienter. La téléconsultation est également une solution pour un renouvellement d'ordonnance ou un avis simple.</p>",
          },
          {
            question: "Où faire une prise de sang ou une radiographie ?",
            answer:
              "<p>Les laboratoires d'analyses et les centres d'imagerie les plus proches se situent à L'Arbresle, au Bois-d'Oingt et à Villefranche-sur-Saône. Prenez rendez-vous à l'avance et pensez à votre ordonnance et à votre carte Vitale.</p>",
          },
          {
            question: "Défibrillateur : où en trouver un ?",
            answer:
              "<p>Un défibrillateur automatisé externe est installé sur un bâtiment public de la commune. Son emplacement est signalé et il est accessible en permanence. En cas de malaise, appelez d'abord le 15 : l'opérateur vous guidera.</p>",
          },
        ],
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/commerces",
    title: "Commerces et artisans",
    navLabel: "Commerces et artisans",
    parent: "vivre-a-chessy",
    order: 5,
    icon: "Store",
    excerpt: "Les professionnels installés sur la commune et le marché hebdomadaire.",
    blocks: [
      b("richText", {
        title: "Consommer local, tout simplement",
        html: "<p>Faire ses courses au village, faire appel à un artisan du coin : c'est du temps gagné, des kilomètres évités et des emplois maintenus sur le territoire.</p><p>Cette page recense les commerces, artisans et producteurs de Chessy-les-Mines. <strong>Vous êtes professionnel sur la commune et absent de cette liste ?</strong> Signalez-vous : l'inscription est gratuite.</p>",
        width: "lecture",
      }),
      b("alertBox", {
        level: "INFO",
        title: "Annuaire en cours de constitution",
        html: "<p>La mairie recense actuellement les commerçants, artisans et producteurs de la commune afin de publier un annuaire complet et à jour. Si vous exercez une activité à Chessy-les-Mines, transmettez-nous votre fiche : nom, activité, adresse, horaires, téléphone et site internet.</p><p><a href=\"/contact?objet=Inscription%20annuaire%20des%20commerces\">Inscrire mon activité</a></p>",
      }),
      b("columns", {
        title: "Les rendez-vous du commerce local",
        items: [
          {
            title: "Le marché",
            icon: "ShoppingBasket",
            html: "<p>Un marché de producteurs et de commerçants ambulants se tient sur la place du village. Fruits et légumes, fromages, pain, volailles : les horaires exacts sont affichés en mairie et publiés dans l'agenda du site.</p>",
          },
          {
            title: "Les producteurs du Beaujolais",
            icon: "Grape",
            html: "<p>Le territoire des Pierres Dorées compte de nombreux vignerons, maraîchers et éleveurs pratiquant la vente directe. Plusieurs proposent des paniers hebdomadaires ou une boutique à la ferme.</p>",
          },
          {
            title: "Artisans et services",
            icon: "Wrench",
            html: "<p>Bâtiment, jardinage, dépannage, soins à domicile : les artisans et professionnels du secteur intervenant sur la commune sont recensés dans l'annuaire. Demandez toujours plusieurs devis pour vos travaux.</p>",
          },
        ],
      }),
      b("cta", {
        title: "Vous créez une activité à Chessy ?",
        text: "La commune peut vous orienter vers les bons interlocuteurs : chambre de commerce, chambre de métiers, service développement économique de l'intercommunalité.",
        tone: "sable",
        actions: [{ label: "Nous contacter", href: "/contact", icon: "Mail" }],
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/transports",
    title: "Transports et mobilités",
    navLabel: "Transports et mobilités",
    parent: "vivre-a-chessy",
    order: 6,
    icon: "Bus",
    excerpt: "Cars, train, covoiturage, transport à la demande et mobilités douces.",
    blocks: [
      b("richText", {
        title: "Se déplacer depuis Chessy-les-Mines",
        html: "<p>La commune est située à proximité de l'axe reliant L'Arbresle à Villefranche-sur-Saône, dans le Beaujolais des Pierres Dorées. Plusieurs solutions permettent de se déplacer sans dépendre uniquement de la voiture individuelle.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "",
        columns: "2",
        variant: "icone",
        cards: [
          {
            title: "Cars régionaux",
            text: "Des lignes régulières desservent le secteur vers L'Arbresle, Villefranche-sur-Saône et Lyon. Horaires et tarifs auprès du réseau régional de transports.",
            icon: "Bus",
          },
          {
            title: "Train",
            text: "Les gares les plus proches permettent de rejoindre Lyon et Roanne. Le billet unique et les abonnements régionaux facilitent les trajets quotidiens.",
            icon: "TrainFront",
          },
          {
            title: "Transport à la demande",
            text: "Un service de transport à la demande est organisé à l'échelle intercommunale pour les trajets non couverts par les lignes régulières. Réservation préalable obligatoire.",
            icon: "CarTaxiFront",
          },
          {
            title: "Covoiturage",
            text: "Les aires de covoiturage du secteur et les plateformes régionales facilitent les trajets domicile-travail. Une solution économique pour rejoindre l'agglomération lyonnaise.",
            icon: "Users",
          },
          {
            title: "Vélo et mobilités douces",
            text: "Les petites routes du Beaujolais se prêtent bien au vélo. Des aides à l'achat de vélo à assistance électrique existent au niveau régional et intercommunal.",
            icon: "Bike",
          },
          {
            title: "Transport scolaire",
            text: "Le transport vers les collèges et lycées est organisé par la Région. Inscription annuelle en ligne, au printemps.",
            icon: "GraduationCap",
          },
        ],
      }),
      b("alertBox", {
        level: "INFO",
        title: "Borne de recharge et voitures électriques",
        html: "<p>Le déploiement des bornes de recharge se poursuit sur le territoire. Consultez les cartes des opérateurs pour localiser la borne la plus proche et vérifier sa disponibilité en temps réel.</p>",
      }),
    ],
  },
  {
    slug: "vivre-a-chessy/nouveaux-habitants",
    title: "Nouveaux habitants",
    navLabel: "Nouveaux habitants",
    parent: "vivre-a-chessy",
    order: 7,
    icon: "DoorOpen",
    excerpt: "Vous venez d'arriver à Chessy-les-Mines ? Voici l'essentiel.",
    blocks: [
      b("hero", {
        eyebrow: "Bienvenue",
        title: "Vous venez d'arriver à Chessy-les-Mines ?",
        subtitle:
          "Voici, dans l'ordre, les démarches à ne pas oublier et les bons réflexes pour bien démarrer dans le village.",
        image: { url: visuel("village", "bienvenue"), alt: "Vue du village" },
        height: "compact",
        align: "left",
        showSearch: false,
        actions: [{ label: "Se présenter à la mairie", href: "/contact", icon: "Mail" }],
      }),
      b("steps", {
        title: "Vos premières démarches",
        subtitle: "Comptez une heure au total, dont une visite à l'accueil de la mairie.",
        items: [
          {
            title: "Passez à l'accueil de la mairie",
            text: "Signalez votre arrivée : nous enregistrons vos coordonnées, vous remettons les informations pratiques et répondons à vos questions.",
          },
          {
            title: "Ouvrez votre contrat d'eau",
            text: "Le service de l'eau est géré par la commune. Communiquez la date d'entrée et le relevé du compteur pour établir un relevé contradictoire.",
          },
          {
            title: "Inscrivez-vous sur la liste électorale",
            text: "L'inscription est possible toute l'année. Munissez-vous d'une pièce d'identité et d'un justificatif de domicile récent.",
          },
          {
            title: "Inscrivez vos enfants à l'école",
            text: "Inscription administrative en mairie, puis admission auprès de la direction de l'école. Pensez aussi à la cantine et au périscolaire.",
          },
          {
            title: "Installez PanneauPocket",
            text: "L'application gratuite vous prévient des coupures d'eau, alertes météo et informations urgentes de la commune.",
          },
          {
            title: "Découvrez les associations",
            text: "Quatorze associations font vivre le village. C'est souvent la meilleure façon de rencontrer ses voisins.",
          },
        ],
      }),
      b("quickLinks", {
        title: "Les liens utiles",
        subtitle: "",
        columns: "3",
        links: [
          { label: "Abonnement au service de l'eau", href: "/demarches/abonnement-eau", icon: "Droplets" },
          { label: "Listes électorales", href: "/demarches/inscription-liste-electorale", icon: "Vote" },
          { label: "Inscription scolaire", href: "/demarches/inscription-scolaire", icon: "GraduationCap" },
          { label: "Collecte des déchets", href: "/cadre-de-vie/dechets", icon: "Recycle" },
          { label: "Annuaire des associations", href: "/associations", icon: "Users" },
          { label: "Les équipements du village", href: "/cadre-de-vie/equipements", icon: "MapPin" },
        ],
      }),
      b("newsletter", {
        title: "Ne rien manquer de la vie communale",
        text: "Inscrivez-vous à la lettre d'information : c'est le moyen le plus simple de rester au courant.",
        tone: "sable",
      }),
    ],
  },
];

/* ========================================================================= */
/* Cadre de vie                                                              */
/* ========================================================================= */

const CADRE: SeedPage[] = [
  {
    slug: "cadre-de-vie",
    title: "Cadre de vie et patrimoine",
    navLabel: "Cadre de vie",
    order: 4,
    icon: "Trees",
    excerpt: "Patrimoine minier, urbanisme, eau, déchets, environnement et équipements.",
    cover: visuel("paysage", "cadre-cover", "Cadre de vie"),
    blocks: [
      b("richText", {
        title: "Un village entre pierres dorées et galeries de cuivre",
        html: "<p>Chessy-les-Mines doit son nom et sa renommée à son sous-sol. Ici, on a extrait le cuivre pendant deux millénaires, et l'on a découvert une azurite si belle qu'elle porte le nom du village : la <strong>chessylite</strong>.</p><p>Cette rubrique rassemble ce qui façonne le cadre de vie quotidien : le patrimoine à préserver, les règles d'urbanisme, la gestion de l'eau et des déchets, les engagements environnementaux et la carte des équipements publics.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "",
        columns: "3",
        variant: "image",
        cards: [
          {
            title: "Patrimoine et histoire des mines",
            text: "Deux mille ans d'exploitation du cuivre, l'azurite de Chessy, l'église du XIIe siècle et le château.",
            image: { url: visuel("mine", "patrimoine-carte"), alt: "Galerie de mine" },
            href: "/cadre-de-vie/patrimoine",
            badge: "À découvrir",
          },
          {
            title: "Urbanisme et PLU",
            text: "Règles de construction, autorisations, cadastre et permanences du service urbanisme.",
            image: { url: visuel("village", "urbanisme-carte"), alt: "Village" },
            href: "/cadre-de-vie/urbanisme",
          },
          {
            title: "Eau et assainissement",
            text: "Abonnement, qualité de l'eau, relevés, fuites et assainissement.",
            image: { url: visuel("abstrait", "eau-carte"), alt: "Eau" },
            href: "/cadre-de-vie/eau-assainissement",
          },
          {
            title: "Déchets et propreté",
            text: "Collecte, tri, déchèterie, encombrants et lutte contre les dépôts sauvages.",
            image: { url: visuel("abstrait", "dechets-carte"), alt: "Déchets" },
            href: "/cadre-de-vie/dechets",
          },
          {
            title: "Environnement et biodiversité",
            text: "Zéro phyto, gestion différenciée, Geopark Beaujolais, sobriété énergétique.",
            image: { url: visuel("paysage", "environnement-carte"), alt: "Paysage" },
            href: "/cadre-de-vie/environnement",
          },
          {
            title: "Les équipements communaux",
            text: "Mairie, écoles, salles, terrains de sport, aire de jeux : la carte complète.",
            image: { url: visuel("abstrait", "equipements-carte"), alt: "Équipements" },
            href: "/cadre-de-vie/equipements",
          },
        ],
      }),
      b("serviceTeaser", {
        service: "signalement",
        title: "Quelque chose ne va pas dans l'espace public ?",
        text: "Trottoir dégradé, lampadaire éteint, dépôt sauvage, fuite d'eau : signalez-le en deux minutes, photo et localisation à l'appui.",
        ctaLabel: "Faire un signalement",
        image: { url: visuel("abstrait", "signalement-cadre"), alt: "Signalement" },
      }),
    ],
  },
  {
    slug: "cadre-de-vie/patrimoine",
    title: "Patrimoine et histoire des mines",
    navLabel: "Patrimoine",
    parent: "cadre-de-vie",
    order: 0,
    icon: "Pickaxe",
    excerpt:
      "Deux mille ans d'exploitation du cuivre, l'azurite de Chessy, l'église du XIIe siècle et le château.",
    cover: visuel("mine", "patrimoine-cover", "Patrimoine minier"),
    seoDescription:
      "Histoire des mines de cuivre de Chessy-les-Mines, azurite dite chessylite, église du XIIe siècle et château inscrit : le patrimoine de la commune.",
    blocks: [
      b("hero", {
        eyebrow: "Patrimoine",
        title: "Chessy, la pierre bleue du Beaujolais",
        subtitle:
          "C'est ici qu'a été identifiée l'une des plus belles azurites du monde. Elle porte le nom du village : la chessylite.",
        image: { url: visuel("mine", "hero-patrimoine"), alt: "Cristaux d'azurite" },
        height: "moyenne",
        align: "left",
        showSearch: false,
        actions: [],
      }),
      b("richText", {
        title: "Deux mille ans d'exploitation du cuivre",
        html: "<p>Les mines de Chessy ont été exploitées <strong>dès l'époque romaine</strong> pour le cuivre, puis abandonnées pendant des siècles. Elles ont été remises en activité à partir du <strong>XVe siècle</strong>, sous l'impulsion de Jacques Cœur, grand argentier de Charles VII, qui s'intéressait aux ressources minières du royaume.</p><p>Plusieurs filons ont été exploités successivement — on parlait de la <em>mine noire</em>, de la <em>mine jaune</em> — chacun livrant un minerai différent duquel on extrayait le cuivre. Les techniques ont évolué : galeries, puits, traitement du minerai sur place.</p>",
        width: "lecture",
      }),
      b("timeline", {
        title: "Les grandes dates",
        subtitle: "De l'Antiquité à la fermeture des galeries.",
        items: [
          {
            date: "Époque romaine",
            title: "Les premières extractions",
            text: "Le cuivre de Chessy est exploité par les Romains, qui savent identifier et suivre les filons superficiels.",
          },
          {
            date: "XVe siècle",
            title: "La relance par Jacques Cœur",
            text: "Grand argentier de Charles VII, Jacques Cœur relance l'exploitation minière. Chessy devient un site de référence pour le cuivre.",
          },
          {
            date: "XVIIIe siècle",
            title: "Une exploitation industrielle",
            text: "Les galeries se développent, les techniques de traitement du minerai se perfectionnent, l'activité structure la vie du village.",
          },
          {
            date: "1811 – 1828",
            title: "La Mine Bleue et l'âge d'or",
            text: "La découverte de la Mine Bleue ouvre une période de prospérité. C'est de cette veine que proviennent les plus beaux cristaux d'azurite, aujourd'hui exposés dans les grands musées de minéralogie.",
          },
          {
            date: "1852",
            title: "La chessylite entre dans la science",
            text: "Les minéralogistes Brooke et Miller définissent et baptisent la « chessylite », habitus particulier de l'azurite propre au gisement de Chessy.",
          },
          {
            date: "XXe siècle",
            title: "La fin de l'exploitation",
            text: "L'activité minière cesse. Le sous-sol conserve la mémoire des galeries, et le nom du village celle de son minerai.",
          },
        ],
      }),
      b("imageText", {
        eyebrow: "Minéralogie",
        title: "L'azurite, ou chessylite",
        html: "<p>L'azurite est un carbonate de cuivre d'un bleu profond, presque électrique. Le gisement de Chessy s'est formé par l'interaction de grès carbonatés triasiques avec un amas sulfuré dévonien : une conjonction géologique rare, qui explique la qualité exceptionnelle des cristaux.</p><p>La variété dite <strong>chessylite</strong>, définie et baptisée en 1852 par Brooke et Miller, désigne un habitus cristallin particulier propre à ce gisement. Les collectionneurs et les musées du monde entier connaissent le nom de Chessy pour cette raison.</p><p>L'<strong>AMAC</strong>, association minéralogique locale, fait vivre cette mémoire : expositions, bourses aux minéraux, sorties de terrain et interventions auprès des scolaires.</p>",
        image: { url: visuel("mine", "azurite-detail"), alt: "Cristaux d'azurite bleus" },
        position: "left",
        tone: "sable",
        actions: [{ label: "Découvrir l'AMAC", href: "/associations/amac", icon: "Users" }],
      }),
      b("columns", {
        title: "Le patrimoine bâti",
        items: [
          {
            title: "L'église",
            icon: "Church",
            html: "<p>Bâtie au <strong>XIIe siècle</strong> par les moines de Savigny dans le style gothique, l'église a été enrichie de <strong>chapelles latérales</strong> aux XIVe et XVe siècles. Elle conserve une <strong>galonnière du XVIIe siècle</strong>, élément typique de l'architecture du secteur.</p>",
          },
          {
            title: "Le château",
            icon: "Castle",
            html: "<p>Le château de Chessy est <strong>inscrit au titre des monuments historiques depuis 2004</strong>. Il constitue, avec l'église, l'un des deux repères majeurs du patrimoine architectural communal.</p>",
          },
          {
            title: "La pierre dorée",
            icon: "Blocks",
            html: "<p>Chessy appartient au <strong>Beaujolais des Pierres Dorées</strong>, dont les murs de calcaire à entroques prennent une teinte ocre chaude au soleil. Cette pierre locale donne au village son unité et sa lumière particulière en fin de journée.</p>",
          },
        ],
      }),
      b("imageText", {
        eyebrow: "Géotourisme",
        title: "Un site remarquable du Geopark Beaujolais",
        html: "<p>Le Beaujolais est labellisé <strong>Geopark mondial UNESCO</strong> pour la richesse et la lisibilité de son patrimoine géologique. Chessy-les-Mines y figure comme un site remarquable : le gisement de cuivre et d'azurite raconte une histoire géologique de plusieurs centaines de millions d'années, doublée d'une histoire humaine de deux millénaires.</p><p>Sentiers de découverte, points de vue sur les monts du Beaujolais, panneaux d'interprétation : le territoire se parcourt à pied, en famille.</p>",
        image: { url: visuel("paysage", "geopark"), alt: "Paysage du Beaujolais" },
        position: "right",
        tone: "blanc",
        actions: [
          { label: "Site du Geopark Beaujolais", href: "https://www.geopark-beaujolais.com", icon: "ExternalLink" },
        ],
      }),
      b("alertBox", {
        level: "VIGILANCE",
        title: "Prudence aux abords des anciens sites miniers",
        html: "<p>Les anciennes galeries et haldes peuvent présenter des risques d'effondrement. Ne pénétrez jamais dans une cavité et respectez les périmètres de sécurité et les propriétés privées. Pour découvrir le site en toute sécurité, participez aux sorties encadrées par l'AMAC.</p>",
      }),
      b("gallery", {
        title: "Le village en images",
        subtitle: "Ces visuels de démonstration seront remplacés par les photographies de la commune.",
        layout: "mosaique",
        images: [
          { image: { url: visuel("village", "galerie-1"), alt: "Le bourg" }, caption: "Le bourg et son église" },
          { image: { url: visuel("mine", "galerie-2"), alt: "Galerie de mine" }, caption: "Mémoire des galeries" },
          { image: { url: visuel("paysage", "galerie-3"), alt: "Vignes" }, caption: "Les coteaux du Beaujolais" },
          { image: { url: visuel("village", "galerie-4"), alt: "Ruelle" }, caption: "Ruelle en pierres dorées" },
          { image: { url: visuel("paysage", "galerie-5"), alt: "Panorama" }, caption: "Panorama sur les monts" },
          { image: { url: visuel("mine", "galerie-6"), alt: "Azurite" }, caption: "L'azurite de Chessy" },
        ],
      }),
    ],
  },
  {
    slug: "cadre-de-vie/urbanisme",
    title: "Urbanisme et travaux",
    navLabel: "Urbanisme",
    parent: "cadre-de-vie",
    order: 1,
    icon: "Ruler",
    excerpt: "Plan local d'urbanisme, autorisations de travaux, cadastre et permanences.",
    blocks: [
      b("richText", {
        title: "Avant de construire ou de rénover",
        html: "<p>Presque tous les travaux qui modifient l'aspect extérieur d'un bâtiment ou créent de la surface nécessitent une <strong>autorisation d'urbanisme</strong>. Déposer le bon dossier, complet, dès le départ, c'est le meilleur moyen d'éviter des mois de retard.</p><p>Le premier réflexe : consulter le <strong>plan local d'urbanisme</strong> pour connaître les règles applicables à votre parcelle — hauteur, implantation, aspect extérieur, stationnement, clôtures.</p>",
        width: "lecture",
      }),
      b("demarchesList", {
        title: "Les autorisations d'urbanisme",
        subtitle: "Choisissez la fiche correspondant à votre projet.",
        category: "URBANISME",
        groupByCategory: false,
      }),
      b("accordion", {
        title: "Quelle autorisation pour quel projet ?",
        subtitle: "Les cas les plus courants. En cas de doute, demandez conseil avant de déposer.",
        items: [
          {
            question: "Abri de jardin, carport, véranda",
            answer:
              "<p>Jusqu'à 5 m² : aucune formalité. De 5 à 20 m² (40 m² en zone urbaine du PLU) : <strong>déclaration préalable</strong>. Au-delà : <strong>permis de construire</strong>. Attention, une véranda ou un abri porte la surface totale de la construction : au-delà de 150 m², l'architecte devient obligatoire.</p>",
          },
          {
            question: "Clôture, mur, portail",
            answer:
              "<p>Une <strong>déclaration préalable</strong> est requise. Le PLU fixe la hauteur maximale, les matériaux et les teintes admises : renseignez-vous avant d'acheter vos matériaux.</p>",
          },
          {
            question: "Fenêtres, volets, ravalement, toiture",
            answer:
              "<p>Tout changement d'aspect extérieur — remplacement de menuiseries d'une autre couleur ou d'un autre matériau, ravalement, réfection de toiture, création d'une fenêtre de toit — nécessite une <strong>déclaration préalable</strong>.</p>",
          },
          {
            question: "Piscine",
            answer:
              "<p>Bassin de moins de 10 m² : aucune formalité (hors secteur protégé). De 10 à 100 m² non couverte : <strong>déclaration préalable</strong>. Au-delà, ou si la couverture dépasse 1,80 m de hauteur : <strong>permis de construire</strong>. Pensez à la déclaration fiscale de la piscine.</p>",
          },
          {
            question: "Panneaux photovoltaïques",
            answer:
              "<p>Une <strong>déclaration préalable</strong> est nécessaire pour une installation en toiture ou au sol. Le PLU peut imposer une intégration au plan de toiture. Vérifiez également les conditions de raccordement auprès du gestionnaire de réseau.</p>",
          },
          {
            question: "Changement de destination",
            answer:
              "<p>Transformer une grange en logement, un local commercial en habitation, ou l'inverse : <strong>déclaration préalable</strong>, ou <strong>permis de construire</strong> si les travaux modifient les structures porteuses ou la façade.</p>",
          },
        ],
      }),
      b("columns", {
        title: "Documents et services",
        items: [
          {
            title: "Plan local d'urbanisme",
            icon: "Map",
            html: "<p>Le PLU comprend un rapport de présentation, un projet d'aménagement et de développement durables, un règlement écrit et des documents graphiques. Il est consultable en mairie et téléchargeable sur ce site.</p>",
          },
          {
            title: "Cadastre",
            icon: "Grid3x3",
            html: "<p>Le plan cadastral est consultable gratuitement en ligne sur <a href=\"https://www.cadastre.gouv.fr\" rel=\"noopener\">cadastre.gouv.fr</a>. Pour un relevé de propriété, adressez-vous au service urbanisme.</p>",
          },
          {
            title: "Permanence urbanisme",
            icon: "CalendarClock",
            html: "<p>Une permanence est assurée sur rendez-vous. Venez avec votre plan de situation et vos croquis : un quart d'heure d'échange évite souvent un refus.</p><p><a href=\"/contact?type=RENDEZ_VOUS&objet=Urbanisme\">Demander un rendez-vous</a></p>",
          },
        ],
      }),
      b("documents", {
        title: "Documents d'urbanisme",
        subtitle: "",
        category: "URBANISME",
        limit: 20,
        groupByYear: false,
      }),
    ],
  },
  {
    slug: "cadre-de-vie/eau-assainissement",
    title: "Eau et assainissement",
    navLabel: "Eau et assainissement",
    parent: "cadre-de-vie",
    order: 2,
    icon: "Droplets",
    excerpt: "Abonnement, qualité de l'eau, relevés, fuites et assainissement.",
    blocks: [
      b("richText", {
        title: "Le service de l'eau de la commune",
        html: "<p>La commune gère le <strong>service de l'eau potable</strong> : abonnements, relevés de compteur, facturation, branchements et interventions sur le réseau. C'est donc à la mairie que vous vous adressez pour tout ce qui concerne votre contrat d'eau.</p><p>Pour toute question : <a href=\"mailto:service.eau@chessy69.fr\">service.eau@chessy69.fr</a> ou 04 78 43 92 03.</p>",
        width: "lecture",
      }),
      b("steps", {
        title: "J'arrive ou je quitte le logement",
        subtitle: "Le relevé contradictoire évite toute contestation sur la facture.",
        items: [
          {
            title: "Prévenez le service de l'eau",
            text: "Par courriel ou à l'accueil, en indiquant l'adresse exacte, le numéro de compteur et la date d'entrée ou de sortie.",
          },
          {
            title: "Relevez le compteur ce jour-là",
            text: "Notez l'index affiché et, si possible, photographiez-le. Ce relevé fait foi entre l'ancien et le nouvel occupant.",
          },
          {
            title: "Transmettez vos coordonnées",
            text: "Nom, adresse de facturation, téléphone, courriel et relevé d'identité bancaire si vous souhaitez le prélèvement automatique.",
          },
          {
            title: "Recevez votre contrat",
            text: "Le service établit le contrat d'abonnement et clôture le précédent. La première facture intègre la part fixe au prorata.",
          },
        ],
      }),
      b("accordion", {
        title: "Questions fréquentes",
        subtitle: "",
        items: [
          {
            question: "Ma facture d'eau est anormalement élevée : que faire ?",
            answer:
              "<p>Cela révèle souvent une <strong>fuite après compteur</strong>. Fermez tous les robinets et vérifiez si le compteur continue de tourner : si oui, il y a fuite. Faites intervenir un plombier, conservez la facture de réparation, puis adressez une demande d'écrêtement au service de l'eau : la loi prévoit un plafonnement de la facture en cas de fuite sur canalisation après compteur, dès lors que la réparation est justifiée.</p>",
          },
          {
            question: "L'eau est-elle de bonne qualité ?",
            answer:
              "<p>L'eau distribuée fait l'objet d'un contrôle sanitaire régulier par l'Agence régionale de santé. Les résultats d'analyses sont affichés en mairie et consultables sur le site du ministère de la santé. Toute non-conformité fait l'objet d'une information immédiate des abonnés.</p>",
          },
          {
            question: "L'eau est trouble ou colorée après des travaux",
            answer:
              "<p>Après une intervention sur le réseau, un dépôt peut se remettre en suspension. Laissez couler l'eau froide quelques minutes jusqu'à ce qu'elle redevienne claire. Si la situation persiste, prévenez la mairie.</p>",
          },
          {
            question: "Que faire en cas de coupure d'eau ?",
            answer:
              "<p>Les coupures programmées sont annoncées sur PanneauPocket et dans le bandeau de ce site. Pour une coupure non annoncée ou une fuite sur la voie publique, appelez la mairie. Après remise en service, laissez couler quelques minutes avant de consommer.</p>",
          },
          {
            question: "Assainissement collectif ou individuel ?",
            answer:
              "<p>L'<strong>assainissement collectif</strong> (tout-à-l'égout) relève de la compétence intercommunale. Si votre habitation n'est pas raccordable, vous relevez de l'<strong>assainissement non collectif</strong> : votre installation doit être conforme et est contrôlée périodiquement par le service public d'assainissement non collectif.</p>",
          },
          {
            question: "Comment protéger mon compteur du gel ?",
            answer:
              "<p>Isolez le compteur et les canalisations exposées avec un matériau non absorbant. En cas d'absence prolongée en hiver, fermez le robinet d'arrêt et vidangez l'installation. Le compteur endommagé par le gel est à la charge de l'abonné.</p>",
          },
        ],
      }),
      b("cardGrid", {
        title: "Économiser l'eau, un geste utile",
        columns: "3",
        variant: "icone",
        cards: [
          {
            title: "Repérer les fuites",
            text: "Un robinet qui goutte représente plusieurs litres par jour. Relevez votre compteur avant et après une nuit sans consommation pour détecter une fuite invisible.",
            icon: "Droplet",
          },
          {
            title: "Récupérer l'eau de pluie",
            text: "Un récupérateur permet d'arroser le jardin sans puiser dans l'eau potable. Attention : l'usage domestique de l'eau de pluie est encadré.",
            icon: "CloudRain",
          },
          {
            title: "Arroser au bon moment",
            text: "Arrosez tôt le matin ou en soirée, au pied des plantes, et paillez le sol : vous diviserez vos besoins par deux.",
            icon: "Sprout",
          },
        ],
      }),
      b("cta", {
        title: "Une question sur votre contrat d'eau ?",
        text: "Le service de l'eau vous répond directement.",
        tone: "azur",
        actions: [
          { label: "Écrire au service de l'eau", href: "/contact?objet=Service%20de%20l%27eau", icon: "Mail" },
          { label: "Fiche démarche", href: "/demarches/abonnement-eau", icon: "FileText" },
        ],
      }),
    ],
  },
  {
    slug: "cadre-de-vie/dechets",
    title: "Déchets et propreté",
    navLabel: "Déchets",
    parent: "cadre-de-vie",
    order: 3,
    icon: "Recycle",
    excerpt: "Collecte, tri, déchèterie, encombrants et dépôts sauvages.",
    blocks: [
      b("richText", {
        title: "Bien trier, c'est simple quand on sait où va quoi",
        html: "<p>La collecte et le traitement des déchets sont assurés à l'échelle de la <strong>Communauté de communes Beaujolais Pierres Dorées</strong>. La commune relaie les informations pratiques et intervient sur la propreté de l'espace public.</p><p>Sortez vos bacs la veille au soir et rentrez-les dès le passage effectué : c'est une question de sécurité pour les piétons et d'esthétique pour le village.</p>",
        width: "lecture",
      }),
      b("columns", {
        title: "Où va quoi ?",
        items: [
          {
            title: "Bac jaune — emballages",
            icon: "Package",
            html: "<p><strong>Oui :</strong> emballages en plastique (bouteilles, flacons, pots, barquettes, films), briques alimentaires, cartonnettes, papiers, boîtes de conserve, aérosols vides, capsules.</p><p><strong>Non :</strong> couches, masques, vaisselle cassée, jouets, textiles, déchets alimentaires.</p><p>Inutile de laver les emballages : videz-les simplement, et ne les imbriquez pas les uns dans les autres.</p>",
          },
          {
            title: "Bac gris — ordures ménagères",
            icon: "Trash2",
            html: "<p>Tout ce qui ne se trie pas ailleurs : restes alimentaires non compostés, couches, papiers souillés, vaisselle cassée, petits objets non recyclables.</p><p>Les sacs doivent être fermés et déposés dans le bac, jamais à côté.</p>",
          },
          {
            title: "Colonnes à verre",
            icon: "Wine",
            html: "<p><strong>Oui :</strong> bouteilles, bocaux, pots en verre — sans bouchon ni couvercle.</p><p><strong>Non :</strong> vaisselle, faïence, vitres, ampoules, miroirs, qui ne fondent pas à la même température.</p><p>Merci de respecter le voisinage : pas de dépôt avant 8h ni après 20h.</p>",
          },
        ],
      }),
      b("cardGrid", {
        title: "Les autres déchets",
        columns: "2",
        variant: "icone",
        cards: [
          {
            title: "Déchèterie",
            text: "Encombrants, déchets verts, gravats, bois, métaux, déchets dangereux, appareils électriques. Accès sur présentation d'un justificatif de domicile ; horaires auprès de l'intercommunalité.",
            icon: "Truck",
          },
          {
            title: "Déchets verts",
            text: "Le brûlage à l'air libre est interdit. Privilégiez le compostage, le paillage ou l'apport en déchèterie. Le broyage des branches produit un excellent paillis.",
            icon: "Leaf",
          },
          {
            title: "Compostage",
            text: "Le tri à la source des biodéchets est obligatoire. Composteur individuel au jardin ou site de compostage partagé : renseignez-vous auprès de l'intercommunalité, qui propose souvent des composteurs à tarif réduit.",
            icon: "Sprout",
          },
          {
            title: "Textiles, chaussures, linge",
            text: "Déposez-les propres et secs, en sac fermé, dans les conteneurs prévus. Même usés, ils sont valorisés en chiffons ou en isolant.",
            icon: "Shirt",
          },
          {
            title: "Médicaments et piles",
            text: "Les médicaments non utilisés se rapportent en pharmacie. Les piles et petites batteries se déposent dans les bacs des commerces ou en déchèterie.",
            icon: "Pill",
          },
          {
            title: "Amiante et déchets dangereux",
            text: "Ces déchets ne se mélangent jamais aux autres. Renseignez-vous sur les filières spécialisées : une mauvaise manipulation présente un risque sanitaire réel.",
            icon: "TriangleAlert",
          },
        ],
      }),
      b("alertBox", {
        level: "VIGILANCE",
        title: "Dépôts sauvages : c'est une infraction",
        html: "<p>Abandonner des déchets dans la nature ou sur la voie publique est passible d'une amende, et le contrevenant peut être identifié. Ces dépôts coûtent cher à la collectivité et dégradent le cadre de vie de tous.</p><p>Si vous constatez un dépôt, ne le manipulez pas : <a href=\"/services/signalement\">signalez-le</a>. Les services techniques intervi" + "ennent sous 48 heures ouvrées.</p>",
      }),
      b("serviceTeaser", {
        service: "signalement",
        title: "Signaler un dépôt sauvage ou un point de collecte débordant",
        text: "Une photo, un point sur le plan, et les services techniques sont prévenus immédiatement.",
        ctaLabel: "Signaler",
        image: { url: visuel("abstrait", "dechets-signalement"), alt: "Signalement de dépôt" },
      }),
    ],
  },
  {
    slug: "cadre-de-vie/environnement",
    title: "Environnement et biodiversité",
    navLabel: "Environnement",
    parent: "cadre-de-vie",
    order: 4,
    icon: "Leaf",
    excerpt: "Zéro phyto, gestion différenciée, Geopark, sobriété énergétique.",
    blocks: [
      b("richText", {
        title: "Des choix assumés pour le vivant",
        html: "<p>Préserver le cadre de vie de Chessy, ce n'est pas seulement tondre et fleurir. C'est aussi accepter qu'une prairie fleurie soit plus utile qu'un gazon ras, qu'une herbe au pied d'un mur ne soit pas un défaut d'entretien, et qu'un éclairage éteint la nuit profite à la biodiversité comme au budget communal.</p>",
        width: "lecture",
      }),
      b("cardGrid", {
        title: "Les engagements de la commune",
        columns: "2",
        variant: "icone",
        cards: [
          {
            title: "Zéro phyto",
            text: "Plus aucun produit phytosanitaire n'est utilisé sur les espaces publics. Les agents désherbent mécaniquement, paillent les massifs et plantent des couvre-sol.",
            icon: "Ban",
          },
          {
            title: "Gestion différenciée",
            text: "Chaque espace est entretenu selon son usage : tonte régulière pour les aires de jeux, fauche tardive pour les talus et les zones peu fréquentées.",
            icon: "Scissors",
          },
          {
            title: "Plantations économes en eau",
            text: "Les massifs privilégient des vivaces adaptées à la sécheresse estivale, moins gourmandes en arrosage et en entretien.",
            icon: "Flower2",
          },
          {
            title: "Éclairage public sobre",
            text: "Remplacement progressif par des luminaires à LED et abaissement de l'intensité en cœur de nuit : moins de consommation, moins de pollution lumineuse.",
            icon: "Lightbulb",
          },
          {
            title: "Rénovation énergétique",
            text: "Les bâtiments communaux font l'objet d'un programme d'isolation et de remplacement des menuiseries, en commençant par l'école.",
            icon: "House",
          },
          {
            title: "Geopark Beaujolais",
            text: "Chessy est un site remarquable du Geopark mondial UNESCO du Beaujolais : une reconnaissance du patrimoine géologique, et un levier de géotourisme.",
            icon: "Mountain",
          },
        ],
      }),
      b("accordion", {
        title: "Ce que chacun peut faire",
        subtitle: "Des gestes simples, à l'échelle d'un jardin ou d'une maison.",
        items: [
          {
            question: "Entretenir le trottoir devant chez soi",
            answer:
              "<p>Chaque riverain est tenu de balayer et de désherber le trottoir au droit de sa propriété, et de le déneiger en hiver. Un village propre, c'est d'abord l'affaire de tous.</p>",
          },
          {
            question: "Tailler ses haies en limite de propriété",
            answer:
              "<p>Les haies et arbres ne doivent pas empiéter sur la voie publique ni masquer la signalisation et l'éclairage. Évitez de tailler entre mars et août : c'est la période de nidification des oiseaux.</p>",
          },
          {
            question: "Respecter les horaires de bruit",
            answer:
              "<p>Tondeuses, taille-haies et travaux bruyants sont réglementés : en semaine de 8h30 à 12h et de 14h30 à 19h30, le samedi de 9h à 12h et de 15h à 19h, et le dimanche matin uniquement de 10h à 12h. Votre voisin vous en sera reconnaissant.</p>",
          },
          {
            question: "Accueillir la biodiversité chez soi",
            answer:
              "<p>Laissez un coin de jardin en friche, plantez des espèces locales et mellifères, installez un nichoir ou un hôtel à insectes, évitez les clôtures totalement étanches pour laisser circuler la petite faune.</p>",
          },
          {
            question: "Ne pas brûler ses déchets verts",
            answer:
              "<p>Le brûlage à l'air libre est interdit : il émet des particules fines très nocives. Compostez, paillez ou apportez en déchèterie.</p>",
          },
        ],
      }),
      b("cta", {
        title: "Vous avez une idée pour la commune ?",
        text: "Jardin partagé, plantation d'arbres, chantier participatif : les propositions des habitants sont étudiées par la commission cadre de vie.",
        tone: "sable",
        actions: [
          { label: "Proposer une idée", href: "/contact?type=SUGGESTION", icon: "Lightbulb" },
        ],
      }),
    ],
  },
  {
    slug: "cadre-de-vie/equipements",
    title: "Les équipements communaux",
    navLabel: "Équipements",
    parent: "cadre-de-vie",
    order: 5,
    icon: "MapPin",
    excerpt: "Mairie, écoles, salles, terrains de sport, aire de jeux : la carte complète.",
    blocks: [
      b("richText", {
        title: "Tous les lieux publics de la commune",
        html: "<p>Adresse, horaires, accessibilité, contact : retrouvez ici l'ensemble des équipements municipaux et des lieux publics de Chessy-les-Mines.</p>",
        width: "lecture",
      }),
      b("equipementsMap", {
        title: "",
        subtitle: "Filtrez par catégorie pour trouver rapidement un équipement.",
        category: "",
      }),
      b("serviceTeaser", {
        service: "salle",
        title: "Réserver une salle communale",
        text: "La salle des fêtes et la salle des associations se réservent en ligne : consultez les disponibilités et déposez votre demande.",
        ctaLabel: "Voir les disponibilités",
        image: { url: visuel("salle", "equipements-salle"), alt: "Salle communale" },
      }),
    ],
  },
];

/* ========================================================================= */
/* Pages transverses et légales                                              */
/* ========================================================================= */

const AUTRES: SeedPage[] = [
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    showInNav: false,
    order: 90,
    excerpt: "Éditeur, hébergeur, propriété intellectuelle et crédits du site.",
    blocks: [
      b("richText", {
        title: "",
        html: "<h2>Éditeur du site</h2><p>Commune de Chessy-les-Mines<br>Place de la Mairie — 69380 Chessy-les-Mines<br>Téléphone : 04 78 43 92 03<br>Courriel : <a href=\"mailto:accueil@chessy69.fr\">accueil@chessy69.fr</a></p><p><strong>Directeur de la publication :</strong> le maire de Chessy-les-Mines.</p><h2>Hébergement</h2><p>Les coordonnées complètes de l'hébergeur du site sont à compléter par la commune lors de la mise en production.</p><h2>Propriété intellectuelle</h2><p>L'ensemble des contenus de ce site (textes, images, documents, éléments graphiques et logiciels) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, à des fins autres que strictement privées, est soumise à l'autorisation préalable de la commune.</p><p>Les illustrations livrées avec ce site sont des visuels générés, destinés à être remplacés par les photographies de la commune. Les crédits photographiques définitifs seront précisés ici.</p><h2>Liens hypertextes</h2><p>Les liens vers des sites extérieurs sont proposés à titre informatif. La commune n'exerce aucun contrôle sur leur contenu et ne saurait être tenue responsable des informations qui y figurent.</p><h2>Responsabilité</h2><p>La commune s'efforce d'assurer l'exactitude et la mise à jour des informations publiées. Elle ne peut toutefois garantir l'absence d'erreur ni l'exhaustivité des contenus. Les informations à caractère réglementaire ne se substituent pas aux textes officiels.</p><h2>Signaler une erreur</h2><p>Vous constatez une information erronée ou obsolète ? Écrivez-nous : la correction sera apportée dans les meilleurs délais.</p>",
        width: "lecture",
      }),
      b("cta", {
        title: "Signaler une erreur sur le site",
        text: "Un lien cassé, une information dépassée, une coquille : merci de nous le faire savoir.",
        tone: "clair",
        actions: [{ label: "Nous écrire", href: "/contact?objet=Signalement%20sur%20le%20site", icon: "Mail" }],
      }),
    ],
  },
  {
    slug: "accessibilite",
    title: "Accessibilité du site",
    showInNav: false,
    order: 91,
    excerpt: "Déclaration d'accessibilité, niveau de conformité au RGAA et voies de recours.",
    blocks: [
      b("richText", {
        title: "",
        html: "<h2>Notre engagement</h2><p>La commune de Chessy-les-Mines s'engage à rendre son site internet accessible au plus grand nombre, conformément à l'article 47 de la loi du 11 février 2005 et au <strong>référentiel général d'amélioration de l'accessibilité (RGAA)</strong>.</p><h2>Ce qui a été mis en œuvre</h2><ul><li>navigation complète au clavier, avec liens d'évitement en début de page ;</li><li>structure sémantique des pages (titres hiérarchisés, régions, listes) ;</li><li>contrastes de couleurs conformes, en thème clair comme en thème sombre ;</li><li>textes alternatifs sur les images porteuses d'information ;</li><li>formulaires avec étiquettes explicites, aides à la saisie et messages d'erreur compréhensibles ;</li><li>respect de la préférence système de réduction des animations ;</li><li>possibilité d'augmenter la taille des textes et d'activer un contraste renforcé depuis le menu d'accessibilité ;</li><li>site entièrement utilisable sur téléphone, tablette et ordinateur.</li></ul><h2>État de conformité</h2><p>Une <strong>déclaration de conformité</strong> doit être établie à l'issue d'un audit RGAA réalisé par un prestataire qualifié, avant la mise en production. Elle précisera le taux de conformité, les non-conformités identifiées, les dérogations éventuelles et le plan d'action associé.</p><h2>Améliorer l'accessibilité : dites-nous ce qui bloque</h2><p>Si vous rencontrez une difficulté pour accéder à un contenu ou à un service de ce site, signalez-le nous. Nous nous engageons à vous transmettre l'information recherchée par un autre moyen (téléphone, courriel, accueil physique) et à corriger le problème.</p><h2>Voies de recours</h2><p>Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu et que vous n'obtenez pas de réponse satisfaisante, vous pouvez :</p><ul><li>écrire au <a href=\"https://www.defenseurdesdroits.fr\" rel=\"noopener\">Défenseur des droits</a> ;</li><li>contacter le délégué du Défenseur des droits de votre département ;</li><li>envoyer un courrier postal (sans affranchissement) au Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07.</li></ul>",
        width: "lecture",
      }),
      b("cta", {
        title: "Signaler un problème d'accessibilité",
        text: "Décrivez la difficulté rencontrée et la page concernée : nous vous répondrons et corrigerons.",
        tone: "clair",
        actions: [{ label: "Nous écrire", href: "/contact?objet=Accessibilit%C3%A9%20du%20site", icon: "Mail" }],
      }),
    ],
  },
  {
    slug: "donnees-personnelles",
    title: "Données personnelles",
    showInNav: false,
    order: 92,
    excerpt: "Traitement des données, finalités, durées de conservation et exercice de vos droits.",
    blocks: [
      b("richText", {
        title: "",
        html: "<h2>Qui traite vos données ?</h2><p>Le responsable de traitement est la <strong>commune de Chessy-les-Mines</strong>, représentée par son maire, Place de la Mairie, 69380 Chessy-les-Mines.</p><h2>Quelles données, pour quoi faire ?</h2><table><thead><tr><th>Service</th><th>Données collectées</th><th>Finalité</th><th>Base légale</th><th>Conservation</th></tr></thead><tbody><tr><td>Formulaire de contact</td><td>Nom, courriel, téléphone, message</td><td>Répondre à votre demande</td><td>Mission d'intérêt public</td><td>2 ans</td></tr><tr><td>Signalement</td><td>Nom, courriel, localisation, photographie</td><td>Traiter l'incident signalé</td><td>Mission d'intérêt public</td><td>2 ans après résolution</td></tr><tr><td>Réservation de salle</td><td>Identité, coordonnées, situation, objet de la manifestation</td><td>Instruire la demande, facturer, établir la convention</td><td>Mission d'intérêt public / contrat</td><td>5 ans (pièces comptables : 10 ans)</td></tr><tr><td>Prêt de matériel</td><td>Identité, coordonnées, matériel emprunté</td><td>Gérer le prêt et la restitution</td><td>Mission d'intérêt public</td><td>3 ans</td></tr><tr><td>Lettre d'information</td><td>Courriel, prénom</td><td>Envoyer la lettre d'information communale</td><td>Consentement</td><td>Jusqu'au désabonnement</td></tr><tr><td>Comptes du back-office</td><td>Identité professionnelle, courriel, journal des actions</td><td>Administrer le site et assurer la traçabilité</td><td>Mission d'intérêt public</td><td>Durée des fonctions + 1 an</td></tr></tbody></table><h2>Qui a accès à vos données ?</h2><p>Seuls les agents et élus habilités, dans la limite de leurs attributions. Aucune donnée n'est vendue ni cédée à des fins commerciales. Les prestataires techniques éventuels (hébergement, envoi de courriels) agissent comme sous-traitants, sur instruction de la commune.</p><h2>Vos droits</h2><p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition, ainsi que du droit de retirer votre consentement pour la lettre d'information. Pour les exercer, écrivez à <a href=\"mailto:accueil@chessy69.fr\">accueil@chessy69.fr</a> ou par courrier à la mairie, en justifiant de votre identité.</p><p>Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez saisir la <a href=\"https://www.cnil.fr\" rel=\"noopener\">CNIL</a>.</p><h2>Cookies et mesure d'audience</h2><p>Ce site ne dépose <strong>aucun cookie publicitaire</strong> et n'utilise aucun traceur tiers. Seul un cookie technique est utilisé pour la session des agents du back-office. Vos préférences d'affichage (thème, confort de lecture) sont enregistrées localement dans votre navigateur et ne sont jamais transmises.</p><h2>Délégué à la protection des données</h2><p>Les coordonnées du délégué à la protection des données mutualisé sont à compléter par la commune lors de la mise en production.</p>",
        width: "lecture",
      }),
    ],
  },
];

export const SEED_PAGES: SeedPage[] = [
  ACCUEIL,
  ...MAIRIE,
  ...DEMARCHES_PAGES,
  ...VIVRE,
  ...CADRE,
  ...AUTRES,
];

/* ========================================================================= */
/* Menus                                                                     */
/* ========================================================================= */

export type SeedMenuItem = {
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  highlight?: boolean;
  children?: SeedMenuItem[];
};

export const SEED_MENUS: Array<{ key: string; label: string; items: SeedMenuItem[] }> = [
  {
    key: "principal",
    label: "Menu principal",
    items: [
      {
        label: "La mairie",
        href: "/la-mairie",
        icon: "Landmark",
        description: "Élus, budget, services, décisions",
        children: [
          { label: "Le conseil municipal", href: "/la-mairie/conseil-municipal", icon: "Users", description: "Maire, adjoints, commissions" },
          { label: "Comptes rendus et délibérations", href: "/la-mairie/comptes-rendus", icon: "FileStack", description: "Les décisions du conseil" },
          { label: "Budget et finances", href: "/la-mairie/budget", icon: "PiggyBank", description: "Budget primitif, compte administratif" },
          { label: "Les services municipaux", href: "/la-mairie/services-municipaux", icon: "Building2", description: "Qui contacter, à quels horaires" },
          { label: "CCAS et solidarités", href: "/la-mairie/ccas", icon: "HeartHandshake", description: "Action sociale de proximité" },
          { label: "Intercommunalité", href: "/la-mairie/intercommunalite", icon: "Network", description: "Beaujolais Pierres Dorées" },
          { label: "Bulletin municipal", href: "/la-mairie/bulletin-municipal", icon: "Newspaper", description: "Tous les numéros de Chessy Info" },
          { label: "Marchés publics", href: "/la-mairie/marches-publics", icon: "Gavel", description: "Consultations en cours" },
          { label: "Informations urgentes", href: "/la-mairie/informations-urgentes", icon: "BellRing", description: "PanneauPocket, alertes, numéros utiles" },
        ],
      },
      {
        label: "Démarches",
        href: "/demarches",
        icon: "ClipboardList",
        description: "Fiches pratiques et services en ligne",
        children: [
          { label: "Toutes les démarches", href: "/demarches", icon: "LayoutList", description: "Classées par thème" },
          { label: "État civil et identité", href: "/demarches?theme=ETAT_CIVIL", icon: "IdCard", description: "Actes, carte d'identité, passeport" },
          { label: "Urbanisme et travaux", href: "/demarches?theme=URBANISME", icon: "Hammer", description: "Déclaration préalable, permis" },
          { label: "Élections et citoyenneté", href: "/demarches?theme=ELECTIONS", icon: "Vote", description: "Listes électorales, recensement" },
          { label: "Enfance et scolarité", href: "/demarches?theme=SCOLAIRE", icon: "GraduationCap", description: "Inscription, cantine, périscolaire" },
          { label: "Eau et assainissement", href: "/demarches?theme=EAU", icon: "Droplets", description: "Abonnement, relevés, fuites" },
          { label: "Réserver une salle", href: "/services/salle-des-fetes", icon: "PartyPopper", description: "Disponibilités en temps réel", highlight: true },
          { label: "Emprunter du matériel", href: "/services/pret-de-materiel", icon: "Package", description: "Tables, chaises, barnums", highlight: true },
          { label: "Signaler un problème", href: "/services/signalement", icon: "TriangleAlert", description: "Voirie, éclairage, propreté", highlight: true },
        ],
      },
      {
        label: "Vivre à Chessy",
        href: "/vivre-a-chessy",
        icon: "Users",
        description: "Enfance, écoles, aînés, santé, commerces",
        children: [
          { label: "Petite enfance", href: "/vivre-a-chessy/petite-enfance", icon: "Baby", description: "Multi-accueil, assistantes maternelles" },
          { label: "Écoles et restaurant scolaire", href: "/vivre-a-chessy/ecoles", icon: "GraduationCap", description: "Inscription, cantine, périscolaire" },
          { label: "Enfance et jeunesse", href: "/vivre-a-chessy/enfance-jeunesse", icon: "Blocks", description: "Loisirs, conseil municipal des enfants" },
          { label: "Les aînés", href: "/vivre-a-chessy/aines", icon: "Heart", description: "Animations, entraide, autonomie" },
          { label: "Santé", href: "/vivre-a-chessy/sante", icon: "Stethoscope", description: "Professionnels, gardes, numéros" },
          { label: "Commerces et artisans", href: "/vivre-a-chessy/commerces", icon: "Store", description: "Les professionnels du village" },
          { label: "Transports et mobilités", href: "/vivre-a-chessy/transports", icon: "Bus", description: "Cars, train, covoiturage" },
          { label: "Les associations", href: "/associations", icon: "HeartHandshake", description: "L'annuaire complet" },
          { label: "Nouveaux habitants", href: "/vivre-a-chessy/nouveaux-habitants", icon: "DoorOpen", description: "Bien démarrer dans le village" },
        ],
      },
      {
        label: "Cadre de vie",
        href: "/cadre-de-vie",
        icon: "Trees",
        description: "Patrimoine, urbanisme, eau, déchets",
        children: [
          { label: "Patrimoine et mines", href: "/cadre-de-vie/patrimoine", icon: "Pickaxe", description: "L'azurite, l'église, le château" },
          { label: "Urbanisme et PLU", href: "/cadre-de-vie/urbanisme", icon: "Ruler", description: "Construire, rénover, clôturer" },
          { label: "Eau et assainissement", href: "/cadre-de-vie/eau-assainissement", icon: "Droplets", description: "Contrat, qualité, fuites" },
          { label: "Déchets et propreté", href: "/cadre-de-vie/dechets", icon: "Recycle", description: "Collecte, tri, déchèterie" },
          { label: "Environnement", href: "/cadre-de-vie/environnement", icon: "Leaf", description: "Zéro phyto, biodiversité, sobriété" },
          { label: "Les équipements", href: "/cadre-de-vie/equipements", icon: "MapPin", description: "La carte des lieux publics" },
        ],
      },
      {
        label: "Actualités",
        href: "/actualites",
        icon: "Newspaper",
        description: "L'information de la commune",
        children: [
          { label: "Toutes les actualités", href: "/actualites", icon: "Newspaper", description: "Décisions, travaux, vie locale" },
          { label: "Agenda", href: "/agenda", icon: "CalendarDays", description: "Manifestations et rendez-vous" },
          { label: "Bulletin municipal", href: "/la-mairie/bulletin-municipal", icon: "BookOpen", description: "Chessy Info en téléchargement" },
          { label: "Alertes et informations urgentes", href: "/la-mairie/informations-urgentes", icon: "BellRing", description: "PanneauPocket et numéros utiles" },
        ],
      },
    ],
  },
  {
    key: "services",
    label: "Services en ligne (menu mis en avant)",
    items: [
      {
        label: "Réserver la salle des fêtes",
        href: "/services/salle-des-fetes",
        icon: "PartyPopper",
        description: "Disponibilités en direct, tarif automatique",
      },
      {
        label: "Emprunter du matériel",
        href: "/services/pret-de-materiel",
        icon: "Package",
        description: "Tables, chaises, barnums, sonorisation",
      },
      {
        label: "Signaler un problème",
        href: "/services/signalement",
        icon: "TriangleAlert",
        description: "Photo et localisation, suivi garanti",
      },
      {
        label: "Suivre ma demande",
        href: "/suivi",
        icon: "Search",
        description: "Avec votre référence de suivi",
      },
      {
        label: "Écrire à la mairie",
        href: "/contact",
        icon: "Mail",
        description: "Réponse sous 5 jours ouvrés",
      },
    ],
  },
  {
    key: "pied-decouvrir",
    label: "Pied de page — Découvrir",
    items: [
      { label: "Patrimoine et mines", href: "/cadre-de-vie/patrimoine" },
      { label: "L'azurite de Chessy", href: "/cadre-de-vie/patrimoine" },
      { label: "Les équipements", href: "/cadre-de-vie/equipements" },
      { label: "Les associations", href: "/associations" },
      { label: "Actualités", href: "/actualites" },
      { label: "Agenda", href: "/agenda" },
    ],
  },
  {
    key: "pied-demarches",
    label: "Pied de page — Démarches",
    items: [
      { label: "Toutes les démarches", href: "/demarches" },
      { label: "Réserver une salle", href: "/services/salle-des-fetes" },
      { label: "Emprunter du matériel", href: "/services/pret-de-materiel" },
      { label: "Signaler un problème", href: "/services/signalement" },
      { label: "Suivre ma demande", href: "/suivi" },
      { label: "Contacter la mairie", href: "/contact" },
    ],
  },
  {
    key: "pied-mairie",
    label: "Pied de page — La mairie",
    items: [
      { label: "Le conseil municipal", href: "/la-mairie/conseil-municipal" },
      { label: "Comptes rendus", href: "/la-mairie/comptes-rendus" },
      { label: "Budget et finances", href: "/la-mairie/budget" },
      { label: "Bulletin municipal", href: "/la-mairie/bulletin-municipal" },
      { label: "Marchés publics", href: "/la-mairie/marches-publics" },
      { label: "Intercommunalité", href: "/la-mairie/intercommunalite" },
    ],
  },
];
