/**
 * Push Programme EU4Youth + UE en Tunisie Word copy into the local CMS store.
 * Run: node tools/push-word-content.mjs
 */
const API = process.env.CMS_API || 'http://localhost:8040/api'

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eu4youth.org', password: 'eu4youth' }),
  })
  if (!res.ok) throw new Error(`login ${res.status}`)
  const data = await res.json()
  return data.token
}

function block(page, section, key, value, type = 'text') {
  return { page, section, key, locale: 'fr', type, value }
}

const HERO_BODY =
  "EU4Youth est le principal programme de l'Union européenne d’appui à la jeunesse tunisienne. Depuis 2019, il réunit six projets complémentaires qui agissent ensemble pour renforcer les opportunités d'emploi, d'entrepreneuriat, de culture, de sport, de science et de participation citoyenne des jeunes de 18 à 35 ans, dans toutes les régions du pays.\n\nEU4Youth s'inscrit dans une dynamique de coopération entre l'Union européenne, les institutions tunisiennes et les acteurs des territoires pour que chaque jeune, où qu'il se trouve, puisse accéder aux ressources, aux soutiens et aux opportunités."

const POURQUOI_BODY = [
  'La Tunisie est un pays jeune. Les moins de 35 ans représentent plus de la moitié de la population. Cette réalité démographique porte en elle une énergie créatrice, une force d’innovation et un désir de contribution que les communautés et le pays tout entier ont intérêt à valoriser.',
  'Les jeunes Tunisiennes et Tunisiens expriment des aspirations fortes en matière d’emploi, de participation, de mobilité, de culture et d’engagement. Leurs initiatives, leurs projets, leurs idées circulent dans les quartiers, les universités, les associations et les communes. Ils représentent une ressource essentielle pour le développement économique, social et territorial.',
  'Pourtant, tous n’ont pas accès aux mêmes possibilités. Les territoires connaissent des dynamiques diverses : là où une région dispose d’un bassin d’emploi dense et d’infrastructures accessibles, une région peut présenter un éloignement des centres de formation, un accès limité aux marchés ou d’une moindre présence d’espaces culturels et sportifs. Ces disparités sont réelles et se vivent différemment selon que l’on grandit à Tunis ou à Kébili, à Sfax ou à Jendouba.',
  'Sur le marché du travail, les transitions entre la formation et l’emploi restent un défi pour de nombreux jeunes, en particulier pour celles et ceux qui portent plusieurs facteurs de vulnérabilité cumulés : chômage, précarité, distance géographique, écart entre compétences et besoins des employeurs. Les jeunes femmes, les habitants des zones rurales, les porteurs de handicap font face à des obstacles spécifiques qui demandent des réponses adaptées.',
  'En matière de culture, de sport et de participation civique, les opportunités existent; les maisons de la culture, les clubs sportifs, les associations, les structures communales sont autant de lieux d’apprentissage, de rencontre et d’expression. Mais ces espaces ont besoin d’être renforcés, accessibles à tous, en lien avec les communes et les acteurs de terrain.',
  'C’est dans cette réalité complexe, vivante et riche de potentiels que s’inscrit EU4Youth comme un investissement dans les capacités de toute une jeunesse et dans les territoires qui la portent.',
].join('\n\n')

const PRINCIPLES = [
  'Créer des opportunités réelles de développement personnel et professionnel pour les jeunes, là où ils vivent.',
  'Prioriser celles et ceux qui font face aux obstacles les plus importants : éloignement géographique, précarité, chômage, discrimination.',
  'Associer les jeunes à la conception et à la mise en oeuvre des activités qui les concernent pas seulement comme bénéficiaires, mais comme acteurs.',
  'Ancrer les interventions dans les territoires, au niveau des communes, des gouvernorats et des écosystèmes locaux.',
  'Construire des mécanismes durables de représentation et de participation des jeunes dans la vie citoyenne et l’action publique.',
  'Capitaliser sur les expériences passées et les dynamiques déjà engagées, pour construire sur ce qui fonctionne.',
  'Coordonner les six projets entre eux et avec les autres programmes européens en Tunisie pour produire un impact cohérent et démultiplié.',
].map((text) => ({ text }))

