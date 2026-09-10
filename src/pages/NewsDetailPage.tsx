import { Link, Navigate, useParams } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ShareActions from '../components/ShareActions'
import {
  NEWS as NEWS_FALLBACK,
  listingNews,
  type NewsArticle,
} from '../data/news'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { useCatalogQuery, asList } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { useEditMode } from '../cms/EditModeProvider'
import { assetUrl } from '../lib/assetUrl'
import './content-detail.css'

const SOURCE_FILES: Record<string, string> = {
  'go4youth-nl11-avril-2026': '/docs/go4youth/newsletter-11-avril-2026.pdf',
  'go4youth-nl10-decembre-2025': '/docs/go4youth/newsletter-10-decembre-2025.pdf',
  'go4youth-nl8-mai-2025': '/docs/go4youth/newsletter-8-mai-2025.pdf',
  'go4youth-nl7-janvier-2025': '/docs/go4youth/newsletter-7-janvier-2025.pdf',
  'go4youth-nl6-septembre-2024': '/docs/go4youth/newsletter-6-septembre-2024.pdf',
  'go4youth-nl5-juin-2024': '/docs/go4youth/newsletter-5-juin-2024.pdf',
  'go4youth-nl4-mars-2024': '/docs/go4youth/newsletter-4-mars-2024.pdf',
  'go4youth-nl2-juin-2023': '/docs/go4youth/newsletter-2-juin-2023.pdf',
}

