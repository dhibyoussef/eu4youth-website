import { useState } from 'react'
import { useContent } from '../cms/ContentProvider'

type ShareActionsProps = {
  title: string
  pathname: string
}

export default function ShareActions({ title, pathname }: ShareActionsProps) {
  const { t } = useContent()
  const [status, setStatus] = useState('')
  const url = `https://eu4youth.org${pathname}`
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareNative = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        setStatus(t('share.opened', 'Partage ouvert.'))
        return
      }
      await navigator.clipboard.writeText(url)
      setStatus(t('share.copied', 'Lien copié.'))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus(
        t(
          'share.unavailable',
          'Le partage automatique est indisponible. Copiez le lien depuis votre navigateur.',
        ),
      )
    }
  }

  return (
    <div className="content-detail__share">
      <button type="button" onClick={shareNative}>
        {t('share.open', 'Partager cette page')}
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>
        {t('share.email', 'Envoyer par e-mail')}
      </a>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