const OBJECTIFS = [
  {
    kicker: '',
    title: 'OBJECTIF GÉNÉRAL',
    body: "Contribuer à l'amélioration de l'inclusion économique, sociale et citoyenne des jeunes Tunisiennes et Tunisiens, à travers une approche ancrée dans les territoires et dans les dynamiques locales.",
  },
  {
    kicker: 'OBJECTIF SPÉCIFIQUE 1',
    title: 'EMPLOI, EMPLOYABILITÉ ET ENTREPRENEURIAT',
    body: "Renforcer l'accès des jeunes à des emplois décents, développer leurs compétences et leurs capacités entrepreneuriales, soutenir les filières économiques porteuses dans les régions ciblées.\n\nCela passe par le soutien à l'économie sociale et solidaire, la modernisation des services publics d'intermédiation sur le marché du travail, l'appui à la recherche et à la créativité des jeunes chercheurs, et le financement de projets économiques dans des filières identifiées localement.",
  },
  {
    kicker: 'OBJECTIF SPÉCIFIQUE 2',
    title: "CULTURE ET SPORT POUR L'INCLUSION",
    body: "Renforcer l'inclusion et la participation des jeunes à travers l'accès à la culture et au sport, en renforçant les capacités des opérateurs culturels et sportifs, en améliorant les espaces de pratique et en développant l'employabilité dans ces secteurs.\n\nLa culture et le sport ne sont pas des accessoires dans la vie d'un jeune; ils en sont des conditions fondamentales d'épanouissement, de confiance en soi et d'appartenance sociale.",
  },
  {
    kicker: 'OBJECTIF SPÉCIFIQUE 3',
    title: 'POLITIQUES PUBLIQUES ET PARTICIPATION DES JEUNES',
    body: 'Renforcer la place des jeunes dans la conception et la mise en œuvre des politiques publiques, au niveau local comme au niveau national.\n\nLes politiques en faveur de la jeunesse ne peuvent être efficaces que si les jeunes eux-mêmes y participent. EU4Youth travaille avec les communes tunisiennes et le Ministère de la Jeunesse et des Sports pour créer des espaces réels de consultation, de représentation et de participation.',
  },
]

const COMMENT_ITEMS = [
  {
    kicker: 'AXE 1',
    title: 'EMPLOI ET OPPORTUNITÉS ÉCONOMIQUES',
    body: "Le programme renforce l'accès des jeunes aux opportunités économiques, qu'il s'agisse de création d'entreprises, d'accès à l'emploi salarié ou de développement de projets dans des filières porteuses. Il agit sur plusieurs leviers complémentaires : le soutien à l'entrepreneuriat social et collectif, la modernisation des services d'orientation et d'intermédiation sur le marché du travail, la promotion de la recherche et de la créativité comme chemins vers l'emploi, et le financement de projets économiques ancrés dans les territoires.",
  },
  {
    kicker: 'AXE 2',
    title: 'CULTURE, SPORT ET PARTICIPATION',
    body: "EU4Youth considère la culture et le sport comme des leviers d'inclusion à part entière. Le programme renforce les opérateurs culturels et sportifs, améliore l'accès des jeunes en situation de vulnérabilité aux pratiques créatives et sportives, et développe l'employabilité dans ces secteurs. En parallèle, il crée les conditions d'une participation citoyenne authentique des jeunes — au niveau de leurs communes, de leurs associations, et des politiques publiques qui les concernent.",
  },
  {
    kicker: 'AXE 3',
    title: 'INNOVATION, RECHERCHE ET DÉVELOPPEMENT TERRITORIAL',
    body: "Le programme investit dans la recherche et l'innovation comme ressources pour l'emploi des jeunes chercheurs et pour le développement de la société. Il appuie également une logique de développement territorial fondée sur l'émergence d'écosystèmes locaux dynamiques — des réseaux d'acteurs qui se connaissent, coopèrent et créent ensemble des opportunités pour les jeunes de leurs régions. Cette logique territoriale est au coeur de la conception d'EU4Youth, de sa sélection des zones d'intervention à ses modalités de mise en oeuvre.",
  },
]

