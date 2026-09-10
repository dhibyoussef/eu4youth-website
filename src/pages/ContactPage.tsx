import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  FormSubmissionError,
  isPublicFormConfigured,
  submitPublicForm,
} from '../lib/forms'
import { EditableText } from '../cms/EditableText'
import { CmsSection, EditableImage } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useContent } from '../cms/ContentProvider'
import { useEditMode } from '../cms/EditModeProvider'
import './contact.css'

const CONTACT_WIRE_MESSAGE =
  "Le service d’envoi n’est pas encore connecté. Vos informations n’ont pas été transmises."

const LABEL_FALLBACK: { key: string; text: string }[] = [
  { key: 'lastName', text: 'Nom' },
  { key: 'firstName', text: 'Prénom' },
  { key: 'organisation', text: 'Organisation / Structure' },
  { key: 'role', text: 'Fonction' },
  { key: 'email', text: 'Adresse e-mail' },
  { key: 'phone', text: 'Téléphone' },
  { key: 'profile', text: 'Vous êtes...' },
  { key: 'project', text: 'Projet concerné' },
  { key: 'location', text: 'Zone géographique concernée' },
  { key: 'requestType', text: 'Objet de la demande' },
  { key: 'subject', text: 'Objet' },
  { key: 'message', text: 'Message' },
  { key: 'subjectHint', text: '100 caractères maximum' },
  { key: 'messageHint', text: '2 000 caractères maximum' },
]

const PROFILE_FALLBACK = [
  'Jeune',
  'Association / Organisation de la société civile',
  'Collectivité locale',
  'Administration publique',
  'Entreprise / Secteur privé',
  'Université / Centre de recherche',
  'Média',
  'Partenaire technique ou financier',
  'Autre',
].map((label) => ({ label }))

const PROJECT_FALLBACK = [
  'Programme EU4Youth',
  "Jeun'ESS",
  'Fe3il.a',
  "Maghroum'IN",
  'Swafy',
  'Irada4Youth',
  'GO4Youth',
  'Plusieurs projets',
  'Je ne sais pas',
].map((label) => ({ label }))

const LOCATION_FALLBACK = [
  'Nationale',
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Le Kef',
  'Mahdia',
  'La Manouba',
  'Médenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan',
  'Internationale',
  'Non concerné',
].map((label) => ({ label }))

const REQUEST_FALLBACK = [
  "Demande d'information",
  'Demande de partenariat',
  'Proposition de projet / initiative',
  'Demande de sponsoring ou de mécénat',
  'Demande média / presse',
  'Invitation à un événement',
  'Opportunité de collaboration',
  'Réclamation',
  "Signalement d'un problème technique (site web)",
  'Autre',
].map((label) => ({ label }))

function parseRows(raw: string, fallback: { key?: string; text?: string; label?: string }[]) {
  try {
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : null
    if (!list?.length) return fallback
    return list.map((row: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, value == null ? '' : String(value)]),
      ),
    )
  } catch {
    return fallback
  }
}

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
      className="contact-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

