import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { PROJECTS } from './data/projects'
import { ContentProvider, useContent } from './cms/ContentProvider'
import { CookieBanner } from './cms/CookieBanner'
import { EditToolbar } from './cms/EditToolbar'
import { setLiveCatalogs } from './lib/search'
import HomePage from './pages/HomePage'
import PublicationsPage from './pages/PublicationsPage'
import AProposPage from './pages/AProposPage'
import OpportunitesPage from './pages/OpportunitesPage'
import ActualitesPage from './pages/ActualitesPage'
import ContactPage from './pages/ContactPage'
import GlossairePage from './pages/GlossairePage'
import CartePage from './pages/CartePage'
import ProjetPage from './pages/ProjetPage'
import ProjetsPage from './pages/ProjetsPage'
import ObjectifsPage from './pages/ObjectifsPage'
import FinancementPage from './pages/FinancementPage'
import GouvernancePage from './pages/GouvernancePage'
import OpportunityDetailPage from './pages/OpportunityDetailPage'
import NewsDetailPage from './pages/NewsDetailPage'
import PublicationDetailPage from './pages/PublicationDetailPage'
import EventDetailPage from './pages/EventDetailPage'
import AgendaPage from './pages/AgendaPage'
import PartenairesPage from './pages/PartenairesPage'
import MecanismesAppuiPage from './pages/MecanismesAppuiPage'
import StoriesPage from './pages/StoriesPage'
import EuTunisiePage from './pages/EuTunisiePage'
import CoinMediaPage from './pages/CoinMediaPage'
import LegalPendingPage from './pages/LegalPendingPage'
import PlanDuSitePage from './pages/PlanDuSitePage'
import SearchPage from './pages/SearchPage'
import StubPage from './pages/StubPage'

function CatalogHydrator() {
  useEffect(() => {
    const kinds = [
      'news',
      'publications',
      'events',
      'opportunities',
      'projects',
      'glossary',
      'stories',
      'videos',
      'initiatives',
    ] as const
    Promise.all(
      kinds.map((kind) =>
        fetch(`/api/catalog/${kind}`)
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),
      ),
    )
      .then(([news, publications, events, opportunities, projects, glossary]) => {
        setLiveCatalogs({
          news: Array.isArray(news) && news.length ? news : undefined,
          publications: Array.isArray(publications) && publications.length ? publications : undefined,
          events: Array.isArray(events) && events.length ? events : undefined,
          opportunities:
            Array.isArray(opportunities) && opportunities.length ? opportunities : undefined,
          projects: Array.isArray(projects) && projects.length ? projects : undefined,
          glossary: Array.isArray(glossary) && glossary.length ? glossary : undefined,
        })
      })
      .catch(() => undefined)
  }, [])
  return null
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.append(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const titles: Record<string, string> = {
      '/programme/a-propos': 'Programme EU4Youth',
      '/programme/objectifs': 'Objectifs du programme',
      '/programme/financement': 'Financement Union européenne',
      '/programme/gouvernance': 'Gouvernance et pilotage',
      '/projets': 'Les six projets',
      '/carte': 'Carte des initiatives',
      '/opportunites': 'Opportunités',
      '/actualites': 'Actualités',
      '/publications': 'Publications et ressources',
      '/glossaire': 'Glossaire',
      '/contact': 'Contact',
      '/agenda': 'Agenda',
      '/partenaires': 'Partenaires',
      '/mecanismes-appui': "Mécanismes d'appui",
      '/stories': 'Youth Stories',
      '/eu-en-tunisie': "L'Union européenne dans EU4Youth",
      '/coin-media': 'Coin média',
      '/confidentialite': 'Politique de confidentialité',
      '/mentions-legales': 'Mentions légales',
      '/accessibilite': 'Accessibilité',
      '/cookies': 'Gestion des cookies',
      '/plan-du-site': 'Plan du site',
      '/recherche': 'Recherche',
    }
    const projectSlug = pathname.match(/^\/projets\/([^/]+)$/)?.[1]
    const projectTitle = projectSlug
      ? PROJECTS.find((project) => project.slug === projectSlug)?.acronym
      : undefined
    const newsSlug = pathname.match(/^\/actualites\/([^/]+)$/)?.[1]
    const opportunitySlug = pathname.match(/^\/opportunites\/([^/]+)$/)?.[1]
    const publicationId = pathname.match(/^\/publications\/([^/]+)$/)?.[1]
    const eventId = pathname.match(/^\/agenda\/([^/]+)$/)?.[1]
    const detailTitle =
      (newsSlug ? 'Actualité' : undefined) ??
      (opportunitySlug ? 'Opportunité' : undefined) ??
      (publicationId ? 'Publication' : undefined) ??
      (eventId ? 'Événement' : undefined)
    const pageTitle = projectTitle ?? detailTitle ?? titles[pathname]
    document.title = pageTitle
      ? `${pageTitle} | EU4Youth Tunisie`
      : "EU4Youth Tunisie — Programme d'appui à la jeunesse tunisienne"

    const descriptions: Record<string, string> = {
      '/': "Découvrez EU4Youth, le programme de l'Union européenne d'appui à la jeunesse tunisienne.",
      '/programme/a-propos': 'Programme EU4Youth Tunisie : vision, objectifs, territoires, impact et partenaires.',
      '/projets': 'Explorez les six projets complémentaires du programme EU4Youth Tunisie.',
      '/carte':
        'Explorez les 706 fiches source EU4Youth recensées dans les 24 gouvernorats.',
      '/opportunites': 'Appels à projets, candidatures, formations et opportunités EU4Youth.',
      '/actualites': 'Actualités, résultats et événements vérifiés des projets EU4Youth.',
      '/publications': 'Publications, rapports et ressources téléchargeables EU4Youth.',
      '/glossaire': 'Comprendre les termes, dispositifs et acteurs de l’écosystème EU4Youth.',
      '/contact': 'Contacter l’équipe du programme EU4Youth Tunisie.',
      '/plan-du-site': 'Toutes les pages du site EU4Youth Tunisie, regroupées par rubrique.',
    }
    const description =
      descriptions[pathname] ??
      (projectTitle
        ? `Présentation, objectifs, territoires et résultats du projet ${projectTitle}.`
        : 'Programme EU4Youth Tunisie — informations, projets et ressources.')
    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: document.title })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    setMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: `https://eu4youth.org${pathname}`,
    })
    setMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    setMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: document.title,
    })
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })

    const noIndexRoutes = new Set([
      '/recherche',
      '/stories',
      '/confidentialite',
      '/mentions-legales',
      '/accessibilite',
      '/cookies',
    ])
    const shouldNoIndex =
      noIndexRoutes.has(pathname) || (!pageTitle && pathname !== '/')
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: shouldNoIndex ? 'noindex, nofollow' : 'index, follow',
    })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = `https://eu4youth.org${pathname}`
  }, [pathname])
  return null
}