const IMPACT_ITEMS = [
  { value: '6', label: 'PROJETS\nCOMPLÉMENTAIRES', note: '3 composantes thématiques', featured: '0' },
  { value: '24', label: 'GOUVERNORATS', note: 'Présence nationale', featured: '0' },
  { value: '2019–2027', label: 'DURÉE DU PROGRAMME', note: 'Convention signée juin 2019', featured: '0' },
  { value: '+ 300', label: 'PROJETS PORTÉS\nPAR DES JEUNES', note: 'Économiques, culturels, sociaux, scientifiques', featured: '1' },
  { value: '+ 100', label: 'INITIATIVES\nASSOCIATIVES', note: 'Soutenues dans toutes les régions', featured: '0' },
  { value: '+ 300', label: 'CLUBS CRÉÉS\nOU APPUYÉS', note: 'ESS, scientifiques, culturels, sportifs', featured: '0' },
  { value: '6+', label: 'MINISTÈRES\nPARTENAIRES', note: 'Pilotage interministériel', featured: '0' },
]

const IMPACT_PENDING = [
  { value: '—', label: 'Jeunes accompagnés' },
  { value: '—', label: 'dont femmes' },
  { value: '—', label: 'Emplois créés ou consolidés' },
  { value: '—', label: 'Communes mobilisées' },
  { value: '—', label: 'Bénéficiaires directs' },
  { value: '—', label: 'Jeunes en vulnérabilité' },
  { value: '—', label: 'Organisations appuyées' },
  { value: '—', label: 'Doctorants soutenus' },
]

