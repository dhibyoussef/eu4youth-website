export type Locale = 'fr' | 'en' | 'ar'
export type Localized = Record<Locale, string>
export type LivePack = {
  home: Record<string, Localized>
  stories: Record<string, Localized>
  media: Record<string, Localized>
  legal: Record<string, Localized>
}
