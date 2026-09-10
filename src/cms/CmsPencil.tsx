export function CmsPencil({
  label,
  onOpen,
}: {
  label: string
  onOpen: () => void
}) {
  /* span+role avoids illegal <button> inside <button|a> (tabs, filters, cards). */
  return (
    <span
      role="button"
      tabIndex={0}
      className="cms-pencil"
      title={label}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onOpen()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        event.stopPropagation()
        onOpen()
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1 1 0 0 0 0-1.41l-2.51-2.51a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2-1.66z"
        />
      </svg>
    </span>
  )
}