const FICHES = [
  {
    slug: 'jeuness',
    name: "JEUN'ESS",
    tagline: 'ÉCONOMIE SOCIALE ET SOLIDAIRE',
    quote:
      "L'économie sociale et solidaire, un levier pour l'emploi décent des jeunes tunisiens.",
    summary:
      "Jeun'ESS soutient la création et le développement d'entreprises d'économie sociale et solidaire portées par des jeunes dans sept gouvernorats prioritaires de l'intérieur. Le projet mobilise trois mécanismes complémentaires : un fonds de résilience pour les organisations existantes, un fonds d'innovation sociale pour les nouvelles initiatives, et un fonds marché pour l'accès à de nouveaux débouchés nationaux et internationaux. Des clubs ESS sont également créés au sein des structures locales de jeunesse, pour développer la culture entrepreneuriale collective.",
    theme: 'jeuness',
    composante: 'Emploi, employabilité et entrepreneuriat',
    budget: '',
    partner: 'Bureau International du Travail (OIT)',
    territory:
      '7 gouvernorats : Jendouba, Le Kef, Kasserine, Sidi Bouzid, Kairouan, Gabès, Médenine',
    period: '2021 – 2027',
  },
  {
    slug: 'go4youth',
    name: 'GO4YOUTH',
    tagline: 'GATES FOR OPPORTUNITIES',
    quote:
      "Des portes d'accès à l'emploi, modernisées et ouvertes à tous les jeunes, partout en Tunisie.",
    summary:
      "Go4Youth transforme le modèle de service de l'ANETI (Agence Nationale pour l'Emploi et le Travail Indépendant), qui gère un réseau de 125 bureaux sur l'ensemble du territoire tunisien. Le projet déploie de nouveaux outils de profilage et de mise en relation, digitalise les services, et renforce l'écosystème privé d'intermédiation. L'objectif : que chaque jeune demandeur d'emploi, quel que soit son gouvernorat, puisse accéder à des services modernes, efficaces et adaptés à son profil.",
    theme: 'go4youth',
    composante: 'Emploi, employabilité et entrepreneuriat',
    budget: '',
    partner: 'Banque mondiale / ANETI',
    territory: 'National — 125 bureaux ANETI',
    period: 'Août 2021 – Juin 2027',
  },
  {
    slug: 'swafy',
    name: 'SWAFY',
    tagline: 'SCIENCE WITH AND FOR YOUTH',
    quote: 'La recherche et les sciences, comme chemins vers l’emploi et vers l’avenir.',
    summary:
      'SWAFY propose un modèle original qui relie promotion des sciences auprès des jeunes, soutien à la recherche partenariale et valorisation des compétences des jeunes chercheurs. Le projet finance 235 bourses doctorales et postdoctorales en milieu socio-économique, crée et appuie des clubs scientifiques dans les lycées, universités et maisons des jeunes, et organise un Dialogue National Jeunesse et Science. Il contribue également à l’élaboration d’une feuille de route nationale de promotion des sciences à l’horizon 2035.',
    theme: 'swafy',
    composante: 'Emploi, employabilité et entrepreneuriat',
    budget: '',
    partner: 'Agence Nationale de Promotion de la Recherche (ANPR)',
    territory: 'National',
    period: '2022 – 2027',
  },
  {
    slug: 'irada4youth',
    name: 'IRADA4YOUTH',
    tagline: 'FILIÈRES ÉCONOMIQUES RÉGIONALES',
    quote:
      "Des filières économiques régionales comme leviers d'emploi pour les jeunes des territoires.",
    summary:
      "Irada4Youth finance des projets économiques créateurs d'emploi dans des filières porteuses identifiées localement, dans six gouvernorats de l'intérieur. Le financement transite par des appels à propositions régionaux ciblés. Le CGDR et les Offices de Développement Régional assurent un rôle de pivot territorial — coordination, accompagnement des porteurs de projets, suivi de mise en oeuvre — en lien direct avec les acteurs de terrain.",
    theme: 'irada4youth',
    composante: 'Emploi, employabilité et entrepreneuriat',
    budget: '',
    partner: 'CGDR + Offices de Développement Régional',
    territory: 'Zaghouan · Mahdia · Le Kef · Kairouan · Tozeur · Kébili',
    period: '2022 – 2027',
  },
  {
    slug: 'maghroumin',
    name: "MAGHROUM'IN",
    tagline: 'CULTURE ET SPORT',
    quote: "Maghroum'IN — l'aspiration, le désir, l'envie de faire.",
    summary:
      "Maghroum'IN est la première intervention sectorielle de l'Union européenne dans le domaine du sport en Tunisie, et s'inscrit dans la continuité des actions culturelles initiées dans le cadre du programme Tfanen. Le projet renforce les capacités des opérateurs culturels, artistiques et sportifs, améliore l'accès des jeunes en situation de vulnérabilité aux pratiques créatives et sportives, et développe l'employabilité dans ces secteurs. Il s'appuie sur un ancrage territorial fort, en lien direct avec les collectivités locales et les associations de terrain.",
    theme: 'maghroumin',
    composante: "Culture et sport pour l'inclusion des jeunes",
    budget: '',
    partner:
      'Consortium EUNIC : AECID (Espagne) · FIIAPP (Espagne) · British Council (Royaume-Uni)',
    territory: 'National avec ancrage territorial renforcé',
    period: 'Janvier 2022 – 2027',
  },
  {
    slug: 'fe3ila',
    name: 'FE3IL.A',
    tagline: 'IL OU ELLE AGIT',
    quote: 'Fe3il.a — avec et pour les jeunes.',
    summary:
      "Fe3il.a place les jeunes au cœur des politiques publiques locales et nationales. Le projet accompagne les communes tunisiennes dans le développement de stratégies jeunesse participatives — consultations des jeunes, ateliers de planification, processus de concertation avec la société civile. Au niveau national, il appuie le Ministère de la Jeunesse et des Sports dans son travail de coordination interministérielle. Un appel à projets d'un million d'euros soutient directement les organisations de la société civile travaillant avec les jeunes.",
    theme: 'fe3ila',
    composante: 'Politiques publiques pour la jeunesse',
    budget: "9 millions d'euros",
    partner: 'CILG-VNG International (Pays-Bas)',
    territory: 'National — communes partenaires et niveau ministériel',
    period: 'Juin 2021 – 2026',
  },
]

const PARTNER_TABS = [
  {
    line1: "L'UNION",
    line2: 'EUROPÉENNE',
    body:
      "EU4Youth Tunisie est financé par l'Union européenne. La Délégation de l'Union européenne en Tunisie assure la supervision stratégique de l'ensemble des six projets, veille à la cohérence du programme et constitue l’interlocuteur institutionnel de référence auprès des autorités tunisiennes. Ce programme s'inscrit dans le cadre du Partenariat UE-Tunisie pour la Jeunesse, annoncé conjointement en décembre 2016, et traduit l'engagement de l'Union européenne à placer la jeunesse au cœur de sa relation de coopération avec la Tunisie.",
  },
  {
    line1: 'LES INSTITUTIONS',
    line2: 'TUNISIENNES',
    body:
      'Les ministères et institutions tunisiennes sont des partenaires centraux du programme. Ils président les cadres de concertation, accompagnent la mise en oeuvre et portent l’appropriation institutionnelle des acquis. Leur engagement est le gage de la durabilité des résultats produits.',
  },
  {
    line1: 'LES PARTENAIRES',
    line2: 'DE MISE EN OEUVRE',
    body:
      'Les organisations internationales partenaires assurent la mise en œuvre des six projets. Leur expertise sectorielle et leur expérience dans la coopération internationale garantissent la qualité des interventions.',
  },
]

