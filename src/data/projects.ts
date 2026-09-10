import type { Project } from './types'

/** Sourced from the six project briefs under
 *  `site web EU4Youth.org/Projets/`, the programme brief and glossaire.
 *  `dataGaps` records conflicts found across sources — these need a client
 *  decision before the content is treated as final. */

export const PROJECTS: Project[] = [
  {
    slug: 'jeuness',
    acronym: "Jeun'ESS",
    fullName:
      "Projet de promotion de l'économie sociale et solidaire et de création d'emplois décents pour la jeunesse tunisienne",
    tagline: "Économie sociale et solidaire",
    quote:
      "L'économie sociale et solidaire, un levier pour l'emploi décent des jeunes tunisiens.",
    ficheSummary:
      "Jeun'ESS soutient la création et le développement d'entreprises d'économie sociale et solidaire portées par des jeunes dans sept gouvernorats prioritaires de l'intérieur. Le projet mobilise trois mécanismes complémentaires : un fonds de résilience pour les organisations existantes, un fonds d'innovation sociale pour les nouvelles initiatives, et un fonds marché pour l'accès à de nouveaux débouchés nationaux et internationaux. Des clubs ESS sont également créés au sein des structures locales de jeunesse, pour développer la culture entrepreneuriale collective.",
    composante: 'Emploi, employabilité et entrepreneuriat',
    theme: 'jeuness',
    /* Budget not in Word Section 6 fiche table; glossaire / homepage state 9 M€. */
    budget: "9 millions d'euros",
    partner: 'Organisation internationale du Travail (OIT)',
    territory:
      '7 gouvernorats : Jendouba, Le Kef, Kasserine, Sidi Bouzid, Kairouan, Gabès, Médenine',
    period: '2021 – 2027',
    sectors:
      "Économie sociale et solidaire, entrepreneuriat social, emploi des jeunes, développement territorial",
    beneficiaries: [
      'Jeunes entrepreneurs',
      'Structures ESS',
      'Acteurs territoriaux',
    ],
    presentation: [
      "Face aux défis persistants de l'inclusion économique des jeunes en Tunisie, notamment l'accès à l'emploi décent, les disparités territoriales et la nécessité de promouvoir des modèles économiques plus inclusifs et durables, l'économie sociale et solidaire (ESS) représente une opportunité majeure pour favoriser une croissance plus équitable et ancrée dans les territoires.",
      "Le projet Jeun'ESS accompagne le développement d'un écosystème ESS structuré, inclusif et durable en plaçant les jeunes au cœur des dynamiques économiques et sociales.",
    ],
    impactIntro:
      "À travers ses différentes composantes, Jeun'ESS a contribué à structurer un écosystème ESS plus inclusif et plus performant en Tunisie.",
    /* Word programme brief — seven priority governorates. */
    governorates: [
      'Jendouba',
      'Le Kef',
      'Kasserine',
      'Sidi Bouzid',
      'Kairouan',
      'Gabès',
      'Médenine',
    ],
    generalObjective:
      "Contribuer à la création d'emplois décents et durables pour les jeunes tunisiennes et tunisiens à travers le développement d'un écosystème inclusif et performant de l'économie sociale et solidaire.",
    specificObjectives: [
      "Faciliter l'accès au financement des initiatives ESS",
      "Soutenir la création et la consolidation d'activités économiques à impact social",
      "Renforcer l'accès au marché des organisations ESS",
      'Renforcer le rôle des acteurs territoriaux',
      "Favoriser l'engagement des jeunes dans l'ESS",
    ],
    kpis: [
      { value: '304', label: 'projets ESS soutenus' },
      { value: '186', label: 'structures accompagnées' },
      { value: '3 721', label: 'emplois soutenus' },
      { value: '765', label: 'jeunes incubés' },
      { value: '373', label: "personnes formées à l'accompagnement ESS" },
      { value: '49', label: "clubs LIMITL'ESS créés" },
      {
        value: '87',
        label: 'structures valorisées dans des salons et événements nationaux',
      },
      { value: '140', label: 'produits ESS référencés' },
    ],
    components: [
      {
        name: 'Community Fund',
        mark: '/img/composante-community.webp',
        tagline: 'Soutenir les dynamiques collectives locales',
        description:
          "Renforcement des acteurs publics et territoriaux afin d'intégrer l'économie sociale et solidaire dans les politiques locales de développement.",
        results: [
          '17 structures publiques formées',
          '14 collectivités territoriales impliquées',
          '72 initiatives territoriales soutenues',
          '350 jeunes impliqués dans des activités communautaires',
          '43 % des initiatives portées par des femmes',
        ],
        sectors: ['Développement territorial', 'Société civile'],
      },
      {
        name: "LIMITL'ESS Clubs – Enactus",
        mark: '/img/composante-limitless-club.webp',
        tagline: "Développer l'entrepreneuriat social auprès des étudiants",
        description:
          "Développé avec Enactus Tunisie, ce dispositif sensibilise les étudiants à l'économie sociale et solidaire grâce à des formations, bootcamps, ateliers pratiques et compétitions.",
        results: [
          "29 clubs Enactus LIMITL'ESS créés",
          '528 jeunes adhérents',
          '81 animateurs formés',
          '18 idées de projets développées',
          '3 bootcamps et 10 ateliers en ligne organisés',
        ],
        sectors: [
          'Agriculture et agroalimentaire',
          'Technologies et innovation',
          'Économie circulaire',
          'Énergie verte',
          'Tourisme durable',
        ],
      },
      {
        name: "Social Innovation Fund",
        mark: '/img/composante-social-innovation.webp',
        tagline: "Financer l'innovation sociale territoriale",
        description:
          "Parcours complet d'incubation combinant formation, mentorat, accompagnement individuel et financement pour transformer des idées à impact social en activités économiques durables.",
        results: [
          '369 projets sélectionnés',
          '765 jeunes incubés',
          '143 projets créés juridiquement',
          '1 465 emplois directs créés',
          '29 projets financés par la BTS dans 7 gouvernorats',
        ],
        sectors: ['Économie sociale et solidaire', 'Innovation sociale locale'],
      },
      {
        name: 'Re-Fund Challenge',
        mark: '/img/composante-refund.webp',
        tagline: 'Renforcer les organisations ESS fragilisées',
        description:
          "Mécanisme de financement et d'accompagnement conçu pour renforcer des organisations ESS existantes fragilisées, notamment par la crise Covid-19. Il combine subvention, renforcement de capacités et incubation.",
        results: [
          '42 structures ESS consolidées',
          '926 emplois créés ou consolidés',
          '13 coopératives accompagnées',
          'Plus de 350 bénéficiaires accompagnés',
        ],
        sectors: ['Économie sociale et solidaire'],
      },
      {
        name: 'Market Fund',
        mark: '/img/composante-market.webp',
        tagline: 'Ouvrir de nouveaux marchés aux structures ESS',
        description:
          "Mécanisme visant à renforcer les capacités commerciales et de mise en marché des organisations ESS, pour leur permettre d'accéder à de nouveaux marchés nationaux et internationaux.",
        results: [
          '40 structures accompagnées individuellement',
          '5 structures de commercialisation renforcées',
          '87 structures valorisées lors d’événements nationaux',
          'Plus de 140 produits référencés',
        ],
        sectors: ['Commercialisation', 'Développement territorial'],
      },
      {
        name: "LIMITL'ESS Génération",
        tagline:
          "Encourager l'innovation sociale dans les espaces jeunesse et culturels",
        description:
          "Les clubs LIMITL'ESS Génération, implantés dans les Maisons de jeunes et les Maisons de culture, permettent aux jeunes de découvrir l'économie sociale et solidaire à travers une approche pratique et participative. Le dispositif combine sensibilisation, ateliers pratiques, accompagnement et développement de projets collectifs répondant aux besoins des territoires.",
        results: [
          '14 clubs créés dans 7 régions',
          '172 jeunes engagés',
          '50 animateurs formés',
          "16 projets retenus dans le cadre du Challenge LIMITL'ESS",
        ],
        sectors: [
          'Éducation et orientation',
          'Médias et communication',
          'Environnement et écologie',
          'Arts visuels et design',
          'Artisanat local',
          'Agriculture et apiculture',
          'Innovation sociale locale',
        ],
      },
    ],
    dataGaps: [
      'Budget retiré des pages publiques (demande client).',
      'Période alignée sur PROGRAMME EU4YOUTH TUNISIE (2).docx : 2021 – 2027.',
      "La présentation dédiée parle de « cinq composantes » tout en listant six mécanismes ; la page conserve les six mécanismes documentés.",
      "Indicateur global de 49 clubs LIMITL’ESS vs détail 29 Enactus + 14 Génération = 43 ; six clubs restent à expliquer.",
      'Le classeur de cartographie recense aussi des interventions hors des sept gouvernorats affichés dans la fiche projet.',
    ],
  },
  {
    slug: 'go4youth',
    acronym: 'GO4Youth',
    fullName: 'Gates for Opportunities for Youth',
    tagline: 'Gates for Opportunities',
    quote:
      "Des portes d'accès à l'emploi, modernisées et ouvertes à tous les jeunes, partout en Tunisie.",
    ficheSummary:
      "Go4Youth transforme le modèle de service de l'ANETI (Agence Nationale pour l'Emploi et le Travail Indépendant), qui gère un réseau de 125 bureaux sur l'ensemble du territoire tunisien. Le projet déploie de nouveaux outils de profilage et de mise en relation, digitalise les services, et renforce l'écosystème privé d'intermédiation. L'objectif : que chaque jeune demandeur d'emploi, quel que soit son gouvernorat, puisse accéder à des services modernes, efficaces et adaptés à son profil.",
    composante: 'Emploi, employabilité et entrepreneuriat',
    theme: 'go4youth',
    budget: "10 millions d'euros",
    partner: 'Banque mondiale / ANETI',
    territory: 'National — 125 bureaux ANETI',
    period: 'Septembre 2021 – Juin 2027',
    fundingNote:
      'Projet financé par le Programme EU4Youth à travers le Fonds TERI de la Banque Mondiale',
    sectors:
      "Emploi, employabilité, transformation numérique, services publics d'intermédiation",
    beneficiaries: [
      'Jeunes et populations vulnérables',
      "Chercheurs d'emploi",
      'Entreprises',
      'Personnes en transition professionnelle',
      "Acteurs privés de l'employabilité",
    ],
    presentation: [
      "Face aux défis persistants du marché du travail tunisien, notamment le chômage des jeunes, l’inadéquation entre les compétences disponibles et les besoins des entreprises, ainsi que les difficultés d’accès à un emploi décent, le projet GO4Youth accompagne la transformation du système d’intermédiation de l’emploi en Tunisie.",
      "Financé par l’Union européenne dans le cadre du programme EU4Youth, et mis en œuvre avec l’appui de la Banque mondiale, GO4Youth vise à renforcer l’efficacité des services publics et privés d’accompagnement vers l’emploi. GO4Youth ne crée pas directement des emplois.",
    ],
    governorates: ['Présence nationale'],
    generalObjective:
      "Contribuer à améliorer l’accès des jeunes et des populations vulnérables à des emplois de qualité en renforçant l’efficacité, l’accessibilité et la pertinence des services d’intermédiation sur le marché du travail tunisien.",
    specificObjectives: [
      "Améliorer les services de l’ANETI destinés aux chercheurs d’emploi.",
      "Renforcer les services de l’ANETI destinés aux entreprises.",
      "Accélérer la transformation digitale de l’ANETI.",
      "Renforcer l’écosystème de l’employabilité.",
    ],
    kpis: [
      { value: '6', label: 'BETI pilotes pour le nouveau profilage' },
      { value: '48', label: 'BETI sélectionnés pour la généralisation' },
      { value: '19', label: 'spécifications de services numériques' },
      { value: '3', label: 'services nouveaux ou améliorés (sur une cible de 8)' },
    ],
    components: [
      {
        name: 'Services aux chercheurs d’emploi',
        tagline: 'Améliorer l’accompagnement public',
        description:
          "Modernisation des services ANETI destinés aux chercheurs d’emploi, notamment le profilage et l’accompagnement individualisé.",
        results: [
          'Système de profilage opérationnel',
          'Outils testés dans 6 BETI pilotes',
          'Généralisation préparée sur 48 BETI sélectionnés',
        ],
        sectors: ['Emploi', 'Services publics'],
      },
      {
        name: 'Services aux entreprises',
        tagline: 'Renforcer l’offre aux employeurs',
        description:
          "Renforcement des services ANETI destinés aux entreprises pour améliorer le rapprochement entre l’offre et la demande d’emploi.",
        results: [
          'Services employeurs renforcés au sein du réseau ANETI',
          'Meilleur appariement offre / demande d’emploi',
          'Accompagnement des entreprises dans le recrutement',
        ],
        sectors: ['Emploi', 'Entreprises'],
      },
      {
        name: 'Transformation digitale ANETI',
        tagline: 'Accélérer la modernisation numérique',
        description:
          "Accélération de la transformation digitale de l’ANETI à travers des services numériques, des procédures digitalisées et des spécifications de services.",
        results: [
          '19 spécifications de services numériques développées et en cours de déploiement',
          'Extension vers 48 BETI sélectionnés',
          '3 services nouveaux ou améliorés sur une cible de 8',
        ],
        sectors: ['Numérique', 'Services publics'],
      },
      {
        name: "Écosystème d'employabilité",
        tagline: "Structurer l'accompagnement",
        description:
          "Renforcement de l’écosystème de l’employabilité autour de l’ANETI et des acteurs d’accompagnement.",
        results: [
          'Coordination renforcée entre ANETI et acteurs d’accompagnement',
          'Parcours d’employabilité mieux articulés sur les territoires',
          'Partenariats locaux autour des services à l’emploi',
        ],
        sectors: ['Société civile', 'Emploi'],
      },
    ],
    dataGaps: [
      'Budget absent de la fiche projet dédiée ; valeur issue du glossaire / homepage (10 M€).',
      'La mention Fonds TERI / Banque mondiale n’apparaît pas dans la présentation dédiée et reste à confirmer.',
      'Le chiffre 125 BETI et les formulations « nouvelle plateforme / nouveau SI » dépassent la présentation dédiée ; ils restent documentés ailleurs et sont traités avec prudence.',
      'La couverture nationale est une conséquence du déploiement progressif dans le réseau BETI, pas une affirmation contractuelle de couverture totale dans la présentation dédiée.',
    ],
  },
  {
    slug: 'swafy',
    acronym: 'SWAFY',
    fullName: 'Science With And For Youth',
    tagline: 'Science With and For Youth',
    quote: 'La recherche et les sciences, comme chemins vers l’emploi et vers l’avenir.',
    ficheSummary:
      'SWAFY propose un modèle original qui relie promotion des sciences auprès des jeunes, soutien à la recherche partenariale et valorisation des compétences des jeunes chercheurs. Le projet finance 235 bourses doctorales et postdoctorales en milieu socio-économique, crée et appuie des clubs scientifiques dans les lycées, universités et maisons des jeunes, et organise un Dialogue National Jeunesse et Science. Il contribue également à l’élaboration d’une feuille de route nationale de promotion des sciences à l’horizon 2035.',
    composante: 'Emploi, employabilité et entrepreneuriat',
    theme: 'swafy',
    budget: "9 millions d'euros",
    partner: 'Agence Nationale de Promotion de la Recherche (ANPR)',
    territory: 'National',
    period: 'Juin 2022 – Juin 2027',
    sectors:
      'Recherche, innovation, culture scientifique, entrepreneuriat, politiques Science-Technologie-Innovation',
    beneficiaries: [
      'Doctorants et post-doctorants',
      'Jeunes chercheurs',
      'Associations',
      'Start-ups',
      'Acteurs publics',
      'Institutions de recherche',
      'Acteurs socio-économiques',
    ],
    presentation: [
      "Le projet Science With And For Youth (SWAFY) vise à renforcer le rôle de la recherche scientifique, de l’innovation et de la créativité dans le développement économique et social en Tunisie, en plaçant les jeunes au cœur des dynamiques scientifiques et technologiques.",
      "Le projet contribue à améliorer l’employabilité des jeunes chercheurs et chercheuses, à promouvoir l’entrepreneuriat scientifique et à favoriser une meilleure connexion entre les établissements de recherche, les acteurs socio-économiques et les besoins de la société.",
    ],
    governorates: ['Présence nationale'],
    generalObjective:
      "Contribuer au renforcement de la contribution de la recherche scientifique et de l’innovation au développement économique et social en Tunisie, en favorisant l’intégration des jeunes dans les écosystèmes scientifiques, technologiques et entrepreneuriaux.",
    specificObjectives: [
      'Renforcer l’employabilité des jeunes chercheurs et chercheuses.',
      'Développer la créativité et l’esprit entrepreneurial des jeunes.',
      'Renforcer la participation des jeunes dans les politiques Science, Technologie et Innovation.',
    ],
    kpis: [
      { value: '235', label: 'Bourses MOBIDOC doctorales et post-doctorales prévues' },
      { value: '3', label: 'Composantes structurantes' },
    ],
    components: [
      {
        name: 'MOBIDOC',
        tagline: 'Bourses de recherche partenariale',
        description:
          "Financement de collaborations entre structures de recherche et environnement socio-économique pour renforcer l’employabilité des jeunes chercheurs et chercheuses.",
        results: ['235 bourses doctorales et post-doctorales prévues'],
        sectors: ['Recherche', 'Innovation'],
      },
      {
        name: 'Jeunesse Créative',
        tagline: 'Créativité et culture scientifique',
        description:
          "Actions de médiation, de vulgarisation scientifique et d’expérimentation pour développer la créativité et l’esprit entrepreneurial des jeunes.",
        results: [
          'Actions de médiation et de vulgarisation scientifique',
          'Ateliers d’expérimentation et de créativité',
          'Sensibilisation à l’esprit entrepreneurial scientifique',
        ],
        sectors: ['Culture scientifique', 'Éducation'],
      },
      {
        name: 'Débat Jeunesse et Science',
        tagline: 'Participation aux politiques STI',
        description:
          "Dialogue national jeunesse-science : analyses, recommandations, feuille de route et Congrès national Jeunesse–Science en appui à la stratégie nationale de la jeunesse 2035.",
        results: [
          'Dialogue national jeunesse–science structuré',
          'Recommandations et feuille de route pour les politiques STI',
          'Congrès national Jeunesse–Science',
        ],
        sectors: ['Politiques publiques'],
      },
    ],
    dataGaps: [
      'Budget issu du glossaire / homepage, absent de la fiche projet dédiée.',
      'Résultats actuels non chiffrés pour Jeunesse Créative et Débat Jeunesse et Science.',
      'La couverture nationale reste un objectif de diffusion inclusive, pas une cartographie de sites déjà déployés dans la présentation dédiée.',
    ],
  },
  {
    slug: 'irada4youth',
    acronym: 'IRADA4YOUTH',
    fullName:
      "Soutien au Développement Économique Durable Local pour l'Emploi des Jeunes",
    tagline: 'Filières économiques régionales',
    quote:
      "Des filières économiques régionales comme leviers d'emploi pour les jeunes des territoires.",
    ficheSummary:
      "Irada4Youth finance des projets économiques créateurs d'emploi dans des filières porteuses identifiées localement, dans six gouvernorats de l'intérieur. Le financement transite par des appels à propositions régionaux ciblés. Le CGDR et les Offices de Développement Régional assurent un rôle de pivot territorial — coordination, accompagnement des porteurs de projets, suivi de mise en oeuvre — en lien direct avec les acteurs de terrain.",
    composante: 'Emploi, employabilité et entrepreneuriat',
    theme: 'irada4youth',
    budget: "5 millions d'euros",
    partner: 'CGDR + Offices de Développement Régional',
    territory: 'Zaghouan · Mahdia · Le Kef · Kairouan · Tozeur · Kébili',
    period: '2022 – 2027',
    sectors:
      'Développement économique local, filières porteuses, agriculture, artisanat, tourisme durable',
    beneficiaries: [
      'Diplômés du supérieur',
      'Diplômés de la formation professionnelle',
      'Jeunes demandeurs d’emploi',
      'Porteurs de projets',
      "Structures d'appui",
    ],
    presentation: [
      "IRADA4YOUTH contribue à l’amélioration de l’inclusion économique et sociale des jeunes en adoptant une approche conçue localement dans six gouvernorats prioritaires.",
      "Le projet est géré directement par le CGDR, en partenariat avec l’ODNO, l’ODCO et l’ODS. Son mécanisme central est l’appel à propositions régional ciblant les filières porteuses locales.",
    ],
    governorates: [
      'Zaghouan',
      'Mahdia',
      'Le Kef',
      'Kairouan',
      'Tozeur',
      'Kébili',
    ],
    generalObjective:
      "Contribuer à l’amélioration de l’inclusion économique et sociale des jeunes en adoptant une approche conçue localement.",
    specificObjectives: [
      'Renforcer la capacité des jeunes tunisien(ne)s à porter, formuler, mettre en œuvre et pérenniser leurs projets de développement socio-économique.',
      'Améliorer la mobilisation et la synergie de l’écosystème régional d’accompagnement du secteur privé et de l’entrepreneuriat en faveur des jeunes.',
    ],
    kpis: [
      { value: '6', label: 'gouvernorats prioritaires' },
      { value: '≥ 200', label: 'projets sélectionnés et subventionnés (cible)' },
      { value: '≥ 1 000', label: 'jeunes sensibilisés (cible)' },
      { value: '600', label: 'dossiers de notes conceptuelles accompagnés (cible)' },
      { value: '300', label: 'dossiers complets accompagnés (cible)' },
      { value: '15 %', label: 'réduction des demandes d’emploi non satisfaites 20–40 ans (cible)' },
    ],
    components: [
      {
        name: 'Appels à propositions régionaux',
        tagline: 'Financer les filières porteuses',
        description:
          "Appels ciblant les chaînes de valeur locales : plantes aromatiques et médicinales, agriculture biologique, oléiculture, arboriculture, tourisme rural/écologique, sous-produits oasiens, hydroponie, transformation alimentaire, élevage et artisanat de récupération.",
        results: [
          '≥ 200 projets sélectionnés et subventionnés (cible)',
          '≥ 1 000 jeunes sensibilisés (cible)',
          '6 gouvernorats prioritaires couverts',
        ],
        sectors: [
          'Agriculture',
          'Artisanat',
          'Tourisme durable',
          'Transformation alimentaire',
        ],
      },
      {
        name: 'Sélection et suivi',
        tagline: 'Accompagner jusqu’à la pérennisation',
        description:
          "Sélection en cascade et suivi rapproché des projets retenus, avec l’objectif que 100 % restent actifs 18 mois après la subvention.",
        results: [
          '600 dossiers de notes conceptuelles accompagnés (cible)',
          '300 dossiers complets accompagnés (cible)',
          'Suivi jusqu’à 18 mois après la subvention',
        ],
        sectors: ['Développement économique local'],
      },
      {
        name: 'Renforcement de l’écosystème',
        tagline: 'Former et mobiliser les acteurs régionaux',
        description:
          "Formation et mobilisation de l’écosystème entrepreneurial régional, avec une cible d’au moins 600 participants et le soutien à la création de GIE portés par des jeunes.",
        results: [
          'Au moins 600 participants formés / mobilisés (cible)',
          'Synergies renforcées au sein de l’écosystème régional',
          'Soutien à la création de GIE portés par des jeunes',
        ],
        sectors: ['Gouvernance locale', 'Développement régional'],
      },
    ],
    dataGaps: [
      "La présentation dédiée mélange un indicateur d’impact 20–40 ans et une exigence d’au moins 75 % de sensibilisés de moins de 35 ans ; ces deux cadrages restent affichés sans fusion.",
      'Financement 100 % UE / 5 M€ confirmé dans la présentation dédiée.',
      'Le second appel (juin 2026) et les rapports narratifs annuels viennent de sources hors présentation dédiée et restent publiés dans le catalogue publications.',
      'Le classeur de mapping ne contient encore de lignes que pour Kébili, Le Kef, Zaghouan et Kairouan.',
    ],
  },
  {
    slug: 'maghroumin',
    acronym: "Maghroum'IN",
    fullName:
      "Participation et inclusion des jeunes tunisien(ne)s à travers la création, l'accès à la culture et au sport",
    tagline: 'Culture et sport',
    quote: "Maghroum'IN — l'aspiration, le désir, l'envie de faire.",
    ficheSummary:
      "Maghroum'IN est la première intervention sectorielle de l'Union européenne dans le domaine du sport en Tunisie, et s'inscrit dans la continuité des actions culturelles initiées dans le cadre du programme Tfanen. Le projet renforce les capacités des opérateurs culturels, artistiques et sportifs, améliore l'accès des jeunes en situation de vulnérabilité aux pratiques créatives et sportives, et développe l'employabilité dans ces secteurs. Il s'appuie sur un ancrage territorial fort, en lien direct avec les collectivités locales et les associations de terrain.",
    composante: "Culture et sport pour l'inclusion des jeunes",
    theme: 'maghroumin',
    budget: "15,46 millions d'euros",
    partner:
      'Consortium EUNIC : AECID (Espagne) · FIIAPP (Espagne) · British Council (Royaume-Uni)',
    territory: 'National avec ancrage territorial renforcé',
    period: 'Janvier 2022 – Décembre 2026',
    sectors: 'Culture, sport, création, inclusion',
    beneficiaries: [
      'Femmes et hommes de moins de 35 ans en situation de vulnérabilité',
      'Organisations de la société civile et acteurs indépendants',
      'Structures publiques locales, régionales et déconcentrées',
      'Ministères et organismes de tutelle',
    ],
    presentation: [
      "Maghroum’IN vise à renforcer l’inclusion et la participation des jeunes tunisien.ne.s en situation de vulnérabilité à travers la création, la culture et le sport.",
      "Le projet combine le renforcement des services publics culturels et sportifs, le soutien aux dynamiques communautaires et l’inclusion économique des jeunes dans ces secteurs.",
    ],
    /* No contractual governorate list in the dedicated brief; mapping shows multi-governorate coverage. */
    governorates: ['Présence nationale'],
    generalObjective:
      "Renforcer l’inclusion et la participation des jeunes tunisien.ne.s en situation de vulnérabilité à travers la création, la culture et le sport.",
    specificObjectives: [
      'Renforcer l’autonomie des jeunes dans les domaines du sport et de la culture.',
      'Soutenir et encourager leur engagement durable en faveur du changement dans les domaines du sport et de la culture.',
      'Favoriser leur représentation et veiller à ce qu’ils soient entendu.e.s dans les processus de prise de décision concernant leur vie culturelle et sportive.',
    ],
    kpis: [
      { value: '3', label: "Axes d'intervention" },
      { value: '60', label: 'Mois de mise en œuvre' },
    ],
    components: [
      {
        name: 'Services publics',
        tagline: 'Initiatives locales et nationales',
        description:
          "Initiatives locales et nationales, assistance technique aux ministères et échanges entre pairs pour renforcer l’accès des jeunes aux services culturels et sportifs.",
        results: [
          'Assistance technique aux ministères et structures publiques',
          'Échanges entre pairs sur les services culturels et sportifs',
          'Meilleur accès des jeunes aux services publics culturels et sportifs',
        ],
        sectors: ['Culture', 'Sport', 'Services publics'],
      },
      {
        name: 'Dynamiques communautaires',
        tagline: 'Engagement et apprentissage',
        description:
          "Soutien aux dynamiques communautaires via FESC, FAS, FOCUS, learning labs et Maghroum’IN Academy.",
        results: [
          'Dispositifs FESC, FAS et FOCUS déployés',
          'Learning labs et Maghroum’IN Academy',
          'Engagement communautaire renforcé sur les territoires',
        ],
        sectors: ['Société civile', 'Inclusion'],
      },
      {
        name: 'Inclusion économique',
        tagline: 'Incubation et accélération',
        description:
          "Incubation de nouvelles initiatives portées par des jeunes et accélération / relance d’entreprises existantes dans les secteurs culturel et sportif.",
        results: [
          'Incubation de nouvelles initiatives jeunes',
          'Accélération et relance d’entreprises culturelles et sportives',
          'Parcours d’inclusion économique dans la culture et le sport',
        ],
        sectors: ['Entrepreneuriat', 'Industries créatives'],
      },
    ],
    dataGaps: [
      'Budget issu du glossaire / homepage, absent de la fiche projet dédiée.',
      'La présentation dédiée écrit « FIAP » ; la forme institutionnelle retenue ici reste FIIAPP, en attente de confirmation propriétaire.',
      'Les mentions « première intervention UE dans le sport » et continuité Tfanen ne figurent pas dans la présentation dédiée et ont été retirées de la page projet.',
      'Pas de liste contractuelle de gouvernorats dans la présentation dédiée ; le mapping montre une couverture multi-gouvernorats.',
    ],
  },
  {
    slug: 'fe3ila',
    acronym: 'Fe3il.a',
    fullName:
      'Politique jeunesse et participation des jeunes dans les politiques publiques en Tunisie',
    tagline: 'Il ou elle agit',
    quote: 'Fe3il.a — avec et pour les jeunes.',
    ficheSummary:
      "Fe3il.a place les jeunes au cœur des politiques publiques locales et nationales. Le projet accompagne les communes tunisiennes dans le développement de stratégies jeunesse participatives — consultations des jeunes, ateliers de planification, processus de concertation avec la société civile. Au niveau national, il appuie le Ministère de la Jeunesse et des Sports dans son travail de coordination interministérielle. Un appel à projets soutient directement les organisations de la société civile travaillant avec les jeunes.",
    composante: 'Politiques publiques pour la jeunesse',
    theme: 'fe3ila',
    budget: "9 millions d'euros",
    partner: 'CILG-VNG International (Pays-Bas)',
    territory: 'National — communes partenaires et niveau ministériel',
    period: '2021 – 2026',
    fundingNote:
      "Projet financé par l'Union européenne avec la contribution du Royaume des Pays-Bas",
    sectors:
      'Gouvernance locale, participation des jeunes, entrepreneuriat et initiatives jeunes, engagement citoyen, espaces jeunesse',
    beneficiaries: [
      'Jeunes tunisien·ne·s âgé·e·s de 18 à 35 ans',
      'Communes',
      'Associations',
    ],
    presentation: [
      "Fe3il.a (« acteur·rice » en arabe tunisien) vise à faire des jeunes des acteurs du changement dans leurs territoires, en renforçant leur participation aux politiques publiques et aux processus de développement local.",
      'Communes partenaires : Agareb (Sfax), Ben Guerdane (Médenine), Chrayaa Machrek Shams (Kasserine), Djerba Ajim (Médenine), Douar Hicher (Manouba), El Aroussa (Siliana), Jemna (Kébili) et Medjez El Bab (Béja).',
    ],
    governorates: [
      'Sfax',
      'Médenine',
      'Kasserine',
      'Manouba',
      'Siliana',
      'Kébili',
      'Béja',
    ],
    generalObjective:
      "Contribuer à l’amélioration de l’inclusion économique, sociale et politique des jeunes tunisien·ne·s en renforçant leur participation dans les politiques publiques et les processus de développement local.",
    specificObjectives: [
      'Renforcer la participation des jeunes dans la gouvernance locale.',
      'Favoriser l’autonomisation économique et sociale des jeunes.',
      'Développer des politiques publiques plus inclusives et sensibles aux enjeux jeunesse.',
    ],
    kpis: [
      { value: '151', label: 'jeunes incubés' },
      { value: '123', label: 'microprojets et initiatives jeunes soutenus' },
      { value: '61', label: 'initiatives associatives' },
      { value: '8', label: 'communes partenaires' },
    ],
    components: [
      {
        name: 'Gouvernance locale avec les jeunes',
        tagline: 'Construire les politiques locales',
        description:
          "Renforcement de la participation des jeunes dans la gouvernance locale et dans la conception des politiques publiques territoriales.",
        results: ['8 communes accompagnées'],
        sectors: ['Gouvernance locale', 'Participation citoyenne'],
      },
      {
        name: 'Entrepreneuriat et initiatives jeunes',
        tagline: 'Soutenir l’action économique et sociale',
        description:
          "Soutien à l’entrepreneuriat et aux initiatives portées par des jeunes, notamment dans l’ESS, la culture et la création, l’environnement, les services de proximité et le sport communautaire.",
        results: [
          '123 microprojets et initiatives jeunes soutenus',
          '151 jeunes incubés',
        ],
        sectors: ['ESS', 'Culture', 'Environnement', 'Sport'],
      },
      {
        name: 'Engagement citoyen et associations',
        tagline: 'Appuyer les dynamiques associatives',
        description:
          "Soutien à l’engagement citoyen et aux associations qui accompagnent la participation des jeunes.",
        results: ['61 initiatives associatives'],
        sectors: ['Société civile'],
      },
      {
        name: 'Espaces adaptés aux jeunes',
        tagline: 'Créer et améliorer les lieux',
        description:
          "Création et amélioration d’espaces adaptés aux jeunes dans les territoires partenaires.",
        results: [
          'Espaces jeunesse créés ou améliorés dans les communes partenaires',
          'Lieux adaptés aux pratiques et besoins des 18–35 ans',
          'Ancrage territorial des politiques jeunesse',
        ],
        sectors: ['Infrastructures jeunesse'],
      },
    ],
    dataGaps: [
      'Le programme et certaines maquettes indiquent 9 M€ ; la fiche projet dédiée indique 9,1 M€ et prévaut ici.',
      'Les formulations PIA, Forum des Jeunes et coordination interministérielle ne figurent pas dans la présentation dédiée ; elles ont été retirées de la structure publique jusqu’à attribution séparée.',
      'Le classeur de mapping contient aussi des initiatives hors des 8 communes contractuelles ; elles ne remplacent pas ce périmètre officiel.',
    ],
  },
]

export const PROJECTS_BY_SLUG = Object.fromEntries(
  PROJECTS.map((project) => [project.slug, project]),
) as Record<Project['slug'], Project>