function Pencil({ field, fallback, label }: { field: string; fallback: string; label: string }) {
  return (
    <EditableText
      chipOnly
      className="content-detail__pencil"
      section="fiche"
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

const articleParagraphs = (
  article: NewsArticle & { body?: string },
  copy: { fromSource: string; verified: string; carriedBy: string; themes: string },
) => {
  const body = String(article.body ?? '').trim()
  if (body) {
    return body
      .split(/\n{2,}|\n/)
      .map((para) => para.trim())
      .filter(Boolean)
  }

  const themes = asList(article.themes).join(', ')
  const locations = asList(article.locations).join(', ')
  return [
    article.summary,
    article.source ? `${copy.fromSource} ${article.source}.` : copy.verified,
    `${copy.carriedBy} ${article.project} — ${article.type}` +
      `${themes ? ` · ${copy.themes}: ${themes}` : ''}` +
      `${locations ? ` · ${locations}.` : '.'}`,
  ]
}

export default function NewsDetailPage() {
  const { slug } = useParams()
  const { get } = useContent()
  const { items: catalog, ready } = useCatalogQuery('news', NEWS_FALLBACK)
  const { locale } = useEditMode()
  // Prefer live catalogue (locale-flattened). Do not fall back to the French
  // static list — that overwrote EN/AR titles on detail pages.
  const NEWS = listingNews(get('browser.items', '[]'), catalog)
  const listed = NEWS.find((item) => item.slug === slug)
  const fromCatalog = catalog.find((item) => item.slug === slug) as (NewsArticle & { body?: string }) | undefined
  const article = listed
    ? ({ ...fromCatalog, ...listed, body: fromCatalog?.body } as NewsArticle & { body?: string })
    : fromCatalog
  if (!ready && !article) return null
  if (!article) return <Navigate to="/actualites" replace />

  const related = NEWS.filter(
    (item) => item.id !== article.id && item.projectSlug === article.projectSlug,
  ).slice(0, 3)
  const sourceHref = SOURCE_FILES[article.id]
  const pathname = `/actualites/${article.slug}`
  const sourceTitle = get('fiche.sourceTitle', 'Source vérifiée')
  const sourceLead = get('fiche.sourceLead', 'Cette fiche restitue les informations publiées dans')
  const sourceCta = get('fiche.sourceCta', 'Consulter la publication source')
  const dtProject = get('fiche.dtProject', 'Projet associé')
  const dtThemes = get('fiche.dtThemes', 'Thématiques')
  const dtTerritory = get('fiche.dtTerritory', 'Territoire')
  const dtType = get('fiche.dtType', 'Type d’actualité')
  const relatedTitle = get('fiche.related', 'À lire aussi')
  const paragraphs = articleParagraphs(article, {
    fromSource: get('fiche.bodyFromSource', 'Cette actualité reprend les éléments publiés dans'),
    verified: get(
      'fiche.bodyVerified',
      'Cette fiche actualité restitue les informations vérifiées du programme EU4Youth.',
    ),
    carriedBy: get('fiche.bodyCarriedBy', 'Portée par le projet'),
    themes: get('fiche.bodyThemes', 'thématiques'),
  })

  return (
    <div className="page content-detail content-detail--news">
      <PageMeta
        title={article.title}
        description={article.summary}
        pathname={pathname}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.summary,
          datePublished: article.publishedAt,
          image: `https://eu4youth.org${article.image}`,
          inLanguage: locale,
          mainEntityOfPage: `https://eu4youth.org${pathname}`,
          publisher: {
            '@type': 'Organization',
            name: 'EU4Youth Tunisie',
            url: 'https://eu4youth.org',
          },
        }}
      />
      <CmsSection id="fiche" className="content-detail__shell">
        <header
          className="content-detail__hero content-detail__hero--photo"
          style={{ backgroundImage: `url(${assetUrl(article.image)})` }}
        >
          <p className="content-detail__edit-row">
            <Link className="content-detail__back" to="/actualites">
              <EditableText
                section="fiche"
                field="back"
                fallback="← Toutes les actualités"
                as="span"
                multiline={false}
                label="Retour"
              />
            </Link>
          </p>
          <h1>{article.title}</h1>
          <div className="content-detail__when">
            <img src={assetUrl('/img/icon-calendar.png')} alt="" aria-hidden="true" />
            <time dateTime={article.publishedAt}>{article.dateLabel}</time>
          </div>
          <img
            className="content-detail__hero-mark"
            src={assetUrl(`/img/logo-${article.projectSlug}-white.webp`)}
            alt=""
          />
        </header>

        <div className="content-detail__layout content-detail__layout--full">
          <article className="content-detail__article news-article">
            <div className="news-article__block news-article__block--figure-left">
              <figure className="news-article__figure">
                <img src={assetUrl(article.image)} alt="" />
              </figure>
              <p className="content-detail__lead">{paragraphs[0]}</p>
            </div>

            {paragraphs.slice(1, 2).map((para) => (
              <div key={para.slice(0, 24)} className="news-article__block news-article__block--full">
                <p className="content-detail__body">{para}</p>
              </div>
            ))}

            {paragraphs.slice(2).map((para) => (
              <div
                key={para.slice(0, 24)}
                className="news-article__block news-article__block--figure-right"
              >
                <figure className="news-article__figure">
                  <img src={assetUrl(article.image)} alt="" />
                </figure>
                <p className="content-detail__body">{para}</p>
              </div>
            ))}

            <div className="content-detail__source">
              <h2>
                {sourceTitle}
                <Pencil field="sourceTitle" fallback="Source vérifiée" label="Titre source" />
              </h2>
              <p>
                {sourceLead} <strong>{article.source}</strong>.
                <Pencil
                  field="sourceLead"
                  fallback="Cette fiche restitue les informations publiées dans"
                  label="Texte source"
                />
              </p>
              {sourceHref ? (
                <p className="content-detail__edit-row">
                  <a
                    className="btn btn--fill-blue"
                    href={sourceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sourceCta}
                  </a>
                  <Pencil
                    field="sourceCta"
                    fallback="Consulter la publication source"
                    label="Bouton source"
                  />
                </p>
              ) : null}
            </div>
            <dl className="content-detail__facts">
              <div>
                <dt>
                  {dtProject}
                  <Pencil field="dtProject" fallback="Projet associé" label="Projet" />
                </dt>
                <dd>
                  <Link to={`/projets/${article.projectSlug}`}>{article.project}</Link>
                </dd>
              </div>
              <div>
                <dt>
                  {dtThemes}
                  <Pencil field="dtThemes" fallback="Thématiques" label="Thématiques" />
                </dt>
                <dd>{asList(article.themes).join(' · ')}</dd>
              </div>
              <div>
                <dt>
                  {dtTerritory}
                  <Pencil field="dtTerritory" fallback="Territoire" label="Territoire" />
                </dt>
                <dd>{asList(article.locations).join(' · ')}</dd>
              </div>
              <div>
                <dt>
                  {dtType}
                  <Pencil field="dtType" fallback="Type d’actualité" label="Type" />
                </dt>
                <dd>{article.type}</dd>
              </div>
            </dl>
            <ShareActions title={article.title} pathname={pathname} />
          </article>

          {related.length > 0 ? (
            <aside className="content-detail__related content-detail__related--band">
              <h2>
                {relatedTitle}
                <Pencil field="related" fallback="À lire aussi" label="À lire aussi" />
              </h2>
              <ul>
                {related.map((item) => (
                  <li key={item.id}>
                    <Link to={`/actualites/${item.slug}`}>
                      <time dateTime={item.publishedAt}>{item.dateLabel}</time>
                      <strong>{item.title}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </CmsSection>
    </div>
  )
}
