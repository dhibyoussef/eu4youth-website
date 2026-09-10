# Locale architecture boundary

## Decision

Phase 0 keeps the public site French-first until approved Arabic and English fields exist in Strapi.

The cahier requires `/fr`, `/ar`, `/en`, a visible selector, Arabic RTL, and hreflang. Those URL shells must not pretend translations exist.

## Safe frontend boundary (now)

1. Keep current unprefixed French routes as the live public surface.
2. Keep the header language control disabled with an honest “contenu traduit non fourni” state.
3. Do not invent AR/EN copy, alternative text, form messages, legal text, or search corpora.
4. Do not emit reciprocal `hreflang` or sitemap entries for fallback locale copies.
5. Do not mark French fallback pages under `/ar` or `/en` as indexable.

## Next implementation package (after translations exist)

1. Introduce a locale URL utility and prefix routes under `/fr/**`.
2. Add permanent edge redirects from legacy unprefixed paths to `/fr/**`.
3. Enable `/ar/**` and `/en/**` only for records whose availability status is `published`.
4. Temporary French fallback pages, if needed, must show an explicit disclosure and remain `noindex,follow`.
5. Add reciprocal hreflang and sitemap entries only for approved localized equivalents.
6. Ship an Arabic RTL stylesheet pass for header, footer, forms, search, map, and detail pages.

## Ownership dependency

Arabic owner, English owner, Editorial owner and Technical owner must approve translated fields before locale routes become public and indexable.
