import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import ProjectLogos from '../ProjectLogos'
import FunderFlags from '../FunderFlags'
import { NAV_LOGOS } from '../../data/logos'
import { cmsApi } from '../../cms/cmsApi'
import { NAV_GEO, PRIMARY_NAV, navFromCms, type NavItem } from '../../data/nav'
import { useContent } from '../../cms/ContentProvider'
import { useEditMode } from '../../cms/EditModeProvider'
import { assetUrl } from '../../lib/assetUrl'
import './header.css'

const rem = (designPx: number) => `${designPx / 10}rem`

const HEADER_LOCALES = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'عربي' },
  { code: 'en', label: 'EN' },
] as const

function LocaleSwitcher({ className }: { className: string }) {
  const { locale, setLocale } = useEditMode()
  const { t } = useContent()

  return (
    <ul className={className} aria-label={t('nav.languages', 'Langues du site')}>
      {HEADER_LOCALES.map((item, index) => (
        <li key={item.code}>
          {index > 0 ? <span aria-hidden="true">|</span> : null}
          <button
            type="button"
            className={locale === item.code ? 'is-on' : ''}
            lang={item.code}
            aria-pressed={locale === item.code}
            onClick={() => setLocale(item.code)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Chevron matching the comp: 20 x 12 design px, round caps. */
function Chevron({ up }: { up: boolean }) {
  return (
    <svg
      className={`nav__chev${up ? ' nav__chev--up' : ''}`}
      viewBox="0 0 19 11"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1.53 1.53 L9.5 9.47 L17.47 1.53"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Label({ item }: { item: NavItem }) {
  const { get } = useContent()
  if (item.fromCms) {
    return (
      <span className="nav__label">
        {item.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
    )
  }
  const field = (NAV_KEYS[item.label] || item.label).replace(/^nav\./, '')
  const value = get(`nav.${field}`, item.lines.join('\n'))
  const lines = value.split('\n').filter(Boolean)
  return (
    <span className="nav__label">
      {(lines.length ? lines : item.lines).map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  )
}

const NAV_KEYS: Record<string, string> = {
  Programme: 'nav.programme',
  Projets: 'nav.projects',
  Carte: 'nav.map',
  'Actualités et opportunités': 'nav.news_opps',
  'Youth Stories': 'nav.stories',
  'Médias et ressources': 'nav.media',
  'EU en Tunisie': 'nav.eu_tunisia',
}

const CHILD_KEYS: Record<string, string> = {
  '/programme/a-propos': 'nav.about',
  '/programme/objectifs': 'nav.objectifs',
  '/programme/gouvernance': 'nav.gouvernance',
  '/mecanismes-appui': 'nav.mecanismes',
  '/partenaires': 'nav.partenaires',
  '/actualites': 'nav.actualites',
  '/opportunites': 'nav.opportunites',
  '/agenda': 'nav.agenda',
  '/publications': 'nav.publications',
  '/glossaire': 'nav.glossaire',
  '/coin-media': 'nav.coin_media',
  '/contact': 'nav.contact',
}

export default function Header() {
  const { pathname } = useLocation()
  const { t, get } = useContent()
  const { locale } = useEditMode()
  const [open, setOpen] = useState<string | null>(null)
  // Narrow viewports cannot show eight tabs and their panels side by side, so the
  // whole nav collapses behind one control. The tabs themselves are unchanged; the
  // stylesheet stacks them and the panels open in place.
  const [menuOpen, setMenuOpen] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>(PRIMARY_NAV)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    cmsApi
      .get('/site-nav', { params: { locale } })
      .then((res) => {
        const tree = Array.isArray(res.data) ? res.data : []
        if (!cancelled && tree.length) setNavItems(navFromCms(tree))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    setOpen(null)
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 1100px)').matches) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
        <header className={`header${menuOpen ? ' header--menu-open' : ''}`} data-cms-section="header">
      <div className="header__inst">
        <Link to="/" className="header__logo" aria-label={t('header.home_aria', 'EU4Youth Tunisie — accueil')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={assetUrl(get('header.logo', '/img/logo-eu4youth.png'))} alt="EU4Youth" />
        </Link>
        <LocaleSwitcher className="header__locales" />
        <FunderFlags variant="header" />
        <button
          type="button"
          className="header__burger"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          aria-label={menuOpen ? t('nav.menu_close', 'Fermer le menu') : t('nav.menu_open', 'Ouvrir le menu')}
          onClick={() => setMenuOpen((wasOpen) => !wasOpen)}
        >
          <span className="header__burger-bars" aria-hidden="true" />
        </button>
      </div>

      <nav
        className="nav"
        id="primary-nav"
        ref={navRef}
        aria-label="Navigation principale"
        onMouseLeave={() => setOpen(null)}
        onClickCapture={(event) => {
          // Following a link inside the drawer should close it, otherwise the new
          // page opens underneath a menu that is still covering it.
          if ((event.target as HTMLElement).closest('a')) setMenuOpen(false)
        }}
      >
        {navItems.map((item) => {
          const isOpen = open === item.label
          const drop = item.dropdown

          return (
            <div
              key={item.label}
              className={`nav__item${/programme/i.test(item.label) ? ' nav__item--programme' : ''}`}
            >
              {/* Tab plate, drawn only when open so it can sit behind the label */}
              {isOpen && drop && (
                <span
                  className={`nav__tab nav__tab--${drop.kind === 'logos' ? 'white' : 'orange'}`}
                  style={
                    {
                      left: rem(drop.tab.x),
                      width: rem(drop.tab.w),
                      top: rem(drop.tab.top - NAV_GEO.instHeight),
                      bottom: `calc(100% - ${rem(NAV_GEO.tabBottom - NAV_GEO.instHeight)})`,
                      '--tab-x': drop.tab.x,
                      '--tab-w': drop.tab.w,
                    } as CSSProperties
                  }
                />
              )}

              {drop ? (
                <button
                  type="button"
                  className={`nav__link${isOpen ? ' is-open' : ''}`}
                  style={{ left: rem(item.x), '--nav-x': item.x } as CSSProperties}
                  aria-expanded={isOpen}
                  onMouseEnter={() => setOpen(item.label)}
                  onClick={() => setOpen(isOpen ? null : item.label)}
                >
                  <Label item={item} />
                  <Chevron up={isOpen} />
                </button>
              ) : (
                <NavLink
                  to={item.to!}
                  className="nav__link"
                  style={{ left: rem(item.x), '--nav-x': item.x } as CSSProperties}
                  onMouseEnter={() => setOpen(null)}
                >
                  <Label item={item} />
                </NavLink>
              )}

              {isOpen && drop && (
                <div
                  className={`nav__panel nav__panel--${drop.kind}`}
                  style={
                    {
                      ...(drop.kind === 'logos'
                        ? {
                            top: rem(drop.panelTop - NAV_GEO.instHeight),
                            height: rem(drop.panelBottom! - drop.panelTop),
                            left: 0,
                            width: '100%',
                          }
                        : {}),
                    } as CSSProperties
                  }
                >
                  {drop.kind === 'rows' ? (
                    <ul className="nav__rows">
                      {item.children!.map((child) => (
                        <li key={child.to}>
                          {/^https?:/i.test(child.to) ? (
                            <a href={child.to} onClick={() => setOpen(null)}>
                              {child.label}
                            </a>
                          ) : (
                            <NavLink to={child.to} onClick={() => setOpen(null)}>
                              {item.fromCms
                                ? child.label
                                : get(
                                    `nav.${(CHILD_KEYS[child.to] || child.to).replace(/^nav\./, '').replace(/\//g, '_')}`,
                                    child.label,
                                  )}
                            </NavLink>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="nav__logos">
                      <ProjectLogos cells={NAV_LOGOS} onNavigate={() => setOpen(null)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <div className="nav__utils">
          <Link to="/contact" aria-label={t('nav.contact_aria', 'Nous contacter')}>
            <img src={get('header.mailIcon', '/img/nav-mail.png')} alt="" />
          </Link>
          <Link to="/recherche" aria-label={t('search.open', 'Rechercher sur le site')}>
            <img src={get('header.searchIcon', '/img/nav-search.png')} alt="" />
          </Link>
          <LocaleSwitcher className="nav__locales" />
        </div>
      </nav>
    </header>
  )
}
