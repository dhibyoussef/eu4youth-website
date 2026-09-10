import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useContent } from '../cms/ContentProvider'
import { COOKIE_RESET_EVENT } from '../cms/CookieBanner'
import {
  ACCESSIBILITY_CHAPTERS,
  COOKIES_CHAPTERS,
  LEGAL_CHAPTERS,
  PRIVACY_CHAPTERS,
  type LegalChapter,
} from '../data/legalFallbacks'
import './legal-pending.css'

export type LegalPageKind = 'privacy' | 'legal' | 'accessibility' | 'cookies'

type Chapter = LegalChapter

const KIND = {
  privacy: {
    mark: '01',
    badge: 'PROTECTION DES DONNÉES',
    title: 'POLITIQUE DE CONFIDENTIALITÉ',
    introKicker: 'DOCUMENT LÉGAL',
    introTitle: 'Comment ce site utilise vos données',
    introBody:
      'Cette politique décrit les données personnelles collectées sur le site public EU4Youth Tunisie, pourquoi elles sont utilisées et quels sont vos droits. L’éditeur peut préciser ici l’identité juridique complète du responsable de traitement.',
    toc: 'SOMMAIRE',
    nav: 'Sommaire de la politique',
    chapters: PRIVACY_CHAPTERS,
  },
  legal: {
    mark: '02',
    badge: 'INFORMATIONS LÉGALES',
    title: 'MENTIONS LÉGALES',
    introKicker: 'DOCUMENT LÉGAL',
    introTitle: 'Éditeur, hébergement et conditions d’usage',
    introBody:
      'Ces mentions identifient le site public du programme EU4Youth Tunisie. Les champs d’identification formelle (forme juridique, représentant, hébergeur nommé) restent modifiables dans le CMS dès confirmation par l’éditeur.',
    toc: 'SOMMAIRE',
    nav: 'Sommaire des mentions légales',
    chapters: LEGAL_CHAPTERS,
  },
  accessibility: {
    mark: '03',
    badge: 'ACCÈS AU SERVICE',
    title: 'ACCESSIBILITÉ',
    introKicker: 'DOCUMENT LÉGAL',
    introTitle: 'État d’accessibilité de ce site',
    introBody:
      'EU4Youth Tunisie vise un site utilisable par le plus grand nombre. Cette déclaration décrit l’engagement, le niveau de conformité actuel et la manière de signaler un obstacle. Elle sera mise à jour après un audit formel.',
    toc: 'SOMMAIRE',
    nav: 'Sommaire de la déclaration d’accessibilité',
    chapters: ACCESSIBILITY_CHAPTERS,
  },
  cookies: {
    mark: '04',
    badge: 'TRACEURS ET PRÉFÉRENCES',
    title: 'GESTION DES COOKIES',
    introKicker: 'DOCUMENT LÉGAL',
    introTitle: 'Ce que ce site enregistre sur votre appareil',
    introBody:
      'Le bandeau cookies permet d’accepter ou de refuser les traceurs non indispensables. Cette page décrit les enregistrements réellement utilisés par le site public et comment modifier votre choix.',
    toc: 'SOMMAIRE',
    nav: 'Sommaire de la gestion des cookies',
    chapters: COOKIES_CHAPTERS,
  },
} as const

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
      className="legal-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

function parseChapters(raw: string, fallback: Chapter[]): Chapter[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    if (!list?.length) return fallback
    return list.map((row, index) => {
      const item = row as Record<string, unknown>
      const title = String(item.title || '')
      const id =
        String(item.id || '').trim() ||
        title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') ||
        `chapitre-${index + 1}`
      return {
        id,
        number: String(item.number || String(index + 1).padStart(2, '0')),
        title,
        body: String(item.body ?? ''),
      }
    })
  } catch {
    return fallback
  }
}

