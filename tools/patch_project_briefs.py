from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src" / "data" / "projects.ts"
text = path.read_text(encoding="utf-8")

replacements = [
    (
        """    presentation: [
      "Face aux défis persistants de l'inclusion économique des jeunes en Tunisie, notamment l'accès à l'emploi décent, les disparités territoriales et la nécessité de promouvoir des modèles économiques plus inclusifs et durables, l'économie sociale et solidaire (ESS) représente une opportunité majeure pour favoriser une croissance plus équitable et ancrée dans les territoires.",
      "Les territoires connaissent des dynamiques diverses : là où une région dispose d'un bassin d'emploi dense et d'infrastructures accessibles, une autre peut présenter un éloignement des centres de formation et un accès limité aux marchés. Ces disparités se vivent différemment selon que l'on grandit à Tunis ou à Kébili, à Sfax ou à Jendouba.",
    ],""",
        """    presentation: [
      "Le projet Jeun’ESS accompagne le développement d’un écosystème ESS structuré, inclusif et durable, afin de favoriser l’accès des jeunes à un emploi décent ancré dans les territoires.",
      "Face aux défis persistants de l'inclusion économique des jeunes en Tunisie, notamment l'accès à l'emploi décent, les disparités territoriales et la nécessité de promouvoir des modèles économiques plus inclusifs et durables, l'économie sociale et solidaire (ESS) représente une opportunité majeure pour favoriser une croissance plus équitable.",
    ],""",
    ),
    (
        """    dataGaps: [
      'Budget issu du glossaire / homepage, absent de la fiche projet auditée.',
      'La période spécifique de la fiche projet (Septembre 2019 – Août 2024) diffère de la période globale du programme EU4Youth.',
      'Le classeur de cartographie recense aussi des interventions hors des cinq gouvernorats affichés dans la fiche projet.',
    ],
  },
  {
    slug: 'go4youth',""",
        """    dataGaps: [
      'Budget issu du glossaire / homepage, absent de la fiche projet dédiée.',
      'La période spécifique de la fiche projet (Septembre 2019 – Août 2024) diffère de la période globale du programme EU4Youth.',
      'Les cinq gouvernorats nommés viennent de la fiche projet détaillée, pas de la présentation dédiée courte.',
      "La présentation dédiée parle de « cinq composantes » tout en listant six mécanismes ; la page conserve les six mécanismes documentés.",
      "Indicateur global de 49 clubs LIMITL’ESS vs détail 29 Enactus + 14 Génération = 43 ; six clubs restent à expliquer.",
      'Le classeur de cartographie recense aussi des interventions hors des cinq gouvernorats affichés dans la fiche projet.',
    ],
  },
  {
    slug: 'go4youth',""",
    ),
    (
        """    acronym: 'Go4Youth',
    fullName: 'Gates for Opportunities for Youth',
    tagline:
      "Moderniser les services publics d'intermédiation sur le marché du travail.",""",
        """    acronym: 'GO4Youth',
    fullName: 'Gates for Opportunities for Youth',
    tagline:
      'Renforcer les services d’emploi pour améliorer l’accès des jeunes à des opportunités professionnelles décentes.',""",
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"missing block starting: {old[:80]!r}")
    text = text.replace(old, new, 1)

# GO4Youth body from territory through dataGaps
start = text.index("    territory: 'Présence nationale',\n    period: 'Septembre 2021 – Juin 2027',")
end = text.index("  {\n    slug: 'swafy',")
go4 = """    territory:
      'Déploiement progressif dans les BETI concernés — 6 BETI pilotes puis 48 BETI sélectionnés',
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
      "GO4Youth vise à améliorer l’accès des jeunes et des populations vulnérables à des emplois de qualité en renforçant l’efficacité, l’accessibilité et la pertinence des services d’intermédiation sur le marché du travail tunisien.",
      "Le projet accompagne l’ANETI dans la modernisation de ses services aux chercheurs d’emploi et aux entreprises, l’accélération de sa transformation digitale et le renforcement de l’écosystème de l’employabilité. GO4Youth ne crée pas directement des emplois.",
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
        ],
        sectors: ['Emploi', 'Services publics'],
      },
      {
        name: 'Services aux entreprises',
        tagline: 'Renforcer l’offre aux employeurs',
        description:
          "Renforcement des services ANETI destinés aux entreprises pour améliorer le rapprochement entre l’offre et la demande d’emploi.",
        results: [],
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
        ],
        sectors: ['Numérique', 'Services publics'],
      },
      {
        name: "Écosystème d'employabilité",
        tagline: "Structurer l'accompagnement",
        description:
          "Renforcement de l’écosystème de l’employabilité autour de l’ANETI et des acteurs d’accompagnement.",
        results: [],
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
"""
text = text[:start] + go4 + text[end:]

# SWAFY
start = text.index("    tagline:\n      \"Soutenir l'employabilité des jeunes chercheurs et la culture scientifique.\",")
end = text.index("  {\n    slug: 'irada4youth',")
swafy = """    tagline:
      'Renforcer la contribution de la recherche et de l’innovation au développement économique et social avec et pour les jeunes.',
    composante: 'Emploi, employabilité et entrepreneuriat',
    theme: 'swafy',
    budget: "9 millions d'euros",
    partner: 'Agence Nationale de la Promotion de la Recherche Scientifique (ANPR)',
    territory:
      'Toutes les régions — objectif de diffusion inclusive de la culture scientifique',
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
      "SWAFY contribue au renforcement de la contribution de la recherche scientifique et de l’innovation au développement économique et social en Tunisie, en favorisant l’intégration des jeunes dans les écosystèmes scientifiques, technologiques et entrepreneuriaux.",
      "Le projet combine des bourses de recherche partenariale, des actions de culture scientifique et un dialogue national jeunesse-science.",
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
      { value: '235', label: 'bourses MOBIDOC doctorales et post-doctorales prévues' },
      { value: '3', label: 'composantes structurantes' },
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
        results: [],
        sectors: ['Culture scientifique', 'Éducation'],
      },
      {
        name: 'Débat Jeunesse et Science',
        tagline: 'Participation aux politiques STI',
        description:
          "Dialogue national jeunesse-science : analyses, recommandations, feuille de route et Congrès national Jeunesse–Science en appui à la stratégie nationale de la jeunesse 2035.",
        results: [],
        sectors: ['Politiques publiques'],
      },
    ],
    dataGaps: [
      'Budget issu du glossaire / homepage, absent de la fiche projet dédiée.',
      'Résultats actuels non chiffrés pour Jeunesse Créative et Débat Jeunesse et Science.',
      'La couverture nationale reste un objectif de diffusion inclusive, pas une cartographie de sites déjà déployés dans la présentation dédiée.',
    ],
  },
"""
# Keep acronym/fullName lines before tagline for SWAFY
swafy_prefix_end = text.rindex("    acronym: 'SWAFY',\n    fullName: 'Science With And For Youth',\n", 0, start) + len(
    "    acronym: 'SWAFY',\n    fullName: 'Science With And For Youth',\n"
)
text = text[:swafy_prefix_end] + swafy + text[end:]

# IRADA
start = text.index("    acronym: 'Irada4Youth',")
end = text.index("  {\n    slug: 'maghroumin',")
irada = """    acronym: 'IRADA4YOUTH',
    fullName:
      "Soutien au Développement Économique Durable Local pour l'Emploi des Jeunes",
    tagline:
      'Améliorer l’inclusion économique et sociale des jeunes par une approche conçue localement.',
    composante: 'Emploi, employabilité et entrepreneuriat',
    theme: 'irada4youth',
    budget: "5 millions d'euros",
    partner: 'CGDR avec ODNO, ODCO et ODS',
    territory: '6 gouvernorats prioritaires',
    period: '2022 – 2027 · 60 mois',
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
      { value: '15 %', label: 'réduction des demandes d’emploi non satisfaites 20–40 ans (cible d’impact)' },
    ],
    components: [
      {
        name: 'Appels à propositions régionaux',
        tagline: 'Financer les filières porteuses',
        description:
          "Appels ciblant les chaînes de valeur locales : plantes aromatiques et médicinales, agriculture biologique, oléiculture, arboriculture, tourisme rural/écologique, sous-produits oasiens, hydroponie, transformation alimentaire, élevage et artisanat de récupération.",
        results: ['Second appel à propositions lancé en juin 2026'],
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
        results: [],
        sectors: ['Développement économique local'],
      },
      {
        name: 'Renforcement de l’écosystème',
        tagline: 'Former et mobiliser les acteurs régionaux',
        description:
          "Formation et mobilisation de l’écosystème entrepreneurial régional, avec une cible d’au moins 600 participants et le soutien à la création de GIE portés par des jeunes.",
        results: ['Rapports narratifs annuels 2023, 2024 et 2025 publiés'],
        sectors: ['Gouvernance locale', 'Développement régional'],
      },
    ],
    dataGaps: [
      "La présentation dédiée mélange un indicateur d’impact 20–40 ans et une exigence d’au moins 75 % de sensibilisés de moins de 35 ans ; ces deux cadrages restent affichés sans fusion.",
      'Financement 100 % UE / 5 M€ confirmé dans la présentation dédiée.',
      'Le classeur de mapping ne contient encore de lignes que pour Kébili, Le Kef, Zaghouan et Kairouan.',
    ],
  },
"""
text = text[:start] + irada + text[end:]

# Maghroum
start = text.index("    tagline:\n      \"Renforcer l'inclusion des jeunes vulnérables par la culture et le sport.\",")
end = text.index("  {\n    slug: 'fe3ila',")
mag = """    tagline:
      "Renforcer l’inclusion et la participation des jeunes tunisien.ne.s en situation de vulnérabilité à travers la création, la culture et le sport.",
    composante: "Culture et sport pour l'inclusion",
    theme: 'maghroumin',
    budget: "15,46 millions d'euros",
    partner: 'AECID – British Council – FIIAPP',
    territory: 'Couverture multi-gouvernorats (liste contractuelle absente de la présentation dédiée)',
    period: 'À partir du 1er janvier 2022 — 60 mois',
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
      { value: '3', label: "axes d'intervention" },
      { value: '60', label: 'mois de mise en œuvre' },
    ],
    components: [
      {
        name: 'Services publics',
        tagline: 'Initiatives locales et nationales',
        description:
          "Initiatives locales et nationales, assistance technique aux ministères et échanges entre pairs pour renforcer l’accès des jeunes aux services culturels et sportifs.",
        results: [],
        sectors: ['Culture', 'Sport', 'Services publics'],
      },
      {
        name: 'Dynamiques communautaires',
        tagline: 'Engagement et apprentissage',
        description:
          "Soutien aux dynamiques communautaires via FESC, FAS, FOCUS, learning labs et Maghroum’IN Academy.",
        results: [],
        sectors: ['Société civile', 'Inclusion'],
      },
      {
        name: 'Inclusion économique',
        tagline: 'Incubation et accélération',
        description:
          "Incubation de nouvelles initiatives portées par des jeunes et accélération / relance d’entreprises existantes dans les secteurs culturel et sportif.",
        results: [],
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
"""
mag_prefix_end = text.rindex(
    "    acronym: \"Maghroum'IN\",\n    fullName:\n      \"Participation et inclusion des jeunes tunisien(ne)s à travers la création, l'accès à la culture et au sport\",\n",
    0,
    start,
) + len(
    "    acronym: \"Maghroum'IN\",\n    fullName:\n      \"Participation et inclusion des jeunes tunisien(ne)s à travers la création, l'accès à la culture et au sport\",\n"
)
text = text[:mag_prefix_end] + mag + text[end:]

# Fe3il.a
start = text.index("    tagline:\n      'Intégrer les jeunes dans la conception et la mise en œuvre des politiques publiques.',")
end = text.index("\n]\n\n/** Every logo opens") if "\n]\n\n/** Every logo opens" in text else text.rindex("\n]\n")
# Find end of fe3ila object more safely
end = text.index("\n]\n", text.index("slug: 'fe3ila'"))
# Actually PROJECTS array ends after fe3ila; keep trailing export helpers
fe_end_marker = "\n]\n\n/** Documents explicitly" if "\n]\n\n/** Documents explicitly" in text else None
# projects.ts ends with `]\n` then maybe blank and export filter? Read end.
tail_start = text.rindex("\n]\n")
fe3 = """    tagline: 'Faire des jeunes des acteurs du changement dans leurs territoires.',
    composante: 'Politiques publiques et participation des jeunes',
    theme: 'fe3ila',
    budget: "9,1 millions d'euros",
    partner: 'CILG-VNG International · Ministère de la Jeunesse et des Sports',
    territory: '8 communes partenaires',
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
        results: ['123 microprojets et initiatives jeunes soutenus'],
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
        results: [],
        sectors: ['Infrastructures jeunesse'],
      },
    ],
    dataGaps: [
      'Le programme et certaines maquettes indiquent 9 M€ ; la fiche projet dédiée indique 9,1 M€ et prévaut ici.',
      'Les formulations PIA, Forum des Jeunes et coordination interministérielle ne figurent pas dans la présentation dédiée ; elles ont été retirées de la structure publique jusqu’à attribution séparée.',
      'Le classeur de mapping contient aussi des initiatives hors des 8 communes contractuelles ; elles ne remplacent pas ce périmètre officiel.',
    ],
  },
"""
fe_prefix_end = text.rindex(
    "    acronym: 'Fe3il.a',\n    fullName:\n      'Politique jeunesse et participation des jeunes dans les politiques publiques en Tunisie',\n",
    0,
    start,
) + len(
    "    acronym: 'Fe3il.a',\n    fullName:\n      'Politique jeunesse et participation des jeunes dans les politiques publiques en Tunisie',\n"
)
text = text[:fe_prefix_end] + fe3 + text[tail_start + 1 :]  # keep from final ]

path.write_text(text, encoding="utf-8")
print("patched projects.ts")
