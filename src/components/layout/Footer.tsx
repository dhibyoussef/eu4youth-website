import { Link } from 'react-router-dom'
import { CmsSection } from '../../cms/EditableImage'
import { useContent } from '../../cms/ContentProvider'
import { useEditMode } from '../../cms/EditModeProvider'
import ProjectLogos from '../ProjectLogos'
import FunderFlags from '../FunderFlags'
import SocialIcon, { type Network } from './SocialIcon'
import { FOOTER_LOGOS } from '../../data/logos'
import './footer.css'

type FooterLink = { label: string; to: string }

const COLUMNS: {
  title: string
  titleField: string
  listField: string
  x: number
  links: FooterLink[]
}[] = [
  {
    title: 'LE PROGRAMME',
    titleField: 'col1',
    listField: 'programme',
    x: 7.63,
    links: [
      { label: 'À propos EU4Youth', to: '/programme/a-propos' },
      { label: 'Gouvernance et pilotage', to: '/programme/gouvernance' },
      { label: 'Financement Union européenne', to: '/programme/financement' },
      { label: 'Partenaires', to: '/partenaires' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'EXPLORER',
    titleField: 'col2',
    listField: 'explorer',
    x: 75.51,
    links: [
      { label: 'Les projets', to: '/projets' },
      { label: 'Carte des initiatives', to: '/carte' },
      { label: 'Opportunités', to: '/opportunites' },
      { label: 'Publications et ressources', to: '/publications' },
      { label: 'Stories', to: '/stories' },
      { label: 'Actualités et Agenda', to: '/actualites' },
      { label: 'Glossaire', to: '/glossaire' },
    ],
  },
  {
    title: 'INFORMATIONS LÉGALES',
    titleField: 'col3',
    listField: 'legal',
    x: 138.32,
    links: [
      { label: 'Politique de confidentialité', to: '/confidentialite' },
      { label: 'Mentions légales', to: '/mentions-legales' },
      { label: 'Accessibilité', to: '/accessibilite' },
      { label: 'Gestion des cookies', to: '/cookies' },
    ],
  },
]

const SOCIALS: {
  network: Network
  label: string
  field: string
  /** Official programme profile used until the CMS URL is filled. */
  defaultHref: string
}[] = [
  {
    network: 'youtube',
    label: 'YouTube',
    field: 'youtube',
    defaultHref: 'https://www.youtube.com/@EU4YouthTunisie',
  },
  {
    network: 'facebook',
    label: 'Facebook',
    field: 'facebook',
    defaultHref: 'https://www.facebook.com/eu4youth.tn',
  },
  {
    network: 'linkedin',
    label: 'LinkedIn',
    field: 'linkedin',
    defaultHref: 'https://www.linkedin.com/company/eu4youth-tunisia',
  },
  {
    network: 'instagram',
    label: 'Instagram',
    field: 'instagram',
    defaultHref: 'https://www.instagram.com/eu4youth.tn',
  },
]

const LOCALES = [
  { code: 'FR', label: 'Français' },
  { code: 'عربي', label: 'العربية' },
  { code: 'EN', label: 'English' },
]

function parseLinks(raw: string, fallback: FooterLink[]) {
  try {
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : parsed?.fr
    if (!Array.isArray(list)) return fallback
    const links = list
      .map((row: { label?: string; to?: string }) => ({
        label: String(row.label || '').trim(),
        to: String(row.to || '').trim(),
      }))
      .filter((row: FooterLink) => row.label && row.to)
    return links.length ? links : fallback
  } catch {
    return fallback
  }
}

/** Keep Financement visible even if an older CMS list predates the page restore. */
function withFinancementLink(links: FooterLink[], fallback: FooterLink[]) {
  const funding = fallback.find(
    (link) => /financement/i.test(link.to) || /financement/i.test(link.label),
  )
  if (!funding) return links
  if (links.some((link) => /financement/i.test(link.to) || /financement/i.test(link.label))) {
    return links
  }
  const next = [...links]
  const afterGov = next.findIndex((link) => /gouvernance/i.test(link.to))
  const insertAt = afterGov >= 0 ? afterGov + 1 : Math.min(2, next.length)
  next.splice(insertAt, 0, funding)
  return next
}

export default function Footer() {
  const { get, t } = useContent()
  const { locale, setLocale, isEditMode } = useEditMode()
  return (
    <CmsSection id="footer" as="div" className="band footer">
      <div className="band__inner">
        <Link to="/" className="footer__home" aria-label={t('header.home_aria', 'EU4Youth Tunisie — accueil')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={get('footer.logo', '/img/footer-logo-v2.webp')} alt="" />
        </Link>
        <FunderFlags
          className="footer__funders"
          variant="footer"
        />

        <div className="footer__nav">
          {COLUMNS.map((column, columnIndex) => {
            const parsed = parseLinks(
              get(`footer.${column.listField}`, JSON.stringify(column.links)),
              column.links,
            )
            const links =
              column.listField === 'programme'
                ? withFinancementLink(parsed, column.links)
                : parsed
            return (
              <nav
                key={column.titleField}
                className={`footer__col${columnIndex === 0 ? ' footer__col--programme' : ''}`}
                style={{ left: `${column.x}rem` }}
                aria-label={get(`footer.${column.titleField}`, column.title)}
              >
                <h2>{get(`footer.${column.titleField}`, column.title)}</h2>
                <ul>
                  {links.map((link) => (
                    <li key={`${link.to}-${link.label}`}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
                {columnIndex === 0 ? (
                  <div className="footer__meta">
                    <ul className="footer__social" aria-label={t('footer.social_aria', 'Réseaux sociaux')}>
                      {SOCIALS.map((social) => {
                        const cmsHref = get(`footer.${social.field}`, '').trim()
                        const href = cmsHref || social.defaultHref
                        return (
                          <li key={social.label}>
                            <a
                              className="footer__social-btn"
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={social.label}
                              title={
                                cmsHref || !isEditMode
                                  ? social.label
                                  : `${social.label} — URL CMS vide, profil par défaut`
                              }
                            >
                              <SocialIcon network={social.network} />
                            </a>
                          </li>
                        )
                      })}
                    </ul>

                    <ul className="footer__locales" aria-label={t('footer.locales_aria', 'Langues du site')}>
                      {LOCALES.map((item, index) => {
                        const code = index === 0 ? 'fr' : index === 1 ? 'ar' : 'en'
                        return (
                          <li key={item.code}>
                            {index > 0 && <span aria-hidden="true">|</span>}
                            <button
                              type="button"
                              className={`footer__locale${locale === code ? ' footer__locale--current' : ''}`}
                              lang={code}
                              aria-pressed={locale === code}
                              onClick={() => setLocale(code as 'fr' | 'en' | 'ar')}
                              title={item.label}
                            >
                              <span aria-hidden="true">{item.code}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}
              </nav>
            )
          })}
        </div>

        <ProjectLogos cells={FOOTER_LOGOS} variant="footer" />

        <p className="footer__disclaimer">
          {get(
            'footer.disclaimer',
            'Ce site a été produit avec le soutien financier de l’Union européenne. Son contenu relève de la seule responsabilité du programme EU4Youth Tunisie et ne reflète pas nécessairement les opinions de l’Union européenne.',
          )}
        </p>
      </div>
    </CmsSection>
  )
}
