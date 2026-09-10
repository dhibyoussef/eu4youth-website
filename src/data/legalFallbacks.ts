export type LegalChapter = { id: string; number: string; title: string; body: string }

export const PRIVACY_CHAPTERS: LegalChapter[] = [
  {
    id: 'responsable',
    number: '01',
    title: 'Responsable du traitement',
    body: 'Le site présente le programme EU4Youth Tunisie, financé par l’Union européenne et mis en œuvre avec des partenaires tunisiens et internationaux. Le responsable du traitement des données collectées via le site est l’équipe de coordination du programme, joignable depuis la page Contact. La dénomination juridique, le représentant et l’adresse postale officiels doivent être confirmés par l’éditeur dans cette rubrique.',
  },
  {
    id: 'donnees',
    number: '02',
    title: 'Données collectées',
    body: 'Lorsque vous utilisez le formulaire de contact, nous pouvons collecter votre identité, organisation, fonction, e-mail, téléphone, profil, projet concerné, zone géographique, objet et message, ainsi que votre consentement. Une inscription à la newsletter ne retient que l’e-mail. La recherche conserve la requête saisie. Le site mémorise aussi la langue d’affichage et votre choix d’accepter ou de refuser les cookies, sur votre navigateur.',
  },
  {
    id: 'finalites',
    number: '03',
    title: 'Finalités et bases juridiques',
    body: 'Les données de contact servent à traiter votre demande. L’e-mail de newsletter sert uniquement à l’envoi d’informations du programme, tant que vous restez inscrit. La langue et le choix cookies servent au fonctionnement du site. La base est votre demande (exécution de mesures liées à une mission d’intérêt public du programme) ou votre consentement (newsletter, cookies non indispensables).',
  },
  {
    id: 'destinataires',
    number: '04',
    title: 'Destinataires des données',
    body: 'Les messages sont lus par l’équipe du programme. Si votre demande concerne un projet précis, elle peut être transmise au partenaire de mise en œuvre concerné. L’hébergeur technique peut traiter des journaux de connexion nécessaires à la sécurité. Aucune donnée n’est vendue. Les prestataires n’interviennent que pour l’hébergement, la maintenance ou l’envoi d’e-mails.',
  },
  {
    id: 'conservation',
    number: '05',
    title: 'Durées de conservation',
    body: 'Les messages de contact sont conservés le temps du traitement puis jusqu’à 12 mois. L’e-mail de newsletter est conservé jusqu’à votre désinscription. La langue et le choix cookies restent dans votre navigateur jusqu’à 13 mois, ou jusqu’à ce que vous les effaciez. Les journaux techniques suivent la durée nécessaire à la sécurité du service.',
  },
  {
    id: 'droits',
    number: '06',
    title: 'Vos droits',
    body: 'Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou l’opposition, et retirer un consentement (newsletter, cookies) à tout moment. Adressez votre demande via la page Contact en précisant « données personnelles ». Vous pouvez également saisir l’Instance nationale de protection des données personnelles (INPDP) en Tunisie.',
  },
  {
    id: 'contact',
    number: '07',
    title: 'Contact et réclamations',
    body: 'Pour toute question sur cette politique ou pour exercer vos droits, utilisez le formulaire de la page Contact. Mentionnez l’objet de votre demande afin qu’elle soit orientée vers la bonne équipe.',
  },
]

export const LEGAL_CHAPTERS: LegalChapter[] = [
  {
    id: 'editeur',
    number: '01',
    title: 'Éditeur du site',
    body: 'Ce site est édité pour le programme EU4Youth Tunisie, programme d’appui à la jeunesse tunisienne financé par l’Union européenne. Il présente les six projets, les opportunités, l’agenda, les publications et les ressources du programme. L’éditeur complète ici la dénomination, l’adresse et le représentant légal dès qu’ils sont officiellement désignés.',
  },
  {
    id: 'publication',
    number: '02',
    title: 'Direction de la publication',
    body: 'La direction de la publication est assurée par l’équipe de coordination du programme EU4Youth Tunisie. Les contenus factuels (chiffres, appels, dates) relèvent des sources des projets et peuvent être mis à jour depuis le CMS.',
  },
  {
    id: 'hebergement',
    number: '03',
    title: 'Hébergement',
    body: 'Le site est hébergé sur l’infrastructure technique mise à disposition pour le programme. Le nom, l’adresse et le contact de l’hébergeur doivent figurer dans cette rubrique dès validation par l’éditeur (le CMS permet de les renseigner sans modifier le code).',
  },
  {
    id: 'propriete',
    number: '04',
    title: 'Propriété intellectuelle',
    body: 'Les textes, visuels, logos et documents téléchargeables du site sont protégés. Le logo EU4Youth, les emblèmes de la République tunisienne et de l’Union européenne, ainsi que les identités des projets, restent la propriété de leurs titulaires. Toute reproduction non autorisée est interdite, hors citations courtes avec mention de la source ou usages prévus par la loi.',
  },
  {
    id: 'responsabilite',
    number: '05',
    title: 'Responsabilité',
    body: 'Le site vise une information fiable sur le programme. Les contenus n’engagent que leurs auteurs et ne constituent pas un avis juridique.',
  },
  {
    id: 'liens',
    number: '06',
    title: 'Liens externes',
    body: 'Le site peut renvoyer vers des pages de partenaires, d’institutions ou de documents hébergés ailleurs. Ces sites disposent de leurs propres mentions. EU4Youth Tunisie n’est pas responsable de leur contenu ni de leurs pratiques de confidentialité.',
  },
  {
    id: 'contact',
    number: '07',
    title: 'Contact',
    body: 'Pour signaler une erreur, demander une autorisation de réutilisation ou joindre l’équipe, utilisez la page Contact. Les délais de réponse dépendent de la nature de la demande et du projet concerné.',
  },
]

