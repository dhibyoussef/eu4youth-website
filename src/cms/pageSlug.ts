const PATH_SLUG: Record<string, string> = {
  '/': 'home',
  '/programme/a-propos': 'a-propos',
  '/programme/objectifs': 'objectifs',
  '/programme/financement': 'financement',
  '/programme/gouvernance': 'gouvernance',
  '/projets': 'projets',
  '/carte': 'carte',
  '/opportunites': 'opportunites',
  '/actualites': 'actualites',
  '/publications': 'publications',
  '/stories': 'stories',
  '/coin-media': 'coin-media',
  '/glossaire': 'glossaire',
  '/contact': 'contact',
  '/agenda': 'agenda',
  '/partenaires': 'partenaires',
  '/mecanismes-appui': 'mecanismes-appui',
  '/eu-en-tunisie': 'eu-en-tunisie',
  '/confidentialite': 'confidentialite',
  '/mentions-legales': 'mentions-legales',
  '/accessibilite': 'accessibilite',
  '/cookies': 'cookies',
  '/recherche': 'recherche',
  '/plan-du-site': 'plan-du-site',
  '/page-introuvable': 'introuvable',
}

export function slugFromPath(pathname: string) {
  if (PATH_SLUG[pathname]) return PATH_SLUG[pathname]
  if (pathname.startsWith('/projets/')) return 'projet'
  if (pathname.startsWith('/opportunites/')) return 'opportunite'
  if (pathname.startsWith('/actualites/')) return 'actualite'
  if (pathname.startsWith('/publications/')) return 'publication'
  if (pathname.startsWith('/agenda/')) return 'evenement'
  return 'introuvable'
}
