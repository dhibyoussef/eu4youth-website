import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GLOSSARY_CATEGORIES as GLOSSARY_FALLBACK } from '../data/glossary'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import './glossaire.css'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const HERO_TITLE = 'GLOSSAIRE'

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleUpperCase('fr')

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
      className="gloss-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function GlossairePage() {
  const { get } = useContent()
  const GLOSSARY_CATEGORIES = useCatalog('glossary', GLOSSARY_FALLBACK)
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('recherche') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [categoryId, setCategoryId] = useState('')
  const [openTerm, setOpenTerm] = useState('')

  const heroTitle = get('hero.title', HERO_TITLE)
  const allF = get('browser.allF', 'Toutes')
  const searchLabel = get('browser.search', 'Rechercher un terme')
  const searchPlaceholder = get('browser.placeholder', 'Rechercher un terme')
  const oneLabel = get('browser.one', 'terme')
  const manyLabel = get('browser.many', 'termes')
  const resetLabel = get('browser.reset', 'Effacer le filtre')
  const emptyTitle = get('browser.empty', 'Aucun terme ne correspond à votre recherche.')
  const emptyCta = get('browser.emptyCta', 'Réinitialiser la recherche')

  const entries = useMemo(
    () =>
      GLOSSARY_CATEGORIES.flatMap((category) =>
        category.entries.map((entry) => ({
          ...entry,
          categoryId: category.id,
          category: category.label,
          color: category.color,
          id: `${category.id}-${entry.term}`,
        })),
      ),
    [GLOSSARY_CATEGORIES],
  )

  useEffect(() => {
    const needle = normalize(initialQuery.trim())
    if (!needle) return
    const exact = entries.find((entry) => normalize(entry.term) === needle)
    const partial = exact ?? entries.find((entry) => normalize(entry.term).includes(needle))
    if (partial) {
      setOpenTerm(partial.id)
      requestAnimationFrame(() => {
        document.getElementById(`glossary-entry-${partial.id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    }
  }, [entries, initialQuery])

  const filtered = useMemo(() => {
    const needle = normalize(query.trim())
    return entries
      .filter((entry) => {
        const haystack = normalize(`${entry.term} ${entry.tag} ${entry.def} ${entry.ctx}`)
        return (
          (!categoryId || entry.categoryId === categoryId) && (!needle || haystack.includes(needle))
        )
      })
      .sort((a, b) => a.term.localeCompare(b.term, 'fr'))
  }, [categoryId, entries, query])

  const groups = useMemo(
    () =>
      LETTERS.map((letter) => ({
        letter,
        entries: filtered.filter((entry) => normalize(entry.term).startsWith(letter)),
      })).filter((group) => group.entries.length > 0),
    [filtered],
  )

  const availableLetters = new Set(groups.map((group) => group.letter))

  const jumpTo = (letter: string) => {
    document.getElementById(`glossary-${letter}`)?.scrollIntoView({
      behavior: 'auto',
      block: 'start',
    })
  }

  return (
    <div className="page page--glossary">
      <CmsSection id="hero" className="gloss-hero" labelledBy="gloss-title">
        <p className="gloss-eyebrow">
          <EditableText section="hero" field="badge" fallback="LEXIQUE" as="span" label="Sur-titre" />
        </p>
        <EditableText
          section="hero"
          field="title"
          fallback={HERO_TITLE}
          as="h1"
          id="gloss-title"
          className="gloss-hero__title"
          label="Titre"
        >
          {heroTitle.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {index ? <br /> : null}
              {line}
            </span>
          ))}
        </EditableText>
        <Pencil section="hero" field="mark" fallback="EU\n4Y" label="Filigrane" />
      </CmsSection>

      <CmsSection id="browser" className="gloss-browser" labelledBy="gloss-browser-title">
        <h2 id="gloss-browser-title" className="sr-only">
          Glossaire EU4Youth
        </h2>
        <label className="gloss-search">
          <span>
            <span className="sr-only">{searchLabel}</span>
            <Pencil section="browser" field="search" fallback="Rechercher un terme" label="Recherche" />
          </span>
          <span className="gloss-btn-edit">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
            />
            <Pencil
              section="browser"
              field="placeholder"
              fallback="Rechercher un terme"
              label="Placeholder"
            />
          </span>
          <b aria-hidden="true">⌕</b>
        </label>

        <div className="gloss-filter-pencils">
          <Pencil section="browser" field="allF" fallback="Toutes" label="Toutes" />
        </div>
        <nav className="gloss-categories scroll-rail" aria-label="Filtrer par thématique">
          <button
            type="button"
            className={!categoryId ? 'is-active' : ''}
            onClick={() => setCategoryId('')}
          >
            {allF}
          </button>
          {GLOSSARY_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={categoryId === category.id ? 'is-active' : ''}
              onClick={() => setCategoryId(categoryId === category.id ? '' : category.id)}
            >
              {category.label}
            </button>
          ))}
        </nav>

        <div className="gloss-count" aria-live="polite">
          <strong>{filtered.length}</strong>{' '}
          {filtered.length === 1 ? oneLabel : manyLabel}
          <Pencil section="browser" field="one" fallback="terme" label="Singulier" />
          <Pencil section="browser" field="many" fallback="termes" label="Pluriel" />
          {categoryId ? (
            <span className="gloss-btn-edit">
              <button type="button" onClick={() => setCategoryId('')}>
                {resetLabel}
              </button>
              <Pencil section="browser" field="reset" fallback="Effacer le filtre" label="Effacer" />
            </span>
          ) : null}
        </div>

        <div className="gloss-layout">
          <nav className="gloss-alphabet scroll-rail" aria-label="Index alphabétique">
            {LETTERS.map((letter) => (
              <button
                key={letter}
                type="button"
                disabled={!availableLetters.has(letter)}
                onClick={() => jumpTo(letter)}
              >
                {letter}
              </button>
            ))}
          </nav>

          <div className="gloss-results">
            {groups.length > 0 ? (
              groups.map((group) => (
                <section
                  key={group.letter}
                  id={`glossary-${group.letter}`}
                  className="gloss-letter"
                  aria-labelledby={`glossary-heading-${group.letter}`}
                >
                  <div className="gloss-letter__head">
                    <h2 id={`glossary-heading-${group.letter}`}>{group.letter}</h2>
                    <span />
                  </div>
                  <div className="gloss-entry-grid">
                    {group.entries.map((entry) => {
                      const isOpen = openTerm === entry.id
                      return (
                        <article
                          key={entry.id}
                          id={`glossary-entry-${entry.id}`}
                          className={`gloss-entry${isOpen ? ' is-open' : ''}`}
                          style={{ '--entry-colour': entry.color } as CSSProperties}
                        >
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpenTerm(isOpen ? '' : entry.id)}
                          >
                            <span>{entry.term}</span>
                            <b aria-hidden="true">{isOpen ? '⌄' : '›'}</b>
                          </button>
                          {isOpen ? (
                            <div className="gloss-entry__body">
                              <span>
                                {entry.category} · {entry.tag}
                              </span>
                              <p>{entry.def}</p>
                              {entry.ctx.trim() ? (
                                <aside>
                                  <strong>Dans EU4Youth :</strong> {entry.ctx}
                                </aside>
                              ) : null}
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="gloss-empty">
                <strong>{emptyTitle}</strong>
                <Pencil
                  section="browser"
                  field="empty"
                  fallback="Aucun terme ne correspond à votre recherche."
                  label="Texte vide"
                />
                <span className="gloss-btn-edit">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setCategoryId('')
                    }}
                  >
                    {emptyCta}
                  </button>
                  <Pencil
                    section="browser"
                    field="emptyCta"
                    fallback="Réinitialiser la recherche"
                    label="Réinitialiser"
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      </CmsSection>
    </div>
  )
}