const AVENIR_ITEMS = [
  {
    kicker: '',
    title: 'DES ACQUIS SOLIDES',
    body:
      'Le programme a construit des bases durables : une architecture de gouvernance interministérielle qui réunit, dans un cadre formel et régulier, les ministères et les partenaires autour des enjeux de la jeunesse. Des capacités renforcées dans des dizaines d’organisations, d’institutions, de communes et d’associations. Des espaces de participation des jeunes qui peuvent devenir permanents dans les communes, dans les comités de pilotage, dans les processus de consultation.',
  },
  {
    kicker: '',
    title: 'DES CONNAISSANCES PARTAGÉES',
    body:
      'EU4Youth a investi dans la production de connaissances utiles. Cartographie des programmes dédiés à la jeunesse en Tunisie, études sur les mécanismes de participation des jeunes, analyses sectorielles sur la culture, le sport et l’emploi, études sur les vulnérabilités spécifiques de certains groupes. Ces connaissances sont mises à disposition librement, accessibles à tous les acteurs qui travaillent avec les jeunes.',
  },
  {
    kicker: '',
    title: 'DES RÉSEAUX VIVANTS',
    body:
      'EU4Youth a permis à des acteurs qui ne se connaissaient pas de se rencontrer, de coopérer et de construire ensemble. Les réseaux constitués entre opérateurs culturels et sportifs, entre structures d’appui à l’entrepreneuriat, entre communes, entre organisations de la société civile ont une vie propre qui se prolongera au-delà du programme. Le Groupe Jeunesse réunissant les acteurs nationaux et internationaux du secteur sous l’égide de l’ONJ en est un exemple.',
  },
  {
    kicker: '',
    title: 'DES INITIATIVES QUI CONTINUENT',
    body:
      "Les entreprises d'économie sociale et solidaire créées avec l'appui de Jeun'ESS, les opérateurs de la culture et du sports appuyés par Maghroum’IN continueront de produire. Les jeunes chercheurs accompagnés par SWAFY continueront de travailler. Les stratégies jeunesse élaborées dans les communes partenaires de Fe3il.a continueront d'orienter l'action municipale. Les clubs scientifiques, sportifs et culturels créés ou renforcés continueront de fonctionner. Les bureaux ANETI modernisés continueront de servir les demandeurs d'emploi. Ces dynamiques ont leur propre élan.",
  },
  {
    kicker: '',
    title: 'UNE GÉNÉRATION FORMÉE',
    body:
      "EU4Youth a contribué à la formation d'une génération de praticiens qui ont intégré les approches participatives et multi-acteurs dans leur façon de travailler. Cette transformation des pratiques professionnelles est peut-être l'héritage le plus durable du programme.",
  },
]