export default function LegalPendingPage({ kind }: { kind: LegalPageKind }) {
  const { get } = useContent()
  const copy = KIND[kind]
  const heroTitle = get('hero.title', copy.title)
  const chapters = useMemo(
    () => parseChapters(get('chapters.items', JSON.stringify(copy.chapters)), [...copy.chapters]),
    [copy.chapters, get],
  )
  const rows = chapters.length ? chapters : [...copy.chapters]
  const nav = get('intro.nav', copy.nav)
  const home = get('actions.home', 'Retour à l’accueil')
  const contact = get('actions.contact', 'Nous contacter')

  return (
    <div className="page page--legal-pending page--legal-document">
      <CmsSection id="hero" className="legal-hero" labelledBy="legal-title">
        <p className="legal-eyebrow">
          <EditableText section="hero" field="badge" fallback={copy.badge} as="span" label="Sur-titre" />
        </p>
        <EditableText
          section="hero"
          field="title"
          fallback={copy.title}
          as="h1"
          id="legal-title"
          className="legal-hero__title"
          label="Titre"
        >
          {heroTitle.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {index ? <br /> : null}
              {line}
            </span>
          ))}
        </EditableText>
      </CmsSection>

      <CmsSection id="intro" className="legal-document__intro" labelledBy="legal-intro-title">
        <p>
          <EditableText section="intro" field="kicker" fallback={copy.introKicker} as="span" label="Sur-titre" />
        </p>
        <EditableText
          section="intro"
          field="title"
          fallback={copy.introTitle}
          as="h2"
          id="legal-intro-title"
          className="legal-intro__title"
          label="Titre"
        />
        <EditableText section="intro" field="body" fallback={copy.introBody} as="p" label="Chapô" />
        {kind === 'cookies' ? (
          <p>
            <button
              type="button"
              className="btn btn--line-pink"
              onClick={() => window.dispatchEvent(new Event(COOKIE_RESET_EVENT))}
            >
              Modifier mes préférences
            </button>
          </p>
        ) : null}
      </CmsSection>

      <CmsSection id="chapters" className="legal-document__layout" labelledBy="legal-chapters-title">
        <h2 id="legal-chapters-title" className="sr-only">
          Rubriques du document
        </h2>
        <div className="legal-edit-region">
          <EditableJsonList
            section="chapters"
            field="items"
            label="Rubriques"
            className="legal-list-cms"
            wrapItems={false}
            manageLabel="Gérer la liste"
            fallback={[...copy.chapters]}
            fields={[
              { key: 'id', label: 'Ancre' },
              { key: 'number', label: 'Numéro' },
              { key: 'title', label: 'Titre' },
              { key: 'body', label: 'Texte', multiline: true },
            ]}
            emptyItem={{ id: '', number: '', title: '', body: '' }}
            renderItem={() => null}
          />
        </div>
        <nav className="legal-document__toc" aria-label={nav}>
          <p>
            <EditableText section="intro" field="toc" fallback={copy.toc} as="span" label="Sommaire" />
          </p>
          <span className="legal-toc-nav-edit">
            <Pencil section="intro" field="nav" fallback={copy.nav} label="Intitulé du sommaire" />
          </span>
          <ol>
            {rows.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span>{section.number}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal-document__body">
          {rows.map((section) => (
            <section id={section.id} key={section.id}>
              <span aria-hidden="true">{section.number}</span>
              <div>
                <h2>{section.title}</h2>
                <div className="legal-document__slot">
                  <p>{section.body}</p>
                </div>
              </div>
            </section>
          ))}
        </article>
      </CmsSection>

      <CmsSection id="actions" className="legal-actions" labelledBy="legal-actions-title">
        <h2 id="legal-actions-title" className="sr-only">
          Navigation
        </h2>
        <div className="legal-btn-edit">
          <Link className="btn btn--fill-blue" to="/">
            {home}
          </Link>
          <Pencil section="actions" field="home" fallback="Retour à l’accueil" label="Accueil" />
        </div>
        <div className="legal-btn-edit">
          <Link className="btn btn--line-pink" to="/contact">
            {contact}
          </Link>
          <Pencil section="actions" field="contact" fallback="Nous contacter" label="Contact" />
        </div>
      </CmsSection>
    </div>
  )
}