function SelectField({
  name,
  label,
  options,
  required = false,
}: {
  name: string
  label: string
  options: string[]
  required?: boolean
}) {
  return (
    <label className="contact-field contact-field--select">
      <span className="sr-only">{label}</span>
      <select name={name} defaultValue="" required={required}>
        <option value="" disabled>
          {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function OptionList({
  field,
  label,
  fallback,
}: {
  field: string
  label: string
  fallback: { label: string }[]
}) {
  return (
    <EditableJsonList
      section="form"
      field={field}
      label={label}
      className="contact-cms-list"
      wrapItems={false}
      manageLabel={label}
      fallback={fallback}
      fields={[{ key: 'label', label: 'Libellé' }]}
      emptyItem={{ label: 'Nouvelle option' }}
      renderItem={() => null}
    />
  )
}

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState('')
  const [phase, setPhase] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const wireReady = isPublicFormConfigured('contact')
  const showWireNotice = import.meta.env.DEV && !wireReady
  const { get } = useContent()
  const { isEditMode } = useEditMode()

  const labels = useMemo(() => {
    const rows = parseRows(get('form.labels', JSON.stringify(LABEL_FALLBACK)), LABEL_FALLBACK)
    return Object.fromEntries(rows.map((row) => [row.key || '', row.text || row.label || '']))
  }, [get])

  const profiles = parseRows(get('form.profiles', JSON.stringify(PROFILE_FALLBACK)), PROFILE_FALLBACK)
    .map((row) => row.label)
    .filter(Boolean) as string[]
  const projects = parseRows(get('form.projects', JSON.stringify(PROJECT_FALLBACK)), PROJECT_FALLBACK)
    .map((row) => row.label)
    .filter(Boolean) as string[]
  const locations = parseRows(get('form.locations', JSON.stringify(LOCATION_FALLBACK)), LOCATION_FALLBACK)
    .map((row) => row.label)
    .filter(Boolean) as string[]
  const requestTypes = parseRows(
    get('form.requestTypes', JSON.stringify(REQUEST_FALLBACK)),
    REQUEST_FALLBACK,
  )
    .map((row) => row.label)
    .filter(Boolean) as string[]

  const heroTitle = get('hero.title', 'CONTACT')
  const formTitle = get('form.title', 'Formulaire de contact')
  const privacyLinkLabel = get('form.privacyLink', 'politique de confidentialité')
  const honeypotLabel = get('form.honeypot', 'Ne pas remplir ce champ')
  const t = (key: string, fallback: string) => labels[key] || fallback
  const resetLabel = get('form.reset', 'Réinitialiser')
  const submitLabel = get('form.submit', 'Envoyer la demande')
  const consent = get(
    'form.consent',
    'J’accepte que les informations renseignées dans ce formulaire soient utilisées uniquement pour le traitement de ma demande, conformément à la',
  )
  const successTitle = get('form.successTitle', 'MERCI !')
  const successBody = get(
    'form.successBody',
    'Votre demande a bien été envoyée. Notre équipe vous répondra dans les meilleurs délais.',
  )

  useEffect(() => {
    if (phase !== 'success') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setStatus('')
        setPhase('idle')
      }
    }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbar}px`
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      window.removeEventListener('keydown', onKey)
    }
  }, [phase])

  const reset = () => {
    formRef.current?.reset()
    setStatus('')
    setPhase('idle')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    if (phase === 'submitting') return

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = Object.fromEntries(
      [...data.entries()]
        .filter(([name]) => name !== 'consent')
        .map(([name, value]) => [name, String(value)]),
    )

    setPhase('submitting')
    setStatus('Envoi de votre demande…')
    try {
      await submitPublicForm('contact', {
        ...payload,
        consent: data.has('consent'),
      })
      form.reset()
      setPhase('success')
      setStatus(successBody)
    } catch (error) {
      setPhase('error')
      if (
        error instanceof FormSubmissionError &&
        (error.code === 'unconfigured' || error.code === 'invalid-endpoint')
      ) {
        setStatus(CONTACT_WIRE_MESSAGE)
      } else {
        setStatus(
          'Une erreur temporaire empêche l’envoi. Veuillez réessayer dans quelques instants.',
        )
      }
    }
  }

  return (
    <div className="page page--contact">
      <CmsSection id="hero" className="contact-hero" labelledBy="contact-title">
        <div className="contact-hero__figure" aria-hidden="true">
          <svg className="contact-hero__disc" viewBox="0 0 400 400" focusable="false">
            <circle
              cx="200"
              cy="200"
              r="186"
              fill="none"
              stroke="#f2a849"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="16 19"
            />
          </svg>
          <svg className="contact-hero__disc contact-hero__disc--inner" viewBox="0 0 400 400" focusable="false">
            <circle
              cx="200"
              cy="200"
              r="168"
              fill="none"
              stroke="#111"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="12 14"
            />
          </svg>
          <EditableImage
            section="hero"
            field="portrait"
            fallback="/img/contact-hero-person.webp"
            className="contact-hero__portrait"
            alt=""
          />
        </div>
        <div className="contact-hero__copy">
          <EditableText
            section="hero"
            field="title"
            fallback="CONTACT"
            as="h1"
            id="contact-title"
            className="contact-hero__title"
            label="Titre"
          >
            {heroTitle.split('\n').map((line, index) => (
              <span key={`${line}-${index}`}>
                {index ? <br /> : null}
                {line}
              </span>
            ))}
          </EditableText>
        </div>
      </CmsSection>

      <CmsSection id="form" className="contact-form-section" labelledBy="contact-form-title">
        <h2 id="contact-form-title" className="sr-only">
          {formTitle}
        </h2>

        {isEditMode ? (
          <div className="contact-cms-bar">
            <EditableJsonList
              section="form"
              field="labels"
              label="Libellés des champs"
              className="contact-cms-list"
              wrapItems={false}
              manageLabel="Gérer les libellés"
              fallback={LABEL_FALLBACK}
              fields={[{ key: 'text', label: 'Texte affiché' }]}
              emptyItem={{ key: 'nouveau', text: 'Nouveau champ' }}
              renderItem={() => null}
            />
            <OptionList field="profiles" label="Gérer « Vous êtes »" fallback={PROFILE_FALLBACK} />
            <OptionList field="projects" label="Gérer les projets" fallback={PROJECT_FALLBACK} />
            <OptionList field="locations" label="Gérer les zones" fallback={LOCATION_FALLBACK} />
            <OptionList field="requestTypes" label="Gérer les objets" fallback={REQUEST_FALLBACK} />
          </div>
        ) : null}

        {showWireNotice ? (
          <aside className="contact-wire" aria-labelledby="contact-wire-title">
            <p className="contact-wire__badge">À configurer</p>
            <h3 id="contact-wire-title">Formulaire prêt — envoi à brancher</h3>
            <p>
              La structure du formulaire est en place. La transmission des demandes sera
              activée dès que le service d’envoi sera connecté côté hébergement.
            </p>
          </aside>
        ) : null}

        <form
          ref={formRef}
          className="contact-form"
          onSubmit={submit}
          aria-describedby={showWireNotice ? 'contact-wire-title' : undefined}
        >
          <label className="form-trap" aria-hidden="true">
            {honeypotLabel}
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
          <div className="contact-grid">
            <label className="contact-field">
              <span className="sr-only">{t('lastName', 'Nom')}</span>
              <input name="lastName" type="text" placeholder={t('lastName', 'Nom')} autoComplete="family-name" required />
            </label>
            <label className="contact-field">
              <span className="sr-only">{t('firstName', 'Prénom')}</span>
              <input name="firstName" type="text" placeholder={t('firstName', 'Prénom')} autoComplete="given-name" required />
            </label>
            <label className="contact-field">
              <span className="sr-only">{t('organisation', 'Organisation / Structure')}</span>
              <input
                name="organisation"
                type="text"
                placeholder={t('organisation', 'Organisation / Structure')}
                autoComplete="organization"
              />
            </label>
            <label className="contact-field">
              <span className="sr-only">{t('role', 'Fonction')}</span>
              <input name="role" type="text" placeholder={t('role', 'Fonction')} autoComplete="organization-title" />
            </label>
            <label className="contact-field">
              <span className="sr-only">{t('email', 'Adresse e-mail')}</span>
              <input name="email" type="email" placeholder={t('email', 'Adresse e-mail')} autoComplete="email" required />
            </label>
            <label className="contact-field">
              <span className="sr-only">{t('phone', 'Téléphone')}</span>
              <input name="phone" type="tel" placeholder={t('phone', 'Téléphone')} autoComplete="tel" />
            </label>
            <SelectField name="profile" label={t('profile', 'Vous êtes...')} options={profiles} required />
            <SelectField name="project" label={t('project', 'Projet concerné')} options={projects} required />
            <SelectField name="location" label={t('location', 'Zone géographique concernée')} options={locations} />
            <SelectField
              name="requestType"
              label={t('requestType', 'Objet de la demande')}
              options={requestTypes}
              required
            />
          </div>

          <label className="contact-field contact-field--wide contact-field--subject">
            <span className="sr-only">{t('subject', 'Objet')}</span>
            <textarea name="subject" placeholder={t('subject', 'Objet')} maxLength={100} rows={2} required />
            <small>{t('subjectHint', '100 caractères maximum')}</small>
          </label>

          <label className="contact-field contact-field--wide contact-field--message">
            <span className="sr-only">{t('message', 'Message')}</span>
            <textarea name="message" placeholder={t('message', 'Message')} maxLength={2000} rows={7} required />
            <small>{t('messageHint', '2 000 caractères maximum')}</small>
          </label>

          <div className="contact-consent-row">
            <label className="contact-consent">
              <input name="consent" type="checkbox" required />
              <span>
                {consent}{' '}
                <Link to="/confidentialite">{privacyLinkLabel}</Link>
              </span>
            </label>
            {isEditMode ? (
              <Pencil section="form" field="consent" fallback={consent} label="Consentement" />
            ) : null}
          </div>

          <div className="contact-actions-row">
            <div className="contact-actions">
              <button
                type="button"
                className="contact-reset"
                onClick={reset}
                disabled={phase === 'submitting' && !isEditMode}
              >
                {resetLabel}
              </button>
              <button
                type="submit"
                className="contact-submit"
                disabled={phase === 'submitting' && !isEditMode}
              >
                {phase === 'submitting' && !isEditMode ? 'Envoi en cours…' : submitLabel}
              </button>
            </div>
            {isEditMode ? (
              <div className="contact-actions-chips">
                <Pencil section="form" field="reset" fallback={resetLabel} label="Bouton réinitialiser" />
                <Pencil section="form" field="submit" fallback={submitLabel} label="Bouton envoyer" />
                <Pencil section="form" field="successTitle" fallback={successTitle} label="Titre merci" />
                <Pencil section="form" field="successBody" fallback={successBody} label="Message merci" />
              </div>
            ) : null}
          </div>

          {status && phase === 'success'
            ? createPortal(
                <div
                  className="contact-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="contact-success-title"
                  onClick={() => {
                    setStatus('')
                    setPhase('idle')
                  }}
                >
                  <div
                    className="contact-dialog__card"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <span className="contact-dialog__mark" aria-hidden="true">
                      ✓
                    </span>
                    <h2 id="contact-success-title">{successTitle}</h2>
                    <p role="status">{status}</p>
                  </div>
                </div>,
                document.body,
              )
            : null}

          {status && phase !== 'success' ? (
            <p
              className={`contact-status contact-status--${phase}`}
              role={phase === 'error' ? 'alert' : 'status'}
            >
              {status}
            </p>
          ) : null}
        </form>
      </CmsSection>
    </div>
  )
}