function Layout() {
  const { t } = useContent()
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        {t('a11y.skip', 'Aller au contenu principal')}
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

const routerBasename = (() => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return base || undefined
})()

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <ContentProvider>
        <CatalogHydrator />
        <ScrollToTop />
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/programme" element={<Navigate to="/programme/a-propos" replace />} />
          <Route path="/programme/a-propos" element={<AProposPage />} />
          <Route path="/programme/objectifs" element={<ObjectifsPage />} />
          <Route path="/objectifs" element={<Navigate to="/programme/objectifs" replace />} />
          <Route path="/programme/financement" element={<FinancementPage />} />
          <Route path="/financement" element={<Navigate to="/programme/financement" replace />} />
          <Route path="/programme/gouvernance" element={<GouvernancePage />} />
          <Route path="/gouvernance" element={<Navigate to="/programme/gouvernance" replace />} />
          <Route path="/evenements" element={<Navigate to="/agenda" replace />} />
          <Route path="/news" element={<Navigate to="/actualites" replace />} />
          <Route path="/medias" element={<Navigate to="/coin-media" replace />} />
          <Route path="/ressources" element={<Navigate to="/publications" replace />} />
          <Route path="/about" element={<Navigate to="/programme/a-propos" replace />} />
          <Route path="/projets" element={<ProjetsPage />} />
          <Route path="/projets/:slug" element={<ProjetPage />} />
          <Route path="/carte" element={<CartePage />} />
          <Route path="/opportunites" element={<OpportunitesPage />} />
          <Route path="/opportunites/:slug" element={<OpportunityDetailPage />} />
          <Route path="/actualites" element={<ActualitesPage />} />
          <Route path="/actualites/:slug" element={<NewsDetailPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/publications/:id" element={<PublicationDetailPage />} />
          <Route path="/glossaire" element={<GlossairePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/agenda/:id" element={<EventDetailPage />} />
          <Route path="/partenaires" element={<PartenairesPage />} />
          <Route path="/programme/partenaires" element={<Navigate to="/partenaires" replace />} />
          <Route path="/mecanismes-appui" element={<MecanismesAppuiPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/eu-en-tunisie" element={<EuTunisiePage />} />
          <Route path="/coin-media" element={<CoinMediaPage />} />
          <Route path="/plan-du-site" element={<PlanDuSitePage />} />
          <Route path="/recherche" element={<SearchPage />} />
          <Route path="/confidentialite" element={<LegalPendingPage kind="privacy" />} />
          <Route path="/mentions-legales" element={<LegalPendingPage kind="legal" />} />
          <Route path="/accessibilite" element={<LegalPendingPage kind="accessibility" />} />
          <Route path="/cookies" element={<LegalPendingPage kind="cookies" />} />

          <Route path="/page-introuvable" element={<StubPage />} />
          <Route path="*" element={<StubPage />} />
        </Route>
      </Routes>
        <EditToolbar />
      </ContentProvider>
    </BrowserRouter>
  )
}
