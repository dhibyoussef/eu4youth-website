import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EditableText } from '../cms/EditableText'
import { CmsSection, EditableBackground, EditableImage } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { CountUp } from '../cms/CountUp'
import { useContent } from '../cms/ContentProvider'
import { useEditMode } from '../cms/EditModeProvider'
import HeroCarousel from '../components/HeroCarousel'
import ProjectLogos from '../components/ProjectLogos'
import { BAND_LOGOS } from '../data/logos'
import {
  FormSubmissionError,
  isPublicFormConfigured,
  submitPublicForm,
} from '../lib/forms'
import {
  CHIFFRES,
  HERO,
  MAP_BAND,
  NEWSLETTER,
  PUBLICATIONS,
  SIX_PROJETS,
  STORIES,
  STREAMS,
  type Stream,
  type StreamCard,
} from '../data/home'
import './home.css'

const rem = (designPx: number) => `${designPx / 10}rem`

function withoutBudgetKpi<T extends { label?: string }>(items: T[]): T[] {
  return items.filter((item) => {
    const label = String(item.label || '')
      .replace(/\s+/g, ' ')
      .trim()
    return !/^(BUDGET(\s+TOTAL|\s+GLOBAL)?|TOTAL\s+BUDGET|الميزانية(\s*الإجمالية)?)$/i.test(label)
  })
}

const HERO_SLIDES = [
  { fallback: '/img/home-hero-v2.webp', label: 'Jeunes en activité 1' },
  { fallback: '/img/home-hero-v2.webp', label: 'Jeunes en activité 2' },
  { fallback: '/img/home-hero-v2.webp', label: 'Jeunes en activité 3' },
  { fallback: '/img/home-hero-v2.webp', label: 'Jeunes en activité 4' },
  { fallback: '/img/home-hero-v2.webp', label: 'Jeunes en activité 5' },
] as const

/** Publish a stream's thematic colour so its CSS can style every state from it. */
const accented = (accent: string, rest: React.CSSProperties = {}) =>
  ({ ...rest, '--accent': accent }) as React.CSSProperties

/** Double chevron drawn on the "voir tout" CTAs. */
/* Traced off the comp: the pair occupies 28 x 26 design px, each chevron rises
   10.5px to its apex at the vertical centre, the two sit 13px apart, and the
   stroke is 4.4px with round caps and joins. */
