import './funder-flags.css'
import { useContent } from '../cms/ContentProvider'

type FunderFlagsProps = {
  className?: string
  variant?: 'header' | 'footer'
}

/** Client flags — outer white keyed to transparent so they blend with header/footer BG. */
const FLAG_SRC = {
  eu: '/img/flag-eu-client-blend.webp',
  tn: '/img/flag-tn-client-blend.webp',
} as const

export default function FunderFlags({
  className = '',
  variant = 'header',
}: FunderFlagsProps) {
  const { t } = useContent()

  return (
    <div
      className={`funder-flags funder-flags--${variant}${className ? ` ${className}` : ''}`}
      dir="ltr"
      aria-label={t(
        'funder.aria',
        "Financé par l'Union européenne — République Tunisienne",
      )}
    >
      <div className="funder-flags__item funder-flags__item--eu">
        <span className="funder-flags__flag-wrap">
          <img className="funder-flags__flag" src={FLAG_SRC.eu} alt="" />
        </span>
        <span className="funder-flags__caption">
          <span>{t('funder.eu_line1', 'Financé par')}</span>
          <span>{t('funder.eu_line2', "l'Union européenne")}</span>
        </span>
      </div>
      <div className="funder-flags__item funder-flags__item--tn">
        <span className="funder-flags__flag-wrap">
          <img className="funder-flags__flag" src={FLAG_SRC.tn} alt="" />
        </span>
        <span className="funder-flags__caption">
          <span>{t('funder.tn_line1', 'République')}</span>
          <span>{t('funder.tn_line2', 'Tunisienne')}</span>
        </span>
      </div>
    </div>
  )
}