export const ACCESSIBILITY_CHAPTERS: LegalChapter[] = [
  {
    id: 'engagement',
    number: '01',
    title: 'Engagement d’accessibilité',
    body: 'Le programme s’engage à rendre ce site perceptible, utilisable et compréhensible : structure de titres, contrastes, navigation au clavier, textes alternatifs sur les images porteuses d’information, et pages légales, contact et recherche accessibles sans souris.',
  },
  {
    id: 'referentiel',
    number: '02',
    title: 'Référentiel et niveau de conformité',
    body: 'Le référentiel visé est WCAG 2.2, niveau AA, en cohérence avec les bonnes pratiques européennes pour les sites publics. À ce jour, aucun audit externe complet n’a été publié : la conformité est donc partielle / non évaluée. Cette mention sera remplacée par le résultat d’audit dès qu’il sera disponible.',
  },
  {
    id: 'perimetre',
    number: '03',
    title: 'Périmètre de la déclaration',
    body: 'La déclaration couvre les pages publiques du site (accueil, programme, projets, carte, opportunités, actualités, publications, agenda, stories, glossaire, contact, recherche, plan du site et pages légales). Les documents PDF téléchargeables et les lecteurs vidéo tiers peuvent avoir un niveau d’accessibilité différent.',
  },
  {
    id: 'resultats',
    number: '04',
    title: 'Résultats de l’évaluation',
    body: 'En attendant un rapport d’audit, l’équipe corrige en continu les défauts signalés (liens, formulaires, focus clavier, langues). Un pourcentage de conformité et la date d’audit seront indiqués ici après évaluation.',
  },
  {
    id: 'non-conformites',
    number: '05',
    title: 'Contenus non accessibles',
    body: 'Peuvent rester difficiles d’accès : certaines cartes interactives, documents PDF hérités, visuels décoratifs sans alternative, ou contenus embarqués depuis des plateformes externes. Signalez-les via Contact pour qu’une alternative puisse être proposée.',
  },
  {
    id: 'signalement',
    number: '06',
    title: 'Signaler une difficulté d’accès',
    body: 'Si vous ne pouvez pas consulter un contenu, écrivez via la page Contact : indiquez l’URL, le navigateur et la difficulté rencontrée. L’équipe s’efforce d’apporter une alternative (texte, document, rendez-vous).',
  },
  {
    id: 'voies-recours',
    number: '07',
    title: 'Voies de recours',
    body: 'Si la réponse ne vous convient pas, vous pouvez renouveler la demande en précisant qu’il s’agit d’un recours accessibilité. Pour les données personnelles liées à un signalement, l’INPDP demeure l’autorité de contrôle en Tunisie.',
  },
]

export const COOKIES_CHAPTERS: LegalChapter[] = [
  {
    id: 'definition',
    number: '01',
    title: 'Qu’est-ce qu’un cookie ?',
    body: 'Un cookie ou un stockage local est un petit fichier ou une clé enregistrée par le navigateur. Il peut être indispensable au fonctionnement (langue, sécurité) ou servir à la mesure d’audience s’il est activé. Ce site n’active de mesure d’audience que si un outil de ce type est déployé et accepté.',
  },
  {
    id: 'cookies-utilises',
    number: '02',
    title: 'Cookies et traceurs utilisés',
    body: 'Aujourd’hui le site public enregistre : le choix du bandeau cookies (acceptation ou refus) ; la langue d’interface ; éventuellement un jeton d’édition pour les rédacteurs connectés au CMS. Aucun cookie publicitaire n’est déposé. Si un outil d’analytics est ajouté plus tard, il sera décrit ici et soumis au bandeau.',
  },
  {
    id: 'finalites',
    number: '03',
    title: 'Finalités',
    body: 'Ces enregistrements servent à se souvenir de votre décision cookies, à afficher le français, l’anglais ou l’arabe, et à permettre la prévisualisation pour les rédacteurs. Ils ne servent pas à de la publicité ciblée.',
  },
  {
    id: 'durees',
    number: '04',
    title: 'Durées de conservation',
    body: 'Le choix cookies et la langue restent dans le navigateur jusqu’à 13 mois, ou jusqu’à suppression manuelle des données du site. Le jeton d’édition expire avec la session rédacteur.',
  },
  {
    id: 'consentement',
    number: '05',
    title: 'Gestion du consentement',
    body: 'Au premier passage, un bandeau propose d’accepter ou de refuser. Refuser n’empêche pas de lire le site : seuls les traceurs non indispensables sont bloqués. Vous pouvez modifier votre choix à tout moment avec le bouton « Modifier mes préférences » sur cette page, qui réaffiche le bandeau.',
  },
  {
    id: 'parametrage',
    number: '06',
    title: 'Paramétrage du navigateur',
    body: 'Vous pouvez aussi bloquer ou supprimer les cookies depuis les réglages de votre navigateur. Un blocage total peut dégrader la mémorisation de la langue. Consultez l’aide de Chrome, Firefox, Safari ou Edge pour la procédure.',
  },
  {
    id: 'contact',
    number: '07',
    title: 'Contact',
    body: 'Pour une question sur les cookies ou pour exercer un droit lié à ces enregistrements, utilisez la page Contact.',
  },
]