function DoubleChevron({ className = 'chev2' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 26" aria-hidden="true" focusable="false">
      <path
        d="M2.2 2.2 L12.7 13 L2.2 23.8 M15.2 2.2 L25.7 13 L15.2 23.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** One fact in a card's footer: the comp sets a small mark and then the value. */
function Fact({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className={`card__fact card__fact--${icon}`}>
      <img src={`/img/icon-${icon}.png`} alt="" aria-hidden="true" />
      <span className="card__fact-value">{children}</span>
    </span>
  )
}

function StreamCardView({
  card,
  stream,
  top,
}: {
  card: StreamCard
  stream: Stream
  top: number
}) {
  const { variant, accent } = stream
  const place = card.location && (
    <Fact icon={variant === 'event' ? 'pin-teal' : 'pin-pink'}>{card.location}</Fact>
  )
  const when = (
    <Fact icon="calendar">{card.date}</Fact>
  )

  return (
    <article
      className={`card card--${variant}`}
      style={accented(accent, { left: rem(stream.x.card), top: rem(top) })}
    >
      <img className="card__thumb" src={card.thumb} alt="" />

      <div className="card__head">
        <div className="card__titles">
          <h3 className="card__title">{card.title}</h3>
          <p className="card__meta">{card.meta}</p>
        </div>
        {card.logo ? <img className="card__logo" src={`/img/logo-${card.logo}.png`} alt="" /> : null}
      </div>

      <span className="card__rule" />
      <p className="card__body">{card.body}</p>
      {variant === 'opportunity' && <span className="card__rule" />}

      <div className="card__foot">
        {variant === 'event' ? (
          <>
            {place}
            {when}
          </>
        ) : (
          <>
            {when}
            {place}
          </>
        )}
        {card.action ? (
          <Link to={card.to ?? stream.to} className="card__btn">
            {card.action}
          </Link>
        ) : null}
      </div>
    </article>
  )
}

function NewsletterForm() {
  const [phase, setPhase] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [status, setStatus] = useState('')
  const wireReady = isPublicFormConfigured('newsletter')
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const placeholder = get('newsletter.placeholder', NEWSLETTER.placeholder)
  const submitLabel = get('newsletter.submit', NEWSLETTER.submit)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity() || phase === 'submitting') return

    const form = event.currentTarget
    const data = new FormData(form)
    setPhase('submitting')
    setStatus('Inscription en cours…')

    try {
      await submitPublicForm('newsletter', {
        email: String(data.get('email') ?? ''),
        website: String(data.get('website') ?? ''),
      })
      form.reset()
      setPhase('success')
      setStatus('Votre inscription à la newsletter est confirmée.')
    } catch (error) {
      setPhase('error')
      if (
        error instanceof FormSubmissionError &&
        (error.code === 'unconfigured' || error.code === 'invalid-endpoint')
      ) {
        setStatus(
          'Le service d’abonnement n’est pas encore connecté. Aucune adresse n’a été enregistrée.',
        )
      } else {
        setStatus(
          'Une erreur temporaire empêche l’inscription. Veuillez réessayer dans quelques instants.',
        )
      }
    }
  }

  return (
    <form
      className="news__form"
      onSubmit={submit}
      aria-describedby={!wireReady ? 'news-wire-note' : undefined}
    >
      <label className="form-trap" aria-hidden="true">
        Ne pas remplir ce champ
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <span className="news__field-edit">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {isEditMode ? (
          <EditableText
            section="newsletter"
            field="placeholder"
            fallback={NEWSLETTER.placeholder}
            chipOnly
            className="news__field-pencil"
            label="Texte du champ e-mail"
          />
        ) : null}
      </span>
      <span className="home-btn-edit news__submit-edit">
        <button
          type="submit"
          className="btn btn--fill-blue"
          disabled={!isEditMode && phase === 'submitting'}
        >
          {phase === 'submitting' && !isEditMode ? 'Inscription…' : submitLabel}
        </button>
        {isEditMode ? (
          <EditableText
            section="newsletter"
            field="submit"
            fallback={NEWSLETTER.submit}
            chipOnly
            label="Bouton d’inscription"
          />
        ) : null}
      </span>
      {!wireReady && !status ? (
        <p id="news-wire-note" className="news__status news__status--wire" role="status">
          Inscription prête — service d’abonnement à connecter.
        </p>
      ) : (
        <p
          className={`news__status news__status--${phase}`}
          role={phase === 'error' ? 'alert' : 'status'}
        >
          {status}
        </p>
      )}
    </form>
  )
}

