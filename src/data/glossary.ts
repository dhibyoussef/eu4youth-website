/**
 * Glossaire EU4Youth — données transcrites telles quelles depuis la source approuvée
 * « Glossaire/glossaire_eu4youth_complet.html » (tableau `DATA`).
 * Aucun contenu (terme, tag, définition, contexte, couleur) n’est reformulé ici.
 */

export interface GlossaryEntry {
  term: string
  tag: string
  /** Définition (champ `def` de la source). */
  def: string
  /** Mise en contexte EU4Youth (champ `ctx` de la source ; vide lorsque la source est vide). */
  ctx: string
}

export interface GlossaryCategory {
  id: string
  label: string
  /** Couleur d’accent de la thématique (hex, telle quelle dans la source). */
  color: string
  entries: GlossaryEntry[]
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  {
    id: 'programme',
    label: 'Programme EU4Youth',
    color: '#1D9E75',
    entries: [
      {
        term: 'EU4Youth',
        tag: 'Programme',
        def: "Programme-cadre de l'Union européenne en faveur de la jeunesse tunisienne, lancé en 2019 dans le cadre du Partenariat UE-Tunisie pour la Jeunesse. Il réunit six projets complémentaires organisés autour de trois objectifs spécifiques : l'emploi et l'entrepreneuriat, la culture et le sport, et les politiques publiques pour la jeunesse.",
        ctx: "EU4Youth est le plus grand programme de coopération de l'UE centré sur la jeunesse en Tunisie. Sa durée initiale (72 mois) a été portée à 96 mois par avenant en décembre 2021.",
      },
      {
        term: 'Programme-cadre',
        tag: 'Concept',
        def: "Mécanisme de financement et de coordination qui regroupe plusieurs projets distincts sous une vision commune et des principes d'intervention partagés. Le programme-cadre fixe les objectifs globaux, la gouvernance d'ensemble et les mécanismes de coordination, tandis que chaque projet dispose de son propre partenaire de mise en œuvre et périmètre d'action.",
        ctx: 'EU4Youth est structuré comme un programme-cadre à six projets répartis en trois composantes thématiques.',
      },
      {
        term: 'Convention de financement',
        tag: 'Juridique',
        def: "Accord juridique signé entre la Commission européenne et le gouvernement bénéficiaire, formalisant les engagements des deux parties sur le budget, la durée, les objectifs et les conditions de mise en œuvre d'un programme. Elle constitue la base contractuelle de tout programme de l'UE.",
        ctx: "La Convention EU4Youth a été signée en juin 2019 entre la Commission européenne et le Ministère du Développement, de l'Investissement et de la Coopération Internationale de la Tunisie.",
      },
      {
        term: 'Composante',
        tag: 'Architecture',
        def: "Subdivision thématique d'un programme regroupant un ou plusieurs projets autour d'un objectif spécifique commun. La composante est un niveau intermédiaire entre le programme-cadre et le projet.",
        ctx: 'EU4Youth compte trois composantes : C1 (Emploi), C2 (Culture et sport), C3 (Politiques publiques et participation des jeunes).',
      },
      {
        term: 'Objectif spécifique (OS)',
        tag: 'Logique de projet',
        def: "Résultat de niveau intermédiaire qu'un programme cherche à atteindre, plus concret que l'objectif global et directement mesurable. L'objectif spécifique délimite le périmètre d'action d'une composante et structure les résultats attendus.",
        ctx: 'EU4Youth se structure autour de trois OS : OS1 (employabilité et entrepreneuriat), OS2 (inclusion par la culture et le sport), OS3 (politiques publiques et participation).',
      },
      {
        term: 'Partenaire de mise en œuvre',
        tag: 'Acteur',
        def: "Organisation — internationale, nationale ou de la société civile — chargée de la gestion opérationnelle d'un projet. Elle signe un contrat de subvention avec la Délégation de l'UE et est responsable de l'atteinte des résultats, de la gestion financière et du reporting.",
        ctx: "Les six projets EU4Youth sont mis en œuvre respectivement par le BIT/OIT, la Banque mondiale, l'ANPR, le CGDR/ODRs, le consortium AECID-FIIAPP-British Council et CILG-VNG International.",
      },
      {
        term: 'Avenant',
        tag: 'Juridique',
        def: "Modification formelle apportée à un accord ou contrat existant, permettant d'en ajuster des éléments (durée, budget, objectifs) sans rédiger un nouveau document contractuel. L'avenant est signé par toutes les parties originelles.",
        ctx: "En décembre 2021, un avenant a prolongé EU4Youth de 72 à 96 mois afin de permettre l'atteinte des objectifs malgré les perturbations liées à la pandémie de Covid-19.",
      },
      {
        term: 'Partenariat UE-Tunisie pour la Jeunesse',
        tag: 'Cadre politique',
        def: "Cadre de coopération bilatérale annoncé conjointement le 1er décembre 2016 fixant les grandes orientations de la coopération UE-Tunisie en matière de jeunesse, sur la base d'un engagement commun à placer les jeunes au cœur de la relation de coopération.",
        ctx: "EU4Youth est l'instrument opérationnel de ce partenariat politique.",
      },
    ],
  },
  {
    id: 'projets',
    label: 'Les six projets',
    color: '#378ADD',
    entries: [
      {
        term: 'Fe3il.a',
        tag: 'Projet C3',
        def: "Sixième projet d'EU4Youth, relevant de la Composante 3. Son nom, en arabe tunisien, signifie « acteur·rice ». Mis en œuvre par CILG-VNG International avec la contribution du Royaume des Pays-Bas, il vise à faire des jeunes des acteurs du changement dans leurs territoires.",
        ctx: 'Fe3il.a accompagne des communes dans le développement de stratégies jeunesse participatives et soutient le MJS dans la coordination interministérielle pour une politique nationale jeunesse cohérente.',
      },
      {
        term: 'IRADA4YOUTH',
        tag: 'Projet C1',
        def: "Quatrième projet d'EU4Youth, extension ciblée du programme IRADA. Géré par le CGDR en partenariat avec l'ODNO, l'ODCO et l'ODS, il soutient des projets économiques créateurs d'emploi pour les jeunes dans six gouvernorats prioritaires : Zaghouan, Mahdia, Le Kef, Kairouan, Tozeur et Kébili.",
        ctx: "Le mécanisme central d'IRADA4YOUTH est l'appel à propositions (AAP) régional ciblant les filières porteuses locales.",
      },
      {
        term: 'GO4Youth',
        tag: 'Projet C1',
        def: "Deuxième projet d'EU4Youth (« Gates for Opportunities »), mis en œuvre par la Banque mondiale et l'ANETI. Il vise à moderniser les services publics d'intermédiation sur le marché du travail, notamment à travers la transformation digitale de l'ANETI et le renforcement de l'écosystème d'employabilité.",
        ctx: "GO4Youth a expérimenté un système de profilage dans 6 BETI pilotes, puis un déploiement vers 48 BETI sélectionnés. Le projet ne crée pas directement des emplois.",
      },
      {
        term: "Jeun'ESS",
        tag: 'Projet C1',
        def: "Premier projet d'EU4Youth, mis en œuvre par le BIT/OIT. Il cible le développement de l'économie sociale et solidaire (ESS) comme vecteur d'emploi et d'inclusion pour les jeunes dans sept gouvernorats, à travers six mécanismes : Social Innovation Fund, Re-Fund Challenge, Market Fund, LIMITL'ESS Clubs – Enactus, LIMITL'ESS Génération et Community Fund.",
        ctx: "Jeun'ESS crée également des Clubs ESS dans les structures de jeunesse pour développer la culture entrepreneuriale collective.",
      },
      {
        term: 'SWAFY',
        tag: 'Projet C1',
        def: "Troisième projet d'EU4Youth (« Science With and For Youth »), mis en œuvre par l'ANPR. Il soutient l'employabilité des jeunes chercheurs via des bourses de recherche partenariale (MOBIDOC), la promotion de la culture scientifique et un dialogue national sur les politiques jeunesse-science.",
        ctx: 'SWAFY comprend trois composantes : MOBIDOC (235 bourses doc/post-doc prévues), Jeunesse Créative, et Débat Jeunesse et Science.',
      },
      {
        term: "Maghroum'IN",
        tag: 'Projet C2',
        def: "Cinquième projet d'EU4Youth, mis en œuvre par le consortium AECID–British Council–FIIAPP. Il vise à renforcer l'inclusion et la participation des jeunes tunisien.ne.s en situation de vulnérabilité à travers la création, la culture et le sport.",
        ctx: "Maghroum'IN combine le renforcement des services publics culturels et sportifs, le soutien aux dynamiques communautaires et l'inclusion économique des jeunes dans ces secteurs.",
      },
    ],
  },
  {
    id: 'cooperation',
    label: 'Coopération internationale',
    color: '#534AB7',
    entries: [
      {
        term: 'Coopération internationale au développement',
        tag: 'Fondamental',
        def: 'Ensemble des mécanismes par lesquels des États, des organisations internationales ou des institutions supranationales mobilisent des ressources financières, techniques et humaines pour soutenir le développement économique, social et humain de pays partenaires. Elle repose sur le principe de partenariat et vise des résultats durables.',
        ctx: "EU4Youth s'inscrit dans le cadre de la politique de coopération extérieure de l'Union européenne, qui est le premier donateur mondial d'aide au développement.",
      },
      {
        term: 'Aide publique au développement (APD)',
        tag: 'Fondamental',
        def: "Flux financiers fournis par des gouvernements à des pays en développement ou à des organisations multilatérales (ONU, Banque mondiale...) dans le but de promouvoir le développement économique et le bien-être. Elle est comptabilisée par l'OCDE selon des critères précis de concessionnalité.",
        ctx: "EU4Youth constitue une part de l'APD de l'Union européenne à la Tunisie.",
      },
      {
        term: 'Logique de résultats / cadre logique',
        tag: 'Méthode',
        def: "Approche méthodologique qui structure une intervention selon une hiérarchie causale : activités → extrants (outputs) → résultats (outcomes) → impact. Elle permet de clarifier la chaîne de causalité entre ce que le programme fait et les changements qu'il cherche à produire, et sert de base au suivi et à l'évaluation.",
        ctx: 'Chaque projet EU4Youth est conçu selon une logique de résultats, avec des indicateurs de performance définis contractuellement pour chaque niveau de la chaîne.',
      },
      {
        term: 'Extrant (output)',
        tag: 'Logique de projet',
        def: "Produit direct d'une activité : formation dispensée, document produit, infrastructure réhabilitée, bourse accordée. L'extrant est immédiatement mesurable à l'issue d'une activité. Il se distingue du résultat (outcome), qui mesure le changement induit chez les bénéficiaires.",
        ctx: "Exemple EU4Youth : une formation de 5 jours dispensée à 30 animateurs de jeunesse est un extrant ; l'amélioration de leurs pratiques dans leurs structures est un résultat.",
      },
      {
        term: 'Résultat (outcome)',
        tag: 'Logique de projet',
        def: "Changement observable dans le comportement, les capacités, les conditions ou le statut des bénéficiaires, induit par les activités du programme. Le résultat est le niveau de mesure qui reflète l'effet réel d'une intervention sur les personnes ciblées.",
        ctx: 'EU4Youth structure ses composantes autour de résultats attendus précis (R1.1, R1.2… R3.2) qui sont suivis par des indicateurs dans le cadre de suivi-évaluation du programme.',
      },
      {
        term: 'Impact',
        tag: 'Logique de projet',
        def: "Changement de long terme dans la situation globale d'une population ou d'un système, partiellement attribuable au programme. L'impact est difficile à mesurer directement et s'observe sur le long terme, au-delà de la fin du financement.",
        ctx: "L'impact visé par EU4Youth est la réduction de l'exclusion économique, sociale et politique des jeunes tunisiens les plus défavorisés.",
      },
      {
        term: 'Indicateur de performance',
        tag: 'Suivi-évaluation',
        def: "Mesure quantitative ou qualitative permettant d'apprécier le degré d'atteinte d'un objectif ou d'un résultat. Un bon indicateur est SMART : Spécifique, Mesurable, Atteignable, Réaliste et Temporellement défini.",
        ctx: "EU4Youth suit des indicateurs désagrégés par genre, âge et territoire pour s'assurer que les résultats bénéficient équitablement aux différents groupes de jeunes.",
      },
      {
        term: 'Évaluation à mi-parcours',
        tag: 'Suivi-évaluation',
        def: "Évaluation indépendante conduite à la moitié de la durée d'un programme pour apprécier sa pertinence, son efficacité, son efficience, son impact attendu et sa durabilité. Elle produit des recommandations pour ajuster la mise en œuvre.",
        ctx: "L'évaluation à mi-parcours d'EU4Youth a confirmé la pertinence globale du programme et recommandé de simplifier le suivi-évaluation et de consolider la coordination entre projets.",
      },
      {
        term: 'Durabilité (sustainability)',
        tag: 'Concept clé',
        def: "Capacité des résultats et des changements produits par un programme à se maintenir au-delà de la fin du financement extérieur. Elle dépend de l'appropriation institutionnelle, de la structuration des acteurs locaux et de la continuité des politiques publiques.",
        ctx: "EU4Youth investit dans la durabilité à travers le renforcement des institutions (communes, MJS, ANETI), la formation de praticiens et la création d'écosystèmes locaux d'acteurs.",
      },
      {
        term: 'Capitalisation',
        tag: 'Méthode',
        def: "Processus systématique par lequel un programme documente, analyse et diffuse les leçons tirées de ses expériences et pratiques, pour les rendre utiles à d'autres acteurs et alimenter les politiques publiques. La capitalisation transforme l'expérience en connaissance partageable.",
        ctx: 'EU4Youth investit dans la capitalisation pour valoriser les approches innovantes (forums jeunes, clubs ESS, stratégies locales jeunesse) et construire une mémoire collective du secteur.',
      },
      {
        term: "Délégation de l'Union européenne (DUE)",
        tag: 'Acteur',
        def: "Représentation officielle de la Commission européenne dans un pays tiers, assurant la mise en œuvre de la politique extérieure de l'UE sur place. Elle gère les programmes de coopération, suit leur mise en œuvre et entretient le dialogue politique avec les autorités du pays partenaire.",
        ctx: "La DUE Tunisie est le maître d'ouvrage d'EU4Youth : elle signe les conventions, supervise les six projets et est l'interlocutrice de référence auprès du gouvernement tunisien.",
      },
      {
        term: 'Conditionnalité',
        tag: 'Concept',
        def: "Principe selon lequel le versement d'une aide ou le maintien d'un financement est subordonné au respect de certaines conditions par le pays bénéficiaire (réformes politiques, critères économiques, objectifs de résultats). La conditionnalité peut être ex ante (avant versement) ou ex post (basée sur les résultats).",
        ctx: "Les programmes de l'UE incluent généralement des exigences en matière de transparence financière et de reporting comme conditions au décaissement des fonds.",
      },
      {
        term: 'Appropriation (ownership)',
        tag: 'Concept clé',
        def: "Principe selon lequel les pays et institutions bénéficiaires doivent exercer un contrôle et une responsabilité réels sur leurs stratégies de développement et sur les programmes qui les soutiennent. L'appropriation est une condition de la durabilité des résultats.",
        ctx: "EU4Youth favorise l'appropriation en impliquant les ministères tunisiens, les communes et les ODRs dans la conception et le pilotage des activités.",
      },
      {
        term: 'Genre et développement (GED)',
        tag: 'Approche',
        def: "Approche qui intègre systématiquement l'analyse des rapports sociaux entre femmes et hommes dans les programmes de développement, reconnaissant que l'inégalité de genre est un obstacle structurel au développement. Elle va au-delà du ciblage des femmes pour interroger les systèmes qui produisent les inégalités.",
        ctx: "EU4Youth applique l'approche GED transversalement : ciblage des jeunes femmes, indicateurs sexo-spécifiques, analyse différenciée des barrières à l'emploi selon le genre.",
      },
      {
        term: 'Approche territoriale',
        tag: 'Méthode',
        def: "Modalité d'intervention qui prend en compte les spécificités géographiques, économiques et sociales d'un territoire donné, et qui mobilise les acteurs locaux plutôt que d'imposer des solutions standardisées centralement.",
        ctx: "EU4Youth cible prioritairement les gouvernorats à fort taux de chômage et à faible indice de développement régional, et s'appuie sur les ODRs et les communes comme relais territoriaux.",
      },
    ],
  },
  {
    id: 'emploi',
    label: 'Emploi et entrepreneuriat',
    color: '#BA7517',
    entries: [
      {
        term: 'Emploi décent',
        tag: 'OIT',
        def: "Concept développé par l'OIT désignant un travail productif qui génère un revenu équitable, assure la sécurité du travailleur, garantit une protection sociale, favorise le développement personnel et offre une intégration sociale. Il suppose l'absence de discrimination et la liberté d'expression au travail.",
        ctx: "EU4Youth ne cible pas n'importe quel emploi : il vise la création d'emplois décents, notamment pour les jeunes NEET et les jeunes des régions intérieures.",
      },
      {
        term: 'Employabilité',
        tag: 'Concept',
        def: "Ensemble des compétences, connaissances, attitudes et attributs qui permettent à un individu d'accéder à un emploi, de s'y maintenir et d'évoluer professionnellement. Elle inclut les compétences techniques (hard skills) et transversales (soft skills) comme la communication, l'adaptabilité et la résolution de problèmes.",
        ctx: "Go4Youth et SWAFY contribuent spécifiquement à améliorer l'employabilité des jeunes tunisiens, respectivement par la modernisation de l'intermédiation et le soutien aux jeunes chercheurs.",
      },
      {
        term: 'NEET',
        tag: 'Statistique',
        def: "Acronyme anglais de « Not in Education, Employment or Training » — désignant les jeunes qui ne sont ni en emploi, ni en études, ni en formation. Cette catégorie représente le segment de jeunes le plus exposé au risque d'exclusion durable.",
        ctx: "En Tunisie, la situation NEET concerne 20,3 % des jeunes hommes urbains, 32,4 % des jeunes femmes urbaines et jusqu'à 50,4 % des jeunes femmes rurales. EU4Youth cible prioritairement ce groupe.",
      },
      {
        term: 'Intermédiation sur le marché du travail',
        tag: 'Concept',
        def: "Ensemble des activités visant à mettre en relation l'offre (les employeurs) et la demande (les chercheurs d'emploi) sur le marché du travail. Elle peut être publique (agences nationales pour l'emploi) ou privée (associations d'accompagnement, cabinets de recrutement).",
        ctx: "Go4Youth vise à moderniser les mécanismes publics d'intermédiation via l'ANETI et à renforcer l'écosystème privé d'accompagnement des demandeurs d'emploi.",
      },
      {
        term: 'Entrepreneuriat',
        tag: 'Concept',
        def: "Démarche par laquelle un individu ou un collectif identifie une opportunité, mobilise des ressources et prend un risque calculé pour créer une activité économique nouvelle. On distingue l'entrepreneuriat individuel, l'entrepreneuriat social et l'entrepreneuriat collectif (ESS).",
        ctx: "EU4Youth soutient l'entrepreneuriat comme alternative à l'emploi salarié, notamment dans les régions où les offres d'emploi formelles sont rares (Irada4Youth, Jeun'ESS).",
      },
      {
        term: 'Entrepreneuriat social',
        tag: 'Concept',
        def: "Forme d'entrepreneuriat qui poursuit une mission sociale, environnementale ou culturelle, en utilisant les mécanismes du marché pour produire des changements positifs dans la société. L'entreprise sociale génère des revenus mais réinvestit ses excédents dans sa mission.",
        ctx: "Les organisations soutenues par Jeun'ESS dans le cadre du Fonds d'Innovation Sociale relèvent souvent de l'entrepreneuriat social.",
      },
      {
        term: 'Secteur informel',
        tag: 'Concept',
        def: "Ensemble des activités économiques qui se déroulent en dehors du cadre légal et réglementaire : travailleurs sans contrat formel, activités non déclarées, absence de protection sociale. Le secteur informel représente un palliatif à l'absence d'emploi formel mais expose les travailleurs à une grande précarité.",
        ctx: "Près de 42 % de la main-d'œuvre tunisienne travaille dans le secteur informel. EU4Youth cherche à favoriser la formalisation de l'emploi, notamment via l'ESS.",
      },
      {
        term: 'Filière',
        tag: 'Économie',
        def: "Chaîne de valeur sectorielle regroupant l'ensemble des acteurs économiques (producteurs, transformateurs, distributeurs, prestataires) intervenant dans la production et la mise en marché d'un produit ou service. L'approche filière analyse les interdépendances entre acteurs pour identifier les leviers de développement.",
        ctx: "Irada4Youth soutient des projets dans des filières identifiées comme porteuses d'emplois pour les jeunes dans six gouvernorats (agriculture, artisanat, tourisme...).",
      },
      {
        term: 'Recherche partenariale',
        tag: 'Concept',
        def: "Mode de production de la recherche scientifique associant des chercheurs et des acteurs socioéconomiques (entreprises, associations, institutions) autour d'une problématique d'intérêt commun. Elle vise à rapprocher la recherche académique des besoins du monde productif.",
        ctx: 'SWAFY promeut ce modèle via MOBIDOC, qui finance des doctorants et post-doctorants travaillant dans des entreprises ou des organisations tunisiennes.',
      },
      {
        term: "Business plan / plan d'affaires",
        tag: 'Outil',
        def: "Document formalisé décrivant le projet entrepreneurial : modèle économique, analyse de marché, stratégie commerciale, plan financier (compte de résultats prévisionnel, plan de trésorerie, seuil de rentabilité), structure juridique et équipe. Il sert à la fois d'outil de planification interne et de support de communication vers les financeurs.",
        ctx: "Les porteurs de projets accompagnés dans le cadre d'Irada4Youth, Jeun'ESS et SWAFY sont formés à l'élaboration de business plans adaptés à leurs secteurs.",
      },
      {
        term: 'Étude de faisabilité',
        tag: 'Outil',
        def: "Analyse préalable au lancement d'un projet visant à évaluer sa viabilité technique, économique, financière, juridique et opérationnelle. Elle permet d'identifier les risques, les ressources nécessaires et les conditions de succès avant de s'engager dans la mise en œuvre.",
        ctx: "Les appels à propositions d'Irada4Youth requièrent des éléments de faisabilité pour évaluer le potentiel de création d'emplois durables des projets candidats.",
      },
      {
        term: 'Mapping stratégique / cartographie des acteurs',
        tag: 'Outil',
        def: "Méthode d'analyse qui identifie, catégorise et visualise l'ensemble des parties prenantes d'un secteur ou d'un territoire (institutions, associations, entreprises, bailleurs...), leurs rôles, leurs relations et leurs influences mutuelles. Outil de base pour toute stratégie d'intervention.",
        ctx: "GO4Youth renforce l'écosystème d'employabilité autour de l'ANETI, y compris les acteurs associatifs d'accompagnement vers l'emploi.",
      },
      {
        term: 'Modèle économique (business model)',
        tag: 'Outil',
        def: "Description de la façon dont une organisation crée, délivre et capture de la valeur. Il précise les sources de revenus, les coûts principaux, les ressources clés, les partenariats et les segments de clientèle. Le Canvas de Business Model (Osterwalder) est l'outil de formalisation le plus répandu.",
        ctx: "La viabilité du modèle économique est un critère central dans la sélection des projets ESS financés par Jeun'ESS.",
      },
      {
        term: 'SWOT / FFOM',
        tag: 'Outil',
        def: "Outil d'analyse stratégique identifiant les Forces (Strengths), Faiblesses (Weaknesses), Opportunités (Opportunities) et Menaces (Threats) d'une organisation ou d'un projet. Il articule l'analyse interne (forces/faiblesses) et l'analyse externe (opportunités/menaces) pour orienter les choix stratégiques.",
        ctx: "L'analyse SWOT est utilisée dans les diagnostics territoriaux d'Irada4Youth et dans l'accompagnement des porteurs de projets ESS dans Jeun'ESS.",
      },
    ],
  },
  {
    id: 'ess',
    label: 'Économie sociale et solidaire',
    color: '#0F6E56',
    entries: [
      {
        term: 'Économie sociale et solidaire (ESS)',
        tag: 'Secteur',
        def: "Ensemble des entreprises et organisations (coopératives, mutuelles, associations, fondations) qui poursuivent des objectifs économiques et sociaux simultanément, en plaçant la solidarité, la démocratie interne et la finalité sociale avant la maximisation du profit. L'ESS produit des biens et services pour le marché tout en répondant à des besoins collectifs.",
        ctx: "En Tunisie, l'ESS représente 0,6 % de la population active mais offre un fort potentiel dans les régions intérieures. Jeun'ESS en fait le pivot de sa stratégie d'emploi pour les jeunes.",
      },
      {
        term: 'Coopérative',
        tag: 'Forme juridique',
        def: 'Entreprise dont les membres sont à la fois associés et usagers (coopératives de consommation), producteurs (coopératives agricoles) ou salariés (coopératives de production). Elle fonctionne selon le principe démocratique « une personne, une voix ». En Tunisie, la forme coopérative est reconnue par la loi n°2020-30.',
        ctx: "Les Groupements de Développement Agricole (GDA) sont la forme coopérative la plus répandue en milieu rural tunisien, et constituent une cible prioritaire de Jeun'ESS.",
      },
      {
        term: 'Gouvernance participative',
        tag: 'Concept',
        def: "Mode de gestion d'une organisation qui associe l'ensemble des parties prenantes (membres, salariés, bénéficiaires, partenaires) aux prises de décision, selon des règles de transparence et d'égalité. La gouvernance participative est un principe fondateur de l'ESS.",
        ctx: "Jeun'ESS renforce les compétences de gouvernance participative des structures ESS qu'il soutient, condition essentielle de leur durabilité.",
      },
      {
        term: "Fonds d'innovation sociale",
        tag: 'Mécanisme',
        def: "Mécanisme de financement ciblant des projets ou idées socialement innovants portés par des individus ou des collectifs. Il accompagne les porteurs de la phase d'idéation jusqu'à la création d'une structure, en combinant financement et appui technique.",
        ctx: "Dans EU4Youth/Jeun'ESS, le Fonds d'Innovation Sociale cible les nouvelles initiatives ESS portées par des jeunes et les accompagne jusqu'à la création de structures pérennes.",
      },
      {
        term: 'Re-Fund Challenge',
        tag: 'Mécanisme',
        def: "Mécanisme de financement et d'accompagnement conçu pour renforcer des organisations ESS existantes fragilisées (notamment par la crise Covid-19). Il combine subvention, renforcement de capacités et incubation.",
        ctx: "Dans Jeun'ESS, le Re-Fund Challenge a financé environ 40 organisations ESS et leur a fourni un accompagnement technique approfondi.",
      },
      {
        term: 'Market Fund',
        tag: 'Mécanisme',
        def: "Mécanisme visant à renforcer les capacités commerciales et de mise en marché des organisations ESS, pour leur permettre d'accéder à de nouveaux marchés (nationaux et internationaux). Il répond à la faiblesse commerciale souvent identifiée comme principal obstacle à la croissance des structures ESS.",
        ctx: "Dans Jeun'ESS, le Market Fund est la troisième composante après le Re-Fund et le Fonds d'Innovation Sociale, ciblant la commercialisation des produits des structures ESS.",
      },
      {
        term: 'Club ESS',
        tag: 'Mécanisme',
        def: "Structure légère créée au sein d'un établissement scolaire, d'une maison des jeunes ou d'une université pour initier les jeunes aux principes de l'ESS et à l'entrepreneuriat collectif. Il sert à développer la culture entrepreneuriale solidaire avant la création formelle d'entreprises.",
        ctx: "Jeun'ESS a créé des Clubs ESS dans des structures locales de jeunesse dans le cadre de la sous-composante LimitlESS.",
      },
      {
        term: 'Chaîne de valeur solidaire',
        tag: 'Concept',
        def: "Organisation d'une filière économique intégrant des acteurs de l'ESS à différents niveaux (production, transformation, distribution), avec des principes de répartition équitable de la valeur ajoutée entre tous les maillons. Elle cherche à réduire les marges des intermédiaires et à mieux rémunérer les producteurs.",
        ctx: "L'approche de Jeun'ESS s'appuie sur l'identification de chaînes de valeur dans lesquelles les jeunes et les structures ESS peuvent s'insérer durablement.",
      },
    ],
  },
  {
    id: 'environnement',
    label: 'Environnement et développement durable',
    color: '#3B6D11',
    entries: [
      {
        term: 'Économie verte',
        tag: 'Concept',
        def: "Modèle économique qui vise à améliorer le bien-être humain et l'équité sociale tout en réduisant significativement les risques environnementaux et la pénurie écologique. L'économie verte repose sur trois piliers : faible émission de carbone, utilisation efficiente des ressources, et inclusion sociale.",
        ctx: "Les filières soutenues dans Irada4Youth et les projets ESS de Jeun'ESS s'inscrivent de plus en plus dans une logique d'économie verte (agriculture biologique, énergies renouvelables, éco-tourisme...).",
      },
      {
        term: 'Économie circulaire',
        tag: 'Concept',
        def: "Modèle économique qui s'oppose à l'économie linéaire (extraire-produire-jeter) en cherchant à maintenir les ressources, les produits et les matières dans le cycle économique le plus longtemps possible, en réduisant les déchets et en favorisant la réutilisation, la réparation et le recyclage.",
        ctx: "L'économie circulaire est une filière d'opportunités pour l'entrepreneuriat des jeunes, notamment dans les domaines du recyclage, de la réparation et de la valorisation des déchets.",
      },
      {
        term: 'Tourisme durable',
        tag: 'Secteur',
        def: "Forme de tourisme qui prend pleinement en compte ses impacts économiques, sociaux et environnementaux actuels et futurs, en répondant aux besoins des visiteurs, des professionnels du secteur, de l'environnement et des communautés d'accueil.",
        ctx: "Plusieurs gouvernorats couverts par Irada4Youth (Tozeur, Kébili) disposent d'un fort potentiel de tourisme saharien et d'écotourisme, filières porteuses pour l'emploi des jeunes.",
      },
      {
        term: 'Adaptation au changement climatique',
        tag: 'Concept',
        def: "Ensemble des ajustements que les systèmes naturels, humains ou économiques doivent opérer pour répondre aux effets actuels ou attendus du changement climatique. Elle distingue de l'atténuation (réduction des causes) et vise à réduire la vulnérabilité des populations et des écosystèmes.",
        ctx: "La Tunisie est particulièrement vulnérable aux effets du changement climatique (sécheresse, érosion côtière, désertification). Les projets agricoles d'Irada4Youth intègrent cet enjeu.",
      },
      {
        term: 'Agriculture durable',
        tag: 'Secteur',
        def: "Pratiques agricoles qui satisfont les besoins alimentaires actuels sans compromettre la capacité des générations futures à satisfaire les leurs. Elle intègre les dimensions économique (rentabilité), sociale (conditions de travail) et environnementale (préservation des sols, de l'eau et de la biodiversité).",
        ctx: "Les GDA et coopératives agricoles accompagnés par Jeun'ESS s'orientent vers des pratiques plus durables, notamment dans les régions semi-arides des gouvernorats d'intervention.",
      },
      {
        term: 'Écotourisme',
        tag: 'Secteur',
        def: "Forme de tourisme responsable dans des zones naturelles qui contribue à la conservation de l'environnement, assure le bien-être des populations locales et implique une démarche d'interprétation et d'éducation.",
        ctx: "L'écotourisme est une filière identifiée dans Irada4Youth pour Tozeur et Kébili, permettant de valoriser le patrimoine naturel saharien tout en créant des emplois pour les jeunes locaux.",
      },
      {
        term: 'Responsabilité sociale des entreprises (RSE)',
        tag: 'Concept',
        def: 'Intégration volontaire par les entreprises de préoccupations sociales et environnementales dans leurs activités commerciales et dans leurs relations avec leurs parties prenantes. Elle va au-delà de la conformité légale pour englober des engagements éthiques et environnementaux.',
        ctx: "La RSE est un concept progressivement introduit dans les formations entrepreneuriales d'EU4Youth, notamment pour les entreprises soutenues dans le cadre de Jeun'ESS.",
      },
      {
        term: 'ODD (Objectifs de Développement Durable)',
        tag: 'Cadre de référence',
        def: "Les 17 objectifs adoptés par l'ONU en 2015 dans le cadre de l'Agenda 2030, visant à éradiquer la pauvreté, protéger la planète et assurer la prospérité pour tous. Ils constituent le cadre de référence universel de la coopération internationale au développement.",
        ctx: 'EU4Youth contribue explicitement à ODD 4 (éducation), ODD 8 (travail décent), ODD 10 (réduction des inégalités) et ODD 16 (paix, justice et institutions efficaces).',
      },
    ],
  },
  {
    id: 'numerique',
    label: 'Numérique, IA et données',
    color: '#185FA5',
    entries: [
      {
        term: 'Transformation numérique',
        tag: 'Concept',
        def: "Processus d'intégration des technologies numériques dans l'ensemble des fonctions d'une organisation ou d'un service public, transformant fondamentalement la façon dont elle opère et délivre de la valeur. Elle ne se réduit pas à la seule informatisation des processus existants.",
        ctx: "GO4Youth accélère la transformation digitale de l'ANETI : services numériques, procédures digitalisées, profilage des demandeurs d'emploi et spécifications de services en déploiement.",
      },
      {
        term: 'Intelligence artificielle (IA)',
        tag: 'Technologie',
        def: "Ensemble de techniques permettant à des machines de simuler certaines fonctions de l'intelligence humaine : reconnaissance de formes, traitement du langage naturel, prise de décision, apprentissage automatique. L'IA générative (capable de produire du texte, des images ou du code) représente la vague la plus récente.",
        ctx: "L'IA ouvre des opportunités pour les jeunes entrepreneurs (automatisation, services numériques) mais pose aussi des défis (emplois automatisables, compétences requises). EU4Youth intègre progressivement cet enjeu dans ses formations.",
      },
      {
        term: 'Apprentissage automatique (machine learning)',
        tag: 'Technologie',
        def: "Sous-domaine de l'IA dans lequel des algorithmes apprennent à partir de données pour améliorer leurs performances sans être explicitement programmés. Il sous-tend des applications comme la détection de fraude, la recommandation de contenu ou le profilage des demandeurs d'emploi.",
        ctx: "Les systèmes de profilage développés dans le cadre de GO4Youth/ANETI visent à améliorer l'orientation et le matching emploi ; le détail algorithmique n'est pas précisé dans la présentation dédiée.",
      },
      {
        term: 'Protection des données personnelles',
        tag: 'Droit',
        def: "Ensemble des règles juridiques qui encadrent la collecte, le traitement, la conservation et la transmission de données à caractère personnel (informations permettant d'identifier directement ou indirectement une personne physique). En Tunisie, la loi n°2004-63 régit cette matière, en cours de révision pour s'aligner sur les standards internationaux.",
        ctx: "Les plateformes numériques développées dans le cadre d'EU4Youth (ANETI, portails de projets) sont soumises aux obligations de protection des données personnelles des bénéficiaires.",
      },
      {
        term: 'RGPD / principes de protection des données',
        tag: 'Cadre réglementaire',
        def: "Le Règlement Général sur la Protection des Données (RGPD) est le cadre européen de référence, applicable à tout traitement de données de citoyens de l'UE. Ses principes fondamentaux — licéité, minimisation, finalité, intégrité, responsabilité — constituent le standard international de référence en matière de protection des données.",
        ctx: "Les partenaires de mise en œuvre d'EU4Youth (CILG-VNG International, Banque mondiale, BIT...) étant des organisations internationales, ils appliquent leurs propres cadres de protection des données en conformité avec les standards internationaux.",
      },
      {
        term: 'Inclusion numérique',
        tag: 'Concept',
        def: "Capacité pour tous les individus et groupes d'accéder aux technologies de l'information et de la communication (TIC) et de les utiliser de manière efficace pour participer à la vie économique, sociale et culturelle. Elle suppose un accès aux équipements, une connectivité et des compétences numériques.",
        ctx: "La fracture numérique s'ajoute aux autres inégalités que EU4Youth cherche à réduire : les jeunes des régions rurales et des ménages défavorisés ont un accès limité aux outils numériques.",
      },
      {
        term: 'Compétences numériques',
        tag: 'Concept',
        def: "Ensemble des aptitudes permettant à un individu d'utiliser les outils numériques de manière efficace, critique et sécurisée : bureautique, navigation web, communication en ligne, sécurité informatique, création de contenu numérique. Le référentiel DigComp (UE) en définit cinq domaines.",
        ctx: "Les formations à l'entrepreneuriat intégrées dans EU4Youth incluent une composante compétences numériques, indispensables pour la gestion et la promotion des projets des jeunes.",
      },
      {
        term: 'Open data',
        tag: 'Concept',
        def: "Principe selon lequel certaines données, notamment celles produites par des organismes publics, doivent être librement accessibles, réutilisables et redistribuables sans restriction. L'open data favorise la transparence, l'innovation et la participation citoyenne.",
        ctx: "Les données produites par EU4Youth (indicateurs de performance, rapports d'activité) sont publiées conformément aux règles de transparence de l'UE, s'inscrivant dans une logique d'open data institutionnel.",
      },
    ],
  },
  {
    id: 'culture',
    label: 'Culture, sport et inclusion',
    color: '#993556',
    entries: [
      {
        term: 'Culture et sport pour le développement',
        tag: 'Approche',
        def: "Reconnaissance du rôle de la pratique culturelle et sportive comme vecteurs d'inclusion sociale, de développement des compétences, de construction identitaire et de cohésion civique. Cette approche, promue par l'UNESCO et l'UE, reconnaît que la culture et le sport ne sont pas des accessoires mais des conditions fondamentales d'épanouissement.",
        ctx: "Maghroum'IN est l'opérateur de cette approche dans EU4Youth, s'appuyant sur la conviction qu'un jeune qui pratique une activité culturelle ou sportive développe des compétences et renforce sa confiance en lui.",
      },
      {
        term: 'Tfanen',
        tag: 'Programme',
        def: "Premier programme de l'Union européenne d'appui à la culture en Tunisie, précurseur de Maghroum'IN pour le volet culturel. Il avait financé plus de 70 actions culturelles à travers des appels à projets réguliers, mobilisant des associations et des jeunes sur l'ensemble du territoire tunisien.",
        ctx: "Programme antérieur de soutien à la culture ; toute continuité avec Maghroum'IN doit être confirmée hors présentation dédiée avant d'être présentée comme un fait contractuel.",
      },
      {
        term: 'Gouvernance du sport',
        tag: 'Concept',
        def: "Ensemble des principes, règles et mécanismes qui régissent le fonctionnement des institutions sportives (fédérations, clubs, structures publiques) : transparence, redevabilité, égalité d'accès, intégrité. Une bonne gouvernance sportive est la condition d'un développement équitable et durable du secteur.",
        ctx: "Maghroum'IN contribue à améliorer la gouvernance du secteur sportif tunisien, identifié comme souffrant de dysfonctionnements limitant l'accès des jeunes vulnérables à la pratique.",
      },
      {
        term: 'Sport alternatif',
        tag: 'Concept',
        def: "Pratiques sportives en dehors des disciplines classiques institutionnalisées et fédérées. Le sport alternatif inclut les sports urbains (skateboard, parkour, BMX), les sports de nature (randonnée, escalade), les arts martiaux traditionnels et les jeux traditionnels. Il est souvent plus accessible que le sport fédéré en termes d'équipements et de coûts.",
        ctx: "Maghroum'IN explore des activités sportives alternatives comme leviers d'inclusion pour des jeunes peu attirés par le sport fédéré classique, notamment dans les zones péri-urbaines et rurales.",
      },
      {
        term: 'Jeux traditionnels',
        tag: 'Culture',
        def: "Pratiques ludiques et sportives transmises culturellement au sein d'une communauté, reflétant son histoire et ses valeurs. En Tunisie, les jeux traditionnels constituent un patrimoine culturel immatériel et un outil d'inclusion pour les jeunes de toutes origines.",
        ctx: "La valorisation des jeux traditionnels s'inscrit dans la logique de Maghroum'IN de valoriser la culture locale comme vecteur d'inclusion et de cohésion sociale.",
      },
      {
        term: 'Médiation culturelle',
        tag: 'Métier',
        def: 'Activité professionnelle visant à faciliter la rencontre entre des publics (notamment éloignés de la culture institutionnelle) et des œuvres, pratiques ou lieux culturels. Le médiateur culturel traduit, explique, anime et crée des passerelles entre la création artistique et la vie quotidienne des citoyens.',
        ctx: "Maghroum'IN contribue à professionnaliser les métiers de la médiation culturelle, identifiés comme filière d'employabilité pour les jeunes dans les secteurs culturels tunisiens.",
      },
      {
        term: 'Industries culturelles et créatives (ICC)',
        tag: 'Secteur',
        def: "Secteurs économiques qui produisent des biens et services à fort contenu symbolique et créatif : musique, cinéma, arts de la scène, design, jeux vidéo, mode, architecture, artisanat d'art. Les ICC représentent des filières d'emplois à haute valeur ajoutée pour les jeunes.",
        ctx: "Maghroum'IN soutient le développement des ICC en Tunisie comme filières d'employabilité, en articulant formation, accès aux espaces de création et connexion aux marchés.",
      },
      {
        term: 'Maison des Jeunes',
        tag: 'Structure',
        def: "Structure publique sous tutelle du Ministère des Affaires de la Jeunesse et des Sports, implantée au niveau local pour offrir des activités culturelles, sportives et éducatives aux jeunes. La Tunisie dispose d'un réseau étendu de Maisons des Jeunes, réparties sur l'ensemble du territoire.",
        ctx: "EU4Youth cherche à renforcer l'attractivité et l'accessibilité des Maisons des Jeunes et à mieux les articuler avec les acteurs associatifs et économiques locaux.",
      },
      {
        term: 'Maison de la Culture',
        tag: 'Structure',
        def: "Structure publique sous tutelle du Ministère des Affaires Culturelles, dédiée à la diffusion et à la pratique artistique et culturelle. Elle constitue un point d'ancrage pour les activités culturelles de Maghroum'IN dans les zones d'intervention.",
        ctx: "Comme les Maisons des Jeunes, les Maisons de la Culture souffrent souvent d'une sous-utilisation chronique. Maghroum'IN cherche à revitaliser ces espaces par des programmes innovants.",
      },
    ],
  },
  {
    id: 'gouvernance',
    label: 'Gouvernance et politiques publiques',
    color: '#993C1D',
    entries: [
      {
        term: 'Gouvernance locale',
        tag: 'Concept',
        def: 'Capacité des collectivités territoriales à gérer les affaires publiques de manière efficace, transparente et participative. Elle inclut la planification des investissements, la gestion des services publics, la consultation des citoyens et la coordination avec les acteurs locaux.',
        ctx: "Fe3il.a et Maghroum'IN contribuent tous deux au renforcement de la gouvernance locale en appuyant les communes et les acteurs culturels/sportifs locaux.",
      },
      {
        term: 'Décentralisation',
        tag: 'Réforme',
        def: 'Transfert de compétences, de ressources et de responsabilités du niveau central vers les collectivités locales. En Tunisie, le Code des Collectivités Locales de 2018 a élargi significativement les prérogatives des communes, qui sont désormais responsables de politiques locales relevant auparavant du gouvernement central.',
        ctx: "EU4Youth accompagne les communes dans l'exercice de leurs nouvelles compétences décentralisées, notamment en matière de politiques de jeunesse et d'investissement local.",
      },
      {
        term: 'Politique publique jeunesse',
        tag: 'Concept',
        def: "Ensemble des orientations, programmes et dispositifs mis en œuvre par les pouvoirs publics pour répondre aux besoins et aspirations des jeunes citoyens, dans les domaines de l'emploi, de la formation, de la culture, du sport et de la participation civique. Elle implique plusieurs ministères et niveaux de gouvernement.",
        ctx: "Fe3il.a appuie le MJS dans l'élaboration d'une politique nationale jeunesse cohérente et intégrée, articulant les niveaux local et national.",
      },
      {
        term: 'Cadre de concertation interministériel',
        tag: 'Mécanisme EU4Youth',
        def: "Mécanisme de gouvernance d'EU4Youth réunissant les représentants des ministères concernés, de l'ONJ, des agences partenaires, de la DUE et des chefs d'équipe des projets. Présidé par le MEP, il assure le suivi et la coordination du programme au niveau national.",
        ctx: "Ce mécanisme constitue un espace de dialogue institutionnel inédit en Tunisie pour coordonner les interventions de plusieurs ministères autour d'une politique jeunesse commune.",
      },
      {
        term: "Plan d'investissement annuel (PIA)",
        tag: 'Outil',
        def: "Document de planification budgétaire élaboré par chaque commune tunisienne pour programmer ses dépenses d'investissement sur l'année à venir. Il constitue le principal outil de planification financière des collectivités locales.",
        ctx: 'Fe3il.a accompagne des communes à intégrer des actions en faveur de la jeunesse dans leurs PIA, garantissant une mobilisation de ressources publiques locales en complément du financement européen.',
      },
      {
        term: 'Stratégie locale jeunesse',
        tag: 'Outil',
        def: "Document de planification élaboré par une commune définissant ses priorités et actions en faveur des jeunes, en concertation avec les acteurs locaux (associations, clubs, écoles). Elle traduit l'engagement de la commune envers sa jeunesse en objectifs et activités concrètes.",
        ctx: 'Fe3il.a accompagne plusieurs communes tunisiennes dans le développement de telles stratégies, qui constituent un instrument de gouvernance locale innovant en Tunisie.',
      },
      {
        term: 'Coordination interministérielle',
        tag: 'Concept',
        def: "Travail de mise en cohérence entre les actions de différents ministères agissant sur un même domaine ou une même population cible. Pour les politiques de jeunesse, elle est indispensable car la jeunesse relève simultanément de l'emploi, de la culture, de l'éducation, du sport et des affaires locales.",
        ctx: 'EU4Youth est lui-même un instrument de coordination interministérielle : son cadre de concertation réunit régulièrement les représentants de six ministères.',
      },
      {
        term: 'Redevabilité (accountability)',
        tag: 'Concept',
        def: "Obligation pour les acteurs (gouvernements, organisations, individus) de rendre compte de leurs actions, décisions et performances à ceux qu'ils servent. La redevabilité implique transparence, explication des choix et acceptation des conséquences en cas de manquements.",
        ctx: 'EU4Youth renforce la redevabilité des communes envers leurs citoyens (notamment les jeunes) à travers les processus participatifs soutenus par Fe3il.a.',
      },
    ],
  },
  {
    id: 'participation',
    label: 'Participation et inclusion des jeunes',
    color: '#7F77DD',
    entries: [
      {
        term: 'Participation des jeunes',
        tag: 'Concept',
        def: 'Implication active des jeunes dans les processus de décision qui les concernent : conception de programmes, gouvernance locale, élaboration de politiques. La participation va au-delà de la simple consultation — elle implique que les jeunes soient reconnus comme acteurs à part entière, que leurs contributions orientent réellement les décisions.',
        ctx: 'EU4Youth fait de la participation un principe structurant : les jeunes ne sont pas des bénéficiaires passifs mais des co-constructeurs des interventions qui les concernent.',
      },
      {
        term: 'Inclusion sociale',
        tag: 'Concept',
        def: "Processus par lequel des individus ou groupes marginalisés accèdent progressivement aux ressources, droits et opportunités de la société, et participent pleinement à la vie sociale, économique et culturelle. Elle s'oppose à l'exclusion et à la marginalisation.",
        ctx: "EU4Youth adopte une vision élargie de l'inclusion, dépassant la seule insertion économique pour englober la participation civique, l'accès à la culture et l'inclusion territoriale.",
      },
      {
        term: 'Jeune vulnérable',
        tag: 'Profil cible',
        def: "Jeune qui cumule plusieurs facteurs d'exclusion ou de fragilité : chômage, statut NEET, résidence dans une région défavorisée, situation de handicap, appartenance à un ménage à faibles revenus, faible niveau de qualification. Cette notion reconnaît que les vulnérabilités se cumulent et se renforcent mutuellement.",
        ctx: 'EU4Youth cible prioritairement les jeunes vulnérables, reconnaissant que les interventions universelles ne suffisent pas à atteindre les plus exclus.',
      },
      {
        term: 'Forum des jeunes',
        tag: 'Mécanisme',
        def: "Espace de rencontre, d'expression et de délibération organisé pour permettre aux jeunes de formuler des propositions, d'échanger avec des décideurs et de contribuer à des processus de planification. Le forum est un outil de démocratie participative adapté aux jeunes.",
        ctx: "Fe3il.a a développé un mécanisme de Forum des Jeunes comme outil de participation citoyenne au niveau communal, permettant aux jeunes d'influencer les plans d'investissement locaux.",
      },
      {
        term: 'Consultation participative',
        tag: 'Méthode',
        def: 'Processus structuré invitant des citoyens ou des parties prenantes à exprimer leurs besoins, aspirations et idées sur des questions qui les concernent, pour alimenter la conception de programmes ou de politiques. Elle se distingue de la simple information (sens unique) et de la co-décision.',
        ctx: "Fe3il.a organise des consultations participatives dans les communes partenaires, sous forme d'ateliers thématiques et de groupes de travail incluant les jeunes.",
      },
      {
        term: 'Empowerment (autonomisation)',
        tag: 'Concept',
        def: "Processus par lequel des individus ou des groupes développent les capacités, la confiance et les ressources pour prendre le contrôle de leur vie et exercer un pouvoir sur les décisions qui les affectent. L'autonomisation est à la fois un moyen et un objectif du développement.",
        ctx: "L'autonomisation des jeunes est au cœur de la philosophie d'EU4Youth : le programme ne se construit pas sur une logique d'assistanat mais d'investissement dans les capacités des jeunes.",
      },
      {
        term: 'Représentativité des jeunes',
        tag: 'Concept',
        def: 'Présence effective des jeunes dans les instances de décision (comités de pilotage, conseils communaux, groupes de travail) de manière significative, et pas seulement symbolique. La représentativité suppose des mécanismes formels garantissant que la voix des jeunes influence réellement les décisions.',
        ctx: 'EU4Youth considère la représentativité des jeunes non seulement comme un objectif en soi, mais comme une condition de la qualité et de la légitimité des politiques publiques.',
      },
      {
        term: 'Inclusion des personnes en situation de handicap',
        tag: 'Concept',
        def: "Ensemble des démarches visant à garantir que les personnes vivant avec un handicap (physique, sensoriel, cognitif, psychique) bénéficient des mêmes droits, opportunités et services que les autres citoyens. Elle suppose l'adaptation des espaces, des outils et des programmes.",
        ctx: "EU4Youth inclut explicitement les jeunes porteurs de handicap parmi ses publics prioritaires et a conduit une étude nationale sur leur inclusion comme condition d'une action adaptée.",
      },
    ],
  },
  {
    id: 'acteurs',
    label: 'Acteurs institutionnels',
    color: '#5F5E5A',
    entries: [
      {
        term: 'CILG-VNG International',
        tag: 'Partenaire',
        def: "Centre International de Développement pour la Gouvernance Locale Innovante, émanation de l'Association des Municipalités Néerlandaises (VNG). Spécialisé dans la gouvernance locale, la décentralisation et le développement municipal dans les pays partenaires de l'UE. Partenaire de mise en œuvre de Fe3il.a.",
        ctx: "CILG-VNG International apporte dans Fe3il.a son expertise en matière d'appui aux communes et de processus participatifs de gouvernance locale.",
      },
      {
        term: 'BIT / OIT',
        tag: 'Partenaire',
        def: "Bureau International du Travail, branche exécutive de l'Organisation Internationale du Travail (OIT). Institution tripartite des Nations Unies (gouvernements, employeurs, travailleurs) dont le mandat est la promotion du travail décent, des droits au travail et de la protection sociale. Partenaire de mise en œuvre de Jeun'ESS.",
        ctx: '',
      },
      {
        term: 'CGDR',
        tag: 'Institution tunisienne',
        def: "Commissariat Général au Développement Régional. Institution tunisienne chargée de la coordination et de la planification du développement régional, placée sous tutelle du Ministère de l'Économie. Partenaire de mise en œuvre d'Irada4Youth.",
        ctx: "Le CGDR gère directement IRADA4YOUTH et assure le suivi technique et réglementaire des appels à propositions régionaux.",
      },
      {
        term: 'ODR',
        tag: 'Institution tunisienne',
        def: 'Office de Développement Régional. Structure publique tunisienne déployée au niveau régional pour coordonner et appuyer les initiatives de développement économique local. Les ODRs partenaires d’IRADA4YOUTH sont l’ODNO, l’ODCO et l’ODS.',
        ctx: "IRADA4YOUTH est géré directement par le CGDR, en partenariat avec ces offices régionaux.",
      },
      {
        term: 'ANETI',
        tag: 'Institution tunisienne',
        def: "Agence Nationale pour l'Emploi et le Travail Indépendant. Agence publique tunisienne gérant le réseau des Bureaux de l'Emploi et du Travail Indépendant (BETI). Elle est le principal opérateur public d'intermédiation sur le marché du travail. Partenaire central de GO4Youth.",
        ctx: "GO4Youth modernise les services ANETI aux chercheurs d'emploi et aux entreprises, accélère la transformation digitale et renforce l'écosystème d'employabilité.",
      },
      {
        term: 'ANPR',
        tag: 'Institution tunisienne',
        def: "Agence Nationale de Promotion de la Recherche. Établissement public tunisien chargé de financer et de promouvoir la recherche scientifique et l'innovation. Partenaire de mise en œuvre de SWAFY.",
        ctx: "L'ANPR gère notamment le programme MOBIDOC de bourses doctorales et post-doctorales, central dans SWAFY.",
      },
      {
        term: 'ONJ',
        tag: 'Institution tunisienne',
        def: "Observatoire National de la Jeunesse. Structure publique chargée de la collecte, de l'analyse et de la diffusion de données sur la situation de la jeunesse en Tunisie. Il contribue à EU4Youth en assurant le suivi des politiques jeunesse et en animant le Groupe Jeunesse.",
        ctx: "L'ONJ joue un rôle essentiel dans la production de connaissances sur la jeunesse tunisienne, alimentant les décisions politiques du programme.",
      },
      {
        term: 'MEP',
        tag: 'Institution tunisienne',
        def: "Ministère de l'Économie et de la Planification. Préside le Cadre de concertation interministériel d'EU4Youth, témoignant de l'ancrage du programme dans les priorités de développement économique du pays.",
        ctx: '',
      },
      {
        term: 'MJS',
        tag: 'Institution tunisienne',
        def: "Ministère des Affaires de la Jeunesse et des Sports. Partenaire central d'EU4Youth sur l'ensemble des composantes, et partenaire direct de Fe3il.a pour la coordination nationale des politiques jeunesse.",
        ctx: '',
      },
      {
        term: 'AECID',
        tag: 'Partenaire',
        def: "Agence Espagnole pour la Coopération Internationale au Développement. Membre du réseau EUNIC, co-délégataire principal du consortium de mise en œuvre de Maghroum'IN.",
        ctx: '',
      },
      {
        term: 'EUNIC',
        tag: 'Réseau',
        def: "Réseau des Instituts Culturels Nationaux de l'Union Européenne, regroupant les agences culturelles officielles des États membres. Le consortium AECID-British Council-FIIAPP constitue le groupement EUNIC qui met en œuvre Maghroum'IN.",
        ctx: '',
      },
    ],
  },
  {
    id: 'financement',
    label: 'Financement et gestion de projet',
    color: '#D85A30',
    entries: [
      {
        term: 'Appel à propositions (AAP)',
        tag: 'Mécanisme',
        def: "Mécanisme de mise en compétition ouverte permettant à des organisations de soumettre des projets susceptibles de recevoir un financement. Les AAP définissent des critères d'éligibilité, de sélection et d'attribution précis. Ils constituent le mode de distribution de fonds le plus courant dans la coopération internationale.",
        ctx: "Plusieurs projets EU4Youth (Fe3il.a, Irada4Youth, Maghroum'IN) utilisent des AAP pour distribuer des financements à des porteurs de projets de la société civile et du secteur privé.",
      },
      {
        term: 'Subvention',
        tag: 'Instrument financier',
        def: "Transfert financier à caractère non remboursable accordé à une organisation pour la mise en œuvre d'un projet ou d'une action spécifique, sous conditions d'éligibilité et de justification de l'utilisation des fonds. La subvention se distingue du prêt (remboursable) et de l'investissement en capital.",
        ctx: 'EU4Youth fonctionne intégralement sur un mode subventionnel : la Commission européenne subventionne les partenaires de mise en œuvre, qui subventionnent à leur tour les porteurs de microprojets.',
      },
      {
        term: "Reporting / rapport d'activité",
        tag: 'Outil de gestion',
        def: "Document produit régulièrement par un porteur de projet pour rendre compte à son bailleur de l'avancement des activités, des résultats atteints et de l'utilisation des fonds. Il constitue le principal outil de redevabilité dans la gestion de projets de coopération.",
        ctx: "Les partenaires de mise en œuvre d'EU4Youth produisent des rapports d'activité semestriels et annuels à destination de la DUE, selon des modèles standardisés.",
      },
      {
        term: 'Décaissement',
        tag: 'Gestion financière',
        def: "Versement effectif de fonds par un bailleur à un bénéficiaire, généralement conditionné à la justification des dépenses passées et à l'atteinte de jalons prédéfinis. Le calendrier de décaissement est défini dans la convention de financement.",
        ctx: '',
      },
      {
        term: 'Audit',
        tag: 'Contrôle',
        def: "Examen indépendant et systématique des comptes, des procédures et des activités d'une organisation ou d'un projet, visant à vérifier la conformité des dépenses avec les règles financières et la réalité des activités rapportées.",
        ctx: "Les projets EU4Youth font l'objet d'audits financiers réguliers, conformément aux exigences de la Commission européenne en matière de gestion des fonds extérieurs.",
      },
      {
        term: 'Visibilité (règles de visibilité UE)',
        tag: 'Communication',
        def: "Ensemble des obligations contractuelles imposées aux projets financés par l'UE pour assurer la reconnaissance publique du financement européen : utilisation des logos UE, mentions sur les supports de communication, événements de lancement. La visibilité est une condition de transparence et de redevabilité publique.",
        ctx: "EU4Youth dispose d'une charte graphique commune et de règles de visibilité détaillées que tous les projets sont tenus de respecter dans leurs communications.",
      },
      {
        term: 'Gestion axée sur les résultats (GAR)',
        tag: 'Méthode',
        def: "Approche de management qui structure la planification, le suivi et la redevabilité autour des résultats attendus plutôt que des activités réalisées. Elle déplace le focus de la gestion de « ce qu'on fait » vers « ce qu'on change ».",
        ctx: "EU4Youth applique la GAR à l'ensemble de son architecture : chaque projet définit des résultats mesurables et rend compte de leur atteinte dans ses rapports.",
      },
    ],
  },
]