const THEMES = [
  {
    title: 'Égalité Femmes-Hommes',
    body: 'L’action de l’Union européenne contribue à promouvoir l’égalité entre les femmes et les hommes et à renforcer leur participation dans les différents domaines de la vie sociale et économique. Elle soutient des initiatives visant à favoriser l’égalité des chances et à mieux prendre en compte les enjeux liés au genre.',
  },
  {
    title: 'Droits humains et société civile',
    body: 'L’Union européenne soutient la promotion et la protection des droits humains ainsi que le rôle de la société civile. Cette coopération contribue à renforcer les capacités des acteurs associatifs et leur participation à la vie publique et sociale.',
  },
  {
    title: 'Santé',
    body: 'La coopération européenne intervient dans le domaine de la santé, en appui aux dynamiques visant à améliorer les systèmes et les services de santé. Elle accompagne également les acteurs concernés dans leurs efforts pour répondre aux enjeux sanitaires.',
  },
  {
    title: 'Changement climatique et énergie',
    body: 'Face aux enjeux liés au changement climatique, l’Union européenne soutient les dynamiques de transition vers des modèles plus durables. Son action porte notamment sur les questions liées à l’énergie, à l’adaptation au changement climatique et à la transition énergétique.',
  },
  {
    title: 'Développement régional et local',
    body: 'L’Union européenne contribue au développement équilibré des territoires et au renforcement des dynamiques locales. Les interventions dans ce domaine visent notamment à soutenir le développement régional et les acteurs qui contribuent à la cohésion et au développement des territoires.',
  },
  {
    title: 'Environnement, développement durable et eau',
    body: 'La coopération européenne soutient la protection de l’environnement et la promotion de modes de développement plus durables. Elle porte également sur la gestion et la préservation des ressources en eau, ainsi que sur les enjeux environnementaux qui concernent les territoires.',
  },
  {
    title: 'Agriculture',
    body: 'L’agriculture constitue un domaine important de la coopération entre l’Union européenne et la Tunisie. L’action européenne accompagne les dynamiques liées au développement agricole et à la durabilité du secteur, en lien avec les enjeux économiques, territoriaux et environnementaux.',
  },
  {
    title: 'Médias & Culture',
    body: 'L’Union européenne soutient les secteurs des médias et de la culture, qui contribuent au pluralisme, à la création et à la diversité culturelle. La coopération vise également à renforcer les acteurs et les initiatives qui participent au développement de ces secteurs.',
  },
  {
    title: 'Education, recherche, innovation',
    body: 'L’Union européenne soutient l’éducation, la recherche et l’innovation comme leviers de développement et d’ouverture. Cette coopération contribue à favoriser l’accès aux connaissances, le développement des compétences et les dynamiques d’innovation.',
  },
  {
    title: 'Emploi et formation professionnelle',
    body: 'L’action européenne contribue au développement de l’emploi et au renforcement de la formation professionnelle. Elle vise notamment à soutenir l’acquisition de compétences et à favoriser une meilleure adéquation entre les compétences et les opportunités professionnelles.',
  },
  {
    title: 'Démocratie et gouvernance',
    body: 'L’Union européenne accompagne les dynamiques liées à la démocratie et à la gouvernance. Son action soutient notamment le renforcement des institutions, des pratiques de gouvernance et de la participation à la vie publique.',
  },
  {
    title: 'Développement économique et appui au secteur privé',
    body: 'L’Union européenne soutient le développement économique et les acteurs du secteur privé en Tunisie. La coopération contribue notamment à créer un environnement favorable à l’activité économique, à l’entrepreneuriat et au développement des entreprises.',
  },
]

const INTRO_EU =
  "L’Union européenne accompagne la Tunisie à travers une coopération qui couvre des domaines variés, en lien avec les enjeux sociaux, économiques, territoriaux et environnementaux du pays. Son action s’articule autour de thématiques complémentaires, allant des droits humains et de l’égalité à l’emploi, l’innovation, le développement économique, la transition écologique et le développement territorial.\n\nDécouvrez les principaux domaines d’intervention de l’Union européenne en Tunisie et explorez les projets qui contribuent à ces différentes dynamiques."

const EXPLORE_BODY =
  'Ces thématiques prennent forme à travers de nombreux projets et initiatives déployés dans différents territoires. Explorez-les à travers la cartographie des projets de l’Union européenne en Tunisie ou approfondissez l’action européenne sur le site officiel de la Délégation de l’Union européenne en Tunisie.'

