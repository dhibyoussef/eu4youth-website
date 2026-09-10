import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from './ContentProvider'

const KEY = 'eu4y_cookies'
export const COOKIE_RESET_EVENT = 'eu4y-cookies-reset'

export function CookieBanner() {
  const { get, t } = useContent()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sync = () => {
      try {
        setVisible(!localStorage.getItem(KEY))
      } catch {
        setVisible(true)
      }
    }
    sync()
    const open = () => {
      try {
        localStorage.removeItem(KEY)
      } catch {
        /* ignore */
      }
      setVisible(true)
    }
    window.addEventListener(COOKIE_RESET_EVENT, open)
    return () => window.removeEventListener(COOKIE_RESET_EVENT, open)
  }, [])

  if (!visible) return null

  const choose = (value: 'accept' | 'reject') => {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookies" data-cms-section="legal">
      <p>
        {get(
          'legal.cookieBanner',
          'Ce site enregistre votre langue et votre choix cookies. Les traceurs non indispensables restent désactivés tant que vous refusez.',
        )}{' '}
        <Link to="/cookies">{get('legal.more', 'En savoir plus')}</Link>
      </p>
      <div>
        <button type="button" className="cookie-banner__reject" onClick={() => choose('reject')}>
          {t('cookie.reject', get('legal.reject', 'Refuser'))}
        </button>
        <button type="button" className="cookie-banner__ok" onClick={() => choose('accept')}>
          {t('cookie.accept', get('legal.accept', 'Accepter'))}
        </button>
      </div>
    </div>
  )
}
