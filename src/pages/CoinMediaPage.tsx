import { Link } from 'react-router-dom'
import { NEWS as NEWS_FALLBACK } from '../data/news'
import { PUBLICATIONS as PUBLICATIONS_FALLBACK } from '../data/publications'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { locText, useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './coin-media.css'

type Video = {
  id: string | number
  youtubeId?: string
  theme?: string
  projectSlug?: string
  title?: unknown
}

const ACCESS_LINKS = [
  { n: '01', label: 'Actualités', to: '/actualites' },
  { n: '02', label: 'Publications', to: '/publications' },
  { n: '03', label: 'Agenda', to: '/agenda' },
]

const LINK_TARGETS = ['/actualites', '/publications', '/agenda', '/stories', '/contact']

function parseLinks(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    if (!list?.length) return ACCESS_LINKS
    return list.map((row, index) => {
      const rec = row as Record<string, unknown>
      const fallback = ACCESS_LINKS[index] || ACCESS_LINKS[0]
      return {
        n: String(rec.n || fallback.n),
        label: String(rec.label || fallback.label),
        to: String(rec.to || fallback.to),
      }
    })
  } catch {
    return ACCESS_LINKS
  }
}

function Pencil({
  section,
  field,
  fallback,
  label,
}: {
  section: string
  field: string
  fallback: string
  label?: string
}) {
  return (
    <EditableText
      chipOnly
      className="media-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function CoinMediaPage() {
  const { get } = useContent()
  const NEWS = useCatalog('news', NEWS_FALLBACK)
  const PUBLICATIONS = useCatalog('publications', PUBLICATIONS_FALLBACK)
  const videos = useCatalog<Video>('videos', []).filter((item) => item.youtubeId)
  const latestNews = NEWS.slice(0, 3)
  const latestResources = PUBLICATIONS.slice(0, 4)
  const links = parseLinks(get('access.items', JSON.stringify(ACCESS_LINKS)))
  const heroTitle = get('hero.title', 'COIN\nMÉDIA')
  const accessTitle = get('access.title', 'SUIVRE ET DOCUMENTER EU4YOUTH')
  const newsTitle = get('news.title', 'À LA UNE')
  const videosTitle = get('videos.title', 'FILMS ET TÉMOIGNAGES')
  const resourcesTitle = get('resources.title', 'RESSOURCES RÉCENTES')
  const pressTitle = get('press.title', 'CONTACTER L’ÉQUIPE EU4YOUTH')
  const newsMore = get('news.more', 'Toutes les actualités →')
  const newsEmpty = get('news.empty', 'Les actualités publiées apparaîtront ici.')
  const videosEmpty = get(
    'videos.empty',
    'Les films et témoignages validés apparaîtront ici dès qu’une vidéo YouTube sera publiée dans la vidéothèque.',
  )
  const resourcesMore = get('resources.more', 'Voir toute la bibliothèque →')
  const resourcesEmpty = get('resources.empty', 'Les publications récentes apparaîtront ici.')
  const downloadLabel = get('resources.download', 'Télécharger')
  const missingFile = get('resources.missingFile', 'Fichier à fournir')
  const undated = get('resources.undated', 'Non daté')
  const pressCta = get('press.cta', 'Envoyer une demande')

  return (
    <div className="page page--media">
      <CmsSection id="hero" className="media-hero" labelledBy="media-title">
        <div className="media-hero__copy">
          <p>
            <EditableText
              section="hero"
              field="badge"
              fallback="INFORMATIONS ET RESSOURCES"
              as="span"
              label="Sur-titre"
            />
          </p>
          <EditableText
            section="hero"
            field="title"
            fallback="COIN\nMÉDIA"
            as="h1"
            id="media-title"
            className="cms-break media-hero__title"
            label="Titre"
          >
            {heroTitle.split('\n').map((line, index) => (
              <span key={`${line}-${index}`}>
                {index ? <br /> : null}
                {line}
              </span>
            ))}
          </EditableText>
        </div>
        <div className="media-hero__signal" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </CmsSection>

      <CmsSection id="access" className="media-access" labelledBy="media-access-title">
        <div>
          <EditableText
            section="access"
            field="eyebrow"
            fallback="ACCÈS RAPIDE"
            as="p"
            className="media-eyebrow"
            label="Sur-titre accès"
          >
            {get('access.eyebrow', 'ACCÈS RAPIDE')}
          </EditableText>
          <EditableText
            section="access"
            field="title"
            fallback="SUIVRE ET DOCUMENTER EU4YOUTH"
            as="h2"
            id="media-access-title"
            label="Titre accès"
          >
            {accessTitle}
          </EditableText>
        </div>
        <div>
          <div className="media-edit-region">
            <EditableJsonList
              section="access"
              field="items"
              label="Raccourcis"
              className="media-list-cms"
              wrapItems={false}
              manageLabel="Gérer les raccourcis"
              fallback={ACCESS_LINKS}
              fields={[
                { key: 'n', label: 'Numéro' },
                { key: 'label', label: 'Libellé' },
                { key: 'to', label: 'Lien', options: LINK_TARGETS, multiple: false },
              ]}
              emptyItem={{ n: '04', label: '', to: '/actualites' }}
              renderItem={() => null}
            />
          </div>
          <nav aria-label="Raccourcis du coin média">
            {links.map((item) => (
              <Link key={`${item.n}-${item.to}`} to={item.to}>
                <span>{item.n}</span>
                <strong>{item.label}</strong>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </nav>
        </div>
      </CmsSection>

      <CmsSection id="news" className="media-news" labelledBy="media-news-title">
        <header>
          <div>
            <EditableText
              section="news"
              field="eyebrow"
              fallback="DERNIÈRES INFORMATIONS VÉRIFIÉES"
              as="p"
              className="media-eyebrow"
              label="Sur-titre une"
            >
              {get('news.eyebrow', 'DERNIÈRES INFORMATIONS VÉRIFIÉES')}
            </EditableText>
            <EditableText
              section="news"
              field="title"
              fallback="À LA UNE"
              as="h2"
              id="media-news-title"
              label="Titre une"
            >
              {newsTitle}
            </EditableText>
          </div>
          <Link to="/actualites">
            <EditableText
              section="news"
              field="more"
              fallback="Toutes les actualités →"
              as="span"
              multiline={false}
              label="Lien actualités"
            >
              {newsMore}
            </EditableText>
          </Link>
        </header>
        {latestNews.length ? (
          <ul>
            {latestNews.map((item, index) => (
              <li key={item.id}>
                <article>
                  <img src={assetUrl(item.image)} alt="" />
                  <div className="media-news__body">
                    <div>
                      <span>{item.project}</span>
                      <b>{item.type}</b>
                    </div>
                    <small>{String(index + 1).padStart(2, '0')}</small>
                    <h3>
                      <Link to={`/actualites/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p>{item.summary}</p>
                    <time dateTime={item.publishedAt}>{item.dateLabel}</time>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="media-empty">
            {newsEmpty}
            <Pencil section="news" field="empty" fallback={newsEmpty} label="Texte vide une" />
          </p>
        )}
      </CmsSection>

      <CmsSection id="videos" className="media-videos" labelledBy="media-videos-title">
        <header>
          <div>
            <EditableText
              section="videos"
              field="eyebrow"
              fallback="VIDÉOTHÈQUE"
              as="p"
              className="media-eyebrow"
              label="Sur-titre vidéos"
            >
              {get('videos.eyebrow', 'VIDÉOTHÈQUE')}
            </EditableText>
            <EditableText
              section="videos"
              field="title"
              fallback="FILMS ET TÉMOIGNAGES"
              as="h2"
              id="media-videos-title"
              label="Titre vidéos"
            >
              {videosTitle}
            </EditableText>
          </div>
        </header>
        {videos.length ? (
          <ul>
            {videos.map((video) => (
              <li key={String(video.id)}>
                <article>
                  <div className="media-videos__frame">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                      title={locText(video.title) || 'Vidéo EU4Youth'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p>{video.theme}</p>
                  <h3>{locText(video.title) || video.youtubeId}</h3>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="media-empty">
            {videosEmpty}
            <Pencil section="videos" field="empty" fallback={videosEmpty} label="Texte vide vidéos" />
          </p>
        )}
      </CmsSection>

      <CmsSection id="resources" className="media-resources" labelledBy="media-resources-title">
        <header>
          <div>
            <EditableText
              section="resources"
              field="eyebrow"
              fallback="DOCUMENTATION"
              as="p"
              className="media-eyebrow"
              label="Sur-titre ressources"
            >
              {get('resources.eyebrow', 'DOCUMENTATION')}
            </EditableText>
            <EditableText
              section="resources"
              field="title"
              fallback="RESSOURCES RÉCENTES"
              as="h2"
              id="media-resources-title"
              label="Titre ressources"
            >
              {resourcesTitle}
            </EditableText>
          </div>
          <Link to="/publications">
            <EditableText
              section="resources"
              field="more"
              fallback="Voir toute la bibliothèque →"
              as="span"
              multiline={false}
              label="Lien publications"
            >
              {resourcesMore}
            </EditableText>
          </Link>
        </header>
        <p className="media-filter-pencils">
          <Pencil section="resources" field="download" fallback="Télécharger" label="Télécharger" />
          <Pencil
            section="resources"
            field="missingFile"
            fallback="Fichier à fournir"
            label="Fichier manquant"
          />
          <Pencil section="resources" field="undated" fallback="Non daté" label="Non daté" />
        </p>
        {latestResources.length ? (
          <ul>
            {latestResources.map((item) => (
              <li key={item.id}>
                <article>
                  <div className="media-resource__cover">
                    {item.cover ? (
                      <img
                        src={assetUrl(item.cover)}
                        alt={`Couverture : ${item.title}`}
                        loading="lazy"
                      />
                    ) : (
                      <img src={assetUrl(`/img/logo-${item.projectSlug}.png`)} alt="" loading="lazy" />
                    )}
                  </div>
                  <div className="media-resource__body">
                    <div className="media-resource__meta">
                      <p>{item.type}</p>
                      <b>{item.year ?? undated}</b>
                    </div>
                    <h3>{item.title}</h3>
                    <strong>{item.project}</strong>
                    <span>
                      {item.language} · {item.format}
                      {item.fileSize ? ` · ${item.fileSize}` : ''}
                    </span>
                    {item.href ? (
                      <a href={item.href} download target="_blank" rel="noreferrer">
                        {downloadLabel}
                      </a>
                    ) : (
                      <em>{missingFile}</em>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="media-empty">
            {resourcesEmpty}
            <Pencil
              section="resources"
              field="empty"
              fallback={resourcesEmpty}
              label="Texte vide ressources"
            />
          </p>
        )}
      </CmsSection>

      <CmsSection id="press" className="media-contact" labelledBy="media-contact-title">
        <div>
          <EditableText
            section="press"
            field="eyebrow"
            fallback="DEMANDE MÉDIA / PRESSE"
            as="p"
            label="Sur-titre presse"
          >
            {get('press.eyebrow', 'DEMANDE MÉDIA / PRESSE')}
          </EditableText>
          <EditableText
            section="press"
            field="title"
            fallback="CONTACTER L’ÉQUIPE EU4YOUTH"
            as="h2"
            id="media-contact-title"
            label="Titre presse"
          >
            {pressTitle}
          </EditableText>
          <EditableText
            section="press"
            field="body"
            fallback="Le formulaire de contact permet de préciser le média, le projet concerné et l’objet de la demande. Aucun dossier de presse distinct n’a été fourni à ce jour."
            as="span"
            label="Texte presse"
          />
        </div>
        <Link className="btn btn--fill-white" to="/contact">
          <EditableText
            section="press"
            field="cta"
            fallback="Envoyer une demande"
            as="span"
            multiline={false}
            label="Bouton presse"
          >
            {pressCta}
          </EditableText>
        </Link>
      </CmsSection>
    </div>
  )
}