export default function HomePage() {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const actions = HERO.actions.map((action, index) => ({
    ...action,
    label: get(
      index === 0 ? 'hero.ctaProjects' : index === 1 ? 'hero.ctaOpportunities' : 'hero.ctaMap',
      action.label,
    ),
  }))
  return (
    <div className="page page--home" data-cms-page="home">
      {/* ---------------- Hero: design band 277 → 1330 ---------------- */}
      <CmsSection id="hero" className="band band--hero">
        <HeroCarousel
          slideDefs={HERO_SLIDES}
          ariaLabel="Photographie d’accueil"
          artClassName="band__art hero__slide-img"
        />
        <div className="hero__copy">
          <div className="hero__intro">
            <EditableText section="hero" field="badge" fallback={HERO.badge} as="p" className="hero__badge"
              render={(text) => <span>{text}</span>}
            />
            <EditableText
              section="hero"
              field="title"
              fallback={HERO.headline.join('\n')}
              as="h1"
              className="hero__title"
              label="Titre"
              render={(text) =>
                (text.split('\n').filter(Boolean).length
                  ? text.split('\n').filter(Boolean)
                  : HERO.headline
                ).map((line) => <span key={line}>{line}</span>)
              }
            />
          </div>
          <div className="hero__actions">
            {actions.map((action, index) => {
              const field = index === 0 ? 'ctaProjects' : index === 1 ? 'ctaOpportunities' : 'ctaMap'
              return (
                <span key={action.to} className="hero__action">
                  <span className="home-btn-edit">
                    <Link
                      to={action.to}
                      className="btn hero__btn btn--photo-line"
                    >
                      {action.label}
                    </Link>
                    {isEditMode ? (
                      <EditableText
                        chipOnly
                        section="hero"
                        field={field}
                        fallback={HERO.actions[index].label}
                        label={action.label}
                      />
                    ) : null}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      </CmsSection>

      {/* ------------- EU4Youth en chiffres: 1330 → 2175 ------------- */}
      <CmsSection id="chiffres" className="band band--chiffres" labelledBy="chiffres-title">
        <EditableText
          section="chiffres"
          field="title"
          fallback={CHIFFRES.title}
          as="h2"
          id="chiffres-title"
          className="chiffres__title"
          label="Titre"
        />
        <p className="chiffres__period">
          <EditableText section="chiffres" field="period" fallback={CHIFFRES.period} as="span" />
        </p>
        <EditableJsonList
          section="chiffres"
          field="items"
          label="EU4Youth en chiffres"
          className="chiffres__kpis"
          wrapItems={false}
          manageLabel="Gérer les chiffres"
          filterItems={withoutBudgetKpi}
          fallback={CHIFFRES.kpis.map((kpi) => ({
            value: kpi.value,
            label: Array.isArray(kpi.label) ? kpi.label.join(' ') : kpi.label,
            to: kpi.to,
            cx: String(kpi.cx),
          }))}
          fields={[
            { key: 'value', label: 'Chiffre (le compteur s’arrête ici)' },
            { key: 'label', label: 'Libellé' },
            { key: 'to', label: 'Lien' },
          ]}
          emptyItem={{ value: '0', label: 'NOUVEAU', to: '/', cx: '160' }}
          renderItem={(kpi) => (
            <div className="kpi">
              <Link to={kpi.to || '/'} aria-label={`${kpi.value} ${kpi.label}`}>
                <dd className="kpi__value">
                  <CountUp value={String(kpi.value)} />
                </dd>
                <dt className="kpi__label">{kpi.label}</dt>
              </Link>
            </div>
          )}
        />
      </CmsSection>

      {/* ----------------- Six projets: 2175 → 3040 ----------------- */}
      <CmsSection id="projets" className="band band--projets" labelledBy="projets-title">
        <EditableText
          section="projets"
          field="title"
          fallback={SIX_PROJETS.title}
          as="h2"
          id="projets-title"
          className="projets__title"
          label="Titre"
        />
        <p className="projets__subtitle">
          <EditableText section="projets" field="subtitle" fallback={SIX_PROJETS.subtitle} as="span" />
        </p>
        <p className="projets__body">
          <EditableText section="projets" field="body" fallback={SIX_PROJETS.body} as="span" />
        </p>

        <ProjectLogos cells={BAND_LOGOS} />
        <EditableJsonList
          section="projets"
          field="logos"
          label="Logos des six projets"
          className="projets__logo-list"
          wrapItems={false}
          manageLabel="Gérer les logos"
          fallback={BAND_LOGOS.map((cell) => ({
            slug: cell.slug,
            name: cell.name,
            image: `/img/logo-${cell.slug}.png`,
          }))}
          fields={[
            { key: 'slug', label: 'Identifiant' },
            { key: 'name', label: 'Nom' },
            { key: 'image', label: 'Image couleur (URL)' },
          ]}
          emptyItem={{ slug: 'nouveau', name: 'Nouveau projet', image: '/img/logo-jeuness.png' }}
          renderItem={() => null}
        />
      </CmsSection>

      {/* ------------- Partout en Tunisie: 3040 → 4057 -------------- */}
      <CmsSection id="map" className="band band--map" labelledBy="map-title">
        <EditableImage section="map" field="image" fallback="/img/map-no-icon.png" className="map__art" />
        <EditableText
          section="map"
          field="title"
          fallback={MAP_BAND.title}
          as="h2"
          id="map-title"
          className="map__title"
          label="Titre"
        />
        <EditableText
          section="map"
          field="subtitle"
          fallback={MAP_BAND.subtitle}
          as="p"
          className="map__subtitle"
        />
        <div className="map__body">
          <EditableText
            section="map"
            field="body"
            fallback={MAP_BAND.paragraphs.join('\n\n')}
            as="div"
            className="map__body-text"
          />
          <span className="home-btn-edit home-btn-edit--map">
            <Link to={MAP_BAND.action.to} className="btn btn--fill-white map__btn">
              {get('map.cta', MAP_BAND.action.label)}
              <DoubleChevron />
            </Link>
            {isEditMode ? (
              <EditableText
                chipOnly
                section="map"
                field="cta"
                fallback={MAP_BAND.action.label}
                label="Bouton carte"
              />
            ) : null}
          </span>
        </div>
      </CmsSection>

      {/* --- Opportunités / actualités / événements: 4057 → 6010 ---- */}
      <CmsSection id="streams" className="band band--streams">
        {STREAMS.map((stream) => (
          /* Named so the narrow-viewport rules can treat one stream as a unit. At
             the design width it groups without styling, since everything inside is
             placed by its own measured coordinate. */
          <div className={`stream stream--${stream.variant}`} key={stream.variant}>
            <span className="stream__wrap" style={{ left: rem(stream.x.wrap) }} />

            {(() => {
              const headingKey =
                stream.variant === 'opportunity'
                  ? 'opportunitiesTitle'
                  : stream.variant === 'news'
                    ? 'newsTitle'
                    : 'eventsTitle'
              const raw = get(`streams.${headingKey}`, stream.heading.join('\n'))
              const parsed = raw.split('\n').map((line) => line.trim()).filter(Boolean)
              return (
            <EditableText
              section="streams"
              field={headingKey}
              fallback={stream.heading.join('\n')}
              as="h2"
              className="stream__heading"
              label={stream.heading.join(' ')}
              style={{ left: rem(stream.x.heading) }}
              render={(text) => {
                const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
                const headingLines = lines.length ? lines : [...stream.heading]
                return headingLines.map((line, index) => (
                  <span key={`${line}-${index}`} style={{ color: stream.headingColors[index] || stream.headingColors[0] }}>
                    {line}
                  </span>
                ))
              }}
            />
              )
            })()}

            <EditableJsonList
              section="streams"
              field={`${stream.variant}Cards`}
              label={stream.heading.join(' ')}
              className="stream__list"
              wrapItems={false}
              manageLabel="Gérer les cartes"
              fallback={stream.cards.map((card) => ({
                title: card.title,
                meta: card.meta,
                body: card.body,
                date: card.date,
                location: card.location || '',
                action: card.action || '',
                to: card.to || '',
                logo: card.logo || '',
                thumb: card.thumb,
              }))}
              fields={[
                { key: 'title', label: 'Titre' },
                { key: 'meta', label: 'Catégorie' },
                { key: 'body', label: 'Texte', multiline: true },
                { key: 'date', label: 'Date' },
                { key: 'location', label: 'Lieu' },
                { key: 'action', label: 'Bouton' },
                { key: 'to', label: 'Lien' },
                { key: 'thumb', label: 'Image' },
                { key: 'logo', label: 'Logo (slug)' },
              ]}
              emptyItem={{
                title: 'Nouvelle carte',
                meta: '',
                body: '',
                date: '',
                location: '',
                action: '',
                to: stream.to,
                logo: '',
                thumb: '/img/photo-entretien.webp',
              }}
              renderItem={(card, index) =>
                index === 0 ? (
                <StreamCardView
                  card={card as StreamCard}
                  stream={stream}
                  top={387.1}
                />
                ) : null
              }
            />

            {(() => {
              const ctaFallback = stream.cta
                .map((line, index) => get(`streams.${stream.variant}Cta${index}`, line))
                .join(' ')
              const ctaLabel = get(`streams.${stream.variant}Cta`, ctaFallback)
              return (
                <span
                  className="home-btn-edit home-btn-edit--stream"
                  style={accented(stream.accent, { left: rem(stream.x.cta) })}
                >
                  <Link to={stream.to} className="stream__cta">
                    {ctaLabel}
                    <DoubleChevron />
                  </Link>
                  {isEditMode ? (
                    <EditableText
                      chipOnly
                      section="streams"
                      field={`${stream.variant}Cta`}
                      fallback={ctaFallback}
                      label="Bouton de la colonne"
                    />
                  ) : null}
                </span>
              )
            })()}
          </div>
        ))}
      </CmsSection>

      {/* --------------- Youth portraits: 6010 → 7180 --------------- */}
      <CmsSection id="stories" className="band band--stories" labelledBy="stories-eyebrow">
        <EditableImage
          section="stories"
          field="collage"
          fallback="/img/stories-collage-transparent.png"
          className="stories__collage"
          alt=""
          movable
        />
        <p className="stories__eyebrow" id="stories-eyebrow">
          <EditableText section="stories" field="eyebrow" fallback={STORIES.eyebrow} as="span" />
        </p>
        <EditableText
          section="stories"
          field="title"
          fallback={STORIES.headline.join('\n')}
          as="h2"
          className="stories__title"
          label="Titre"
          render={(text) => {
            const lines = text.split('\n').filter(Boolean)
            return (lines.length ? lines : STORIES.headline).map((line) => (
              <span key={line}>{line}</span>
            ))
          }}
        />
        <span className="home-btn-edit home-btn-edit--stories">
          <Link to={STORIES.action.to} className="btn btn--line-white stories__btn">
            {get('stories.cta', STORIES.action.label)}
            <DoubleChevron />
          </Link>
          {isEditMode ? (
            <EditableText
              chipOnly
              section="stories"
              field="cta"
              fallback={STORIES.action.label}
              label="Bouton stories"
            />
          ) : null}
        </span>
      </CmsSection>

      <div className="band band--gap" />

      {/* ---------- Ressources et publications: 7353 → 8600 --------- */}
      <CmsSection id="publications" className="band band--publications" labelledBy="pubs-title">
        <EditableImage
          section="publications"
          field="books"
          fallback="/img/art-pile-livres.webp"
          className="pubs__books"
          alt=""
        />
        <EditableText
          section="publications"
          field="title"
          fallback={PUBLICATIONS.title.join('\n')}
          as="h2"
          id="pubs-title"
          className="pubs__title"
          label="Titre"
          render={(text) => {
            const lines = text.split('\n').filter(Boolean)
            return (lines.length ? lines : PUBLICATIONS.title).map((line) => (
              <span key={line}>{line}</span>
            ))
          }}
        />
        <p className="pubs__body">
          <EditableText section="publications" field="body" fallback={PUBLICATIONS.body} as="span" />
        </p>
        <span className="home-btn-edit home-btn-edit--pubs">
          <Link to={PUBLICATIONS.action.to} className="btn btn--line-white pubs__btn">
            {get('publications.cta', PUBLICATIONS.action.label)}
          </Link>
          {isEditMode ? (
            <EditableText
              chipOnly
              section="publications"
              field="cta"
              fallback={PUBLICATIONS.action.label}
              label="Bouton publications"
            />
          ) : null}
        </span>
      </CmsSection>

      {/* ----------------- Newsletter: 8600 → 9480 ------------------ */}
      <CmsSection id="newsletter" className="band band--newsletter" labelledBy="news-title">
        <div className="news__copy">
          <EditableText
            section="newsletter"
            field="title"
            fallback={NEWSLETTER.title}
            as="h2"
            id="news-title"
            className="news__title"
            label="Titre"
          />
          <EditableText
            section="newsletter"
            field="body"
            fallback={NEWSLETTER.body}
            as="p"
            className="news__body"
          />
          <NewsletterForm />
          <EditableText
            section="newsletter"
            field="legal"
            fallback={NEWSLETTER.legal}
            as="p"
            className="news__legal"
          />
        </div>
        <EditableBackground
          section="newsletter"
          field="collage"
          fallback="/img/home-newsletter.jpg"
          className="news__collage-wrap"
        />
      </CmsSection>
    </div>
  )
}