const aproposBlocks = [
  block('a-propos', 'hero', 'badge', "Programme d'appui à la jeunesse tunisienne"),
  block(
    'a-propos',
    'hero',
    'title',
    'EU4Youth accompagne les jeunes Tunisiennes et Tunisiens\ndans leurs parcours, leurs projets et leur engagement.',
  ),
  block('a-propos', 'hero', 'body', HERO_BODY),
  block('a-propos', 'pourquoi', 'title', 'POURQUOI\nEU4YOUTH ?'),
  block('a-propos', 'pourquoi', 'body', POURQUOI_BODY),
  block('a-propos', 'pourquoi', 'more', 'Lire La suite'),
  block(
    'a-propos',
    'pourquoi',
    'quote',
    "« EU4Youth s'inscrit dans une dynamique de coopération entre l'Union européenne, les institutions tunisiennes et les acteurs locaux afin de soutenir les parcours, les initiatives et l'engagement des jeunes. »",
  ),
  block('a-propos', 'pourquoi', 'moreBody', ''),
  block('a-propos', 'vision', 'title', 'UNE VISION\nCOMMUNE'),
  block(
    'a-propos',
    'vision',
    'lead',
    'EU4Youth part d’une conviction fondamentale : les jeunes Tunisiennes et Tunisiens sont des acteurs à part entière du changement.',
  ),
  block(
    'a-propos',
    'vision',
    'body',
    "Le programme se construit sur une logique d'investissement dans les capacités, dans les opportunités et dans les conditions d'autonomisation et d’intégration socioéconomique dans tous les territoires du pays.\n\nCette vision se décline en sept principes transversaux qui guident l'ensemble des projets :",
  ),
  block('a-propos', 'vision', 'more', 'Lire La suite'),
  block('a-propos', 'vision', 'principles', JSON.stringify(PRINCIPLES), 'json'),
  block(
    'a-propos',
    'vision',
    'closing',
    "À ces principes s'ajoutent des engagements transversaux partagés par tous les projets : intégration systématique de la dimension genre, attention aux besoins spécifiques des jeunes femmes, des jeunes porteurs de handicap et des jeunes des zones rurales ou enclavées ainsi que la dimension environnement et durabilité.\n\nEU4Youth accompagne les aspirations des jeunes Tunisiennes et Tunisiens en renforçant les opportunités, les partenariats et les initiatives qui contribuent au développement des territoires.",
  ),
  block('a-propos', 'objectifs', 'title', 'OBJECTIFS DU PROGRAMME'),
  block('a-propos', 'objectifs', 'items', JSON.stringify(OBJECTIFS), 'json'),
  block('a-propos', 'comment', 'title', 'COMMENT\nLE PROGRAMME AGIT'),
  block(
    'a-propos',
    'comment',
    'lead',
    "EU4Youth n'agit pas en silo. Il couvre trois grands axes d'intervention complémentaires, pensés pour se renforcer mutuellement et produire un impact qui dépasse la somme de ses parties.",
  ),
  block('a-propos', 'comment', 'items', JSON.stringify(COMMENT_ITEMS), 'json'),
  block('a-propos', 'projets', 'title', 'SIX PROJETS,'),
  block('a-propos', 'projets', 'subtitle', 'UNE VISION COMMUNE'),
  block(
    'a-propos',
    'projets',
    'body',
    "EU4Youth s'organise en trois composantes thématiques portées par six projets complémentaires. Chaque projet intervient sur une dimension spécifique de l'inclusion des jeunes Tunisiennes et Tunisiens. Ensemble, ils couvrent l'intégralité du parcours : de l'emploi et de l'entrepreneuriat à la participation citoyenne, en passant par la culture, le sport et les sciences.",
  ),
  block('a-propos', 'territoires', 'title', 'UNE ACTION DANS LES TERRITOIRES'),
  block(
    'a-propos',
    'territoires',
    'body',
    [
      'De Bizerte à Ben Guerdane, de Jendouba à Tataouine, EU4Youth accompagne les jeunes Tunisiennes et Tunisiens dans les 24 gouvernorats de la Tunisie.',
      "L'une des caractéristiques les plus distinctives du programme est son attachement à une logique territoriale. EU4Youth ne se contente pas d'agir sur des politiques nationales : il cherche à comprendre et à transformer les dynamiques locales, en mobilisant les acteurs présents sur chaque territoire — communes, délégations régionales, offices de développement régional, associations locales, clubs sportifs.",
      "La sélection des zones d'intervention prioritaires prend en compte les indices de développement régional, les taux de chômage et d'émigration, et le degré de vulnérabilité des populations jeunes. Le programme accorde une attention particulière aux gouvernorats de l'intérieur, du centre-ouest et du sud, où les besoins sont les plus importants et où l'impact peut être le plus transformateur.",
      "Mais EU4Youth agit aussi à l'échelle nationale, avec des projets qui touchent l'ensemble du territoire et des mécanismes qui renforcent les institutions au niveau central.",
      'Au-delà des institutions formelles, EU4Youth cherche à stimuler l’émergence d’écosystèmes locaux dynamiques : des réseaux d’acteurs qui se connaissent, coopèrent et créent ensemble des opportunités pour les jeunes. Ces écosystèmes, une fois constitués, ont la capacité de produire des résultats durables bien au-delà de la fin du financement européen.',
    ].join('\n\n'),
  ),
  block('a-propos', 'impact', 'title', "L'IMPACT DU PROGRAMME"),
  block(
    'a-propos',
    'impact',
    'body',
    "Depuis 2019, EU4Youth a mobilisé des centaines d'acteurs, dans toutes les régions de Tunisie, autour d'une vision commune. Voici quelques données qui témoignent de l'ampleur et de la profondeur de cette action.",
  ),
  block('a-propos', 'impact', 'items', JSON.stringify(IMPACT_ITEMS), 'json'),
  block('a-propos', 'impact', 'pending', JSON.stringify(IMPACT_PENDING), 'json'),
  block(
    'a-propos',
    'impact',
    'pendingNote',
    'Des données complémentaires seront intégrées dès qu’elles seront disponibles et validées par les équipes projets.',
  ),
  block('a-propos', 'projets', 'fiches', JSON.stringify(FICHES), 'json'),
  block(
    'a-propos',
    'partners',
    'body',
    "EU4Youth Tunisie mobilise un réseau unique de partenaires institutionnels, d'organisations internationales et d'acteurs de terrain. Ce partenariat multidimensionnel est la condition de la réussite et de la durabilité du programme.",
  ),
  block('a-propos', 'partners', 'title', 'LES PARTENAIRES'),
  block('a-propos', 'partners', 'tabs', JSON.stringify(PARTNER_TABS), 'json'),
  block('a-propos', 'avenir', 'title', "REGARDER VERS\nL'AVENIR"),
  block(
    'a-propos',
    'avenir',
    'body',
    "À l'horizon 2027, EU4Youth laisse un héritage qui dépasse la durée du financement. Ce qui compte, au-delà des chiffres, c'est la qualité et la durabilité des transformations produites avec et pour les jeunes.",
  ),
  block('a-propos', 'avenir', 'items', JSON.stringify(AVENIR_ITEMS), 'json'),
]

