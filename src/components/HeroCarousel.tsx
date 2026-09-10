import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useContent } from '../cms/ContentProvider'
import { useEditMode } from '../cms/EditModeProvider'
import { assetUrl } from '../lib/assetUrl'

export type HeroSlideDef = {
  field?: string
  fallback: string
  label: string
}

type HeroSlideRow = { label: string; image: string }

function parseHeroSlides(
  raw: string,
  slideDefs: readonly HeroSlideDef[],
  read: (key: string, fallback: string) => string,
): HeroSlideRow[] {
  if (raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.fr) ? parsed.fr : null
      if (list?.length) {
        return list
          .map((row: Record<string, unknown>, index: number) => ({
            label: String(row?.label || slideDefs[index]?.label || `Photo ${index + 1}`),
            image: String(row?.image || slideDefs[index]?.fallback || ''),
          }))
          .filter((row: HeroSlideRow) => row.image)
      }
    } catch {
      /* fall back to legacy hero.image fields */
    }
  }
  return slideDefs.map((slide) => ({
    label: slide.label,
    image: slide.field
      ? read(`hero.${slide.field}`, slide.fallback) || slide.fallback
      : slide.fallback,
  }))
}

type HeroCarouselProps = {
  section?: string
  slidesField?: string
  slideDefs: readonly HeroSlideDef[]
  ariaLabel: string
  emptySlideImage?: string
  artClassName?: string
  /** Repeat the slide photograph horizontally (e.g. 5 tiles across the band). */
  tileCount?: number
}

export default function HeroCarousel({
  section = 'hero',
  slidesField = 'slides',
  slideDefs,
  ariaLabel,
  emptySlideImage = '/img/home-hero-v2.webp',
  artClassName = 'band__art',
  tileCount,
}: HeroCarouselProps) {
  const { isEditMode } = useEditMode()
  const { get } = useContent()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const slidesFallback = useMemo(
    () =>
      slideDefs.map((slide) => ({
        label: slide.label,
        image: slide.field
          ? get(`hero.${slide.field}`, slide.fallback) || slide.fallback
          : slide.fallback,
      })),
    [get, slideDefs],
  )
  const slides = parseHeroSlides(get(`${section}.${slidesField}`, ''), slideDefs, get)
  const heroImage = emptySlideImage
  const displaySlides =
    tileCount && slides.length > 0
      ? slides.map((slide) => ({ ...slide, image: heroImage }))
      : slides
  const slideCount = Math.max(1, displaySlides.length)

  useEffect(() => {
    if (isEditMode || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slideCount)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [isEditMode, paused, slideCount])

  useEffect(() => {
    if (active >= slideCount) setActive(0)
  }, [active, slideCount])

  return (
    <div
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {isEditMode ? (
        <EditableJsonList
          section={section}
          field={slidesField}
          label="Photographies du bandeau"
          manageLabel="Gérer les images"
          className="hero-carousel__list"
          wrapItems={false}
          fallback={slidesFallback}
          fields={[
            { key: 'label', label: 'Libellé' },
            { key: 'image', label: 'Image', kind: 'image' },
          ]}
          emptyItem={{ label: 'Nouvelle photo', image: emptySlideImage }}
          renderItem={() => null}
        />
      ) : null}
      {displaySlides.map((slide, index) => (
        <div
          key={`${index}-${slide.image}`}
          className={`hero-carousel__slide${index === active ? ' is-active' : ''}${
            tileCount ? ' hero-carousel__slide--tiled' : ''
          }`}
          aria-hidden={index !== active}
          style={
            tileCount
              ? ({
                  '--hero-tile-image': `url("${assetUrl(slide.image)}")`,
                  '--hero-tile-count': tileCount,
                } as CSSProperties)
              : undefined
          }
        >
          {tileCount ? (
            <img className={`${artClassName} hero-carousel__tile-fallback`} src={assetUrl(slide.image)} alt="" />
          ) : (
            <img className={artClassName} src={assetUrl(slide.image)} alt="" />
          )}
        </div>
      ))}
      <div className="hero-carousel__dots" role="tablist" aria-label="Choisir une photographie">
        {slideCount > 1
          ? displaySlides.map((slide, index) => (
          <button
            key={`${index}-${slide.label}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={slide.label}
            className={index === active ? 'is-on' : ''}
            onClick={() => setActive(index)}
          />
        ))
          : null}
      </div>
      {isEditMode ? (
        <p className="hero-carousel__edit-hint" aria-live="polite">
          {slides.length} photo(s) — cliquez « Gérer les images » pour modifier la liste
        </p>
      ) : null}
    </div>
  )
}