const euBlocks = [
  block('eu-en-tunisie', 'hero', 'badge', 'COOPÉRATION UNION EUROPÉENNE — TUNISIE'),
  block('eu-en-tunisie', 'hero', 'title', "L’UNION EUROPÉENNE\nEN TUNISIE"),
  block('eu-en-tunisie', 'intro', 'eyebrow', 'UNE COOPÉRATION MULTISECTORIELLE'),
  block('eu-en-tunisie', 'intro', 'title', 'ACCOMPAGNER LA TUNISIE'),
  block('eu-en-tunisie', 'intro', 'body', INTRO_EU),
  block('eu-en-tunisie', 'themes', 'eyebrow', 'DOMAINES D’INTERVENTION'),
  block('eu-en-tunisie', 'themes', 'title', 'THÉMATIQUES'),
  block('eu-en-tunisie', 'themes', 'items', JSON.stringify(THEMES), 'json'),
  block('eu-en-tunisie', 'explore', 'eyebrow', 'ALLER PLUS LOIN'),
  block(
    'eu-en-tunisie',
    'explore',
    'title',
    'Explorer les projets de l’Union européenne en Tunisie',
  ),
  block('eu-en-tunisie', 'explore', 'body', EXPLORE_BODY),
  block('eu-en-tunisie', 'explore', 'mapCta', 'Explorer les projets de l’UE en Tunisie'),
  block('eu-en-tunisie', 'explore', 'siteCta', 'Découvrir l’action de l’UE en Tunisie'),
]

async function push(token, blocks) {
  const res = await fetch(`${API}/admin/content/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ blocks }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`bulk ${res.status}: ${text}`)
  }
  return res.json().catch(() => ({}))
}

const token = await login()
await push(token, [...aproposBlocks, ...euBlocks])
console.log(`Pushed ${aproposBlocks.length + euBlocks.length} blocks to ${API}`)
