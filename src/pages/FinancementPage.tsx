import { type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/projects'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { CountUp } from '../cms/CountUp'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import FunderFlags from '../components/FunderFlags'
import './financement.css'

const FACTS_FALLBACK = [
  { value: '60 M€', label: 'BUDGET GLOBAL', note: "Financé par l'Union européenne" },
  { value: '2019–2027', label: 'PÉRIODE', note: 'Convention signée en juin 2019' },
  { value: '6', label: 'PROJETS', note: 'Complémentaires et coordonnés' },
  { value: '24', label: 'GOUVERNORATS', note: 'Une présence nationale' },
]

const THEMES_FALLBACK = [
  {
    title: 'EMPLOI ET ENTREPRENEURIAT',
    text:
      "Le financement soutient l'accès à l'emploi décent, l'entrepreneuriat, l'économie sociale et solidaire, la recherche appliquée et les filières économiques porteuses.",
  },
  {
    title: 'CULTURE ET SPORT',
    text:
      "Il renforce les opérateurs, les espaces et les initiatives qui font de la culture et du sport des leviers d'inclusion, d'expression et d'employabilité.",
  },
  {
    title: 'PARTICIPATION DES JEUNES',
    text:
      'Il accompagne les communes, les institutions et la société civile pour associer durablement les jeunes aux politiques publiques qui les concernent.',
  },
]

const STRUCTURE_FALLBACK = [
  {
    title: 'Programme-cadre',
    body: "EU4Youth regroupe six projets distincts sous une vision commune. Le programme fixe les objectifs globaux, la gouvernance d'ensemble et les mécanismes de coordination.",
  },
  {
    title: 'Convention de financement',
    body: 'Signée en juin 2019 entre la Commission européenne et le gouvernement tunisien, elle formalise le budget, la durée, les objectifs et les conditions de mise en œuvre. Sa durée a été portée à 96 mois par avenant en décembre 2021.',
  },
  {
    title: 'Supervision',
    body: "La Délégation de l'Union européenne en Tunisie assure la supervision stratégique des six projets. Les institutions tunisiennes et les partenaires de mise en œuvre portent l'exécution opérationnelle et le reporting.",
  },
]

function fundingNote(slug: string) {
  if (slug === 'fe3ila') return 'Union européenne, avec la contribution du Royaume des Pays-Bas'
  if (slug === 'irada4youth') return 'Contrat de subvention financé à 100 % par l’Union européenne'
  return "Financé par l'Union européenne dans le cadre d'EU4Youth"
}

const PROJECTS_FALLBACK = PROJECTS.map((project) => ({
  slug: project.slug,
  acronym: project.acronym,
  budget: project.budget,
  composante: project.composante,
  funding: fundingNote(project.slug),
  partner: project.partner,
  period: project.period,
  logo: `/img/logo-${project.slug}.png`,
}))

function parseJsonRows(raw: string): Record<string, unknown>[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    return list as Record<string, unknown>[] | null
  } catch {
    return null
  }
}

function ListDock({ children }: { children: ReactNode }) {
  return <div className="fin-edit-region">{children}</div>
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
      className="fin-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

function linesOf(raw: string, fallback: string[]) {
  const parts = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  return parts.length ? parts : fallback
}

export default function FinancementPage() {
  const { get } = useContent()
  const titleLines = linesOf(get('hero.title', 'FINANCEMENT\nUNION EUROPÉENNE'), [
    'FINANCEMENT',
    'UNION EUROPÉENNE',
  ])
  const factRows = parseJsonRows(get('facts.items', JSON.stringify(FACTS_FALLBACK)))
  const facts = (factRows?.length ? factRows : FACTS_FALLBACK).map((row) => ({
    value: String(row.value || ''),
    label: String(row.label || ''),
    note: String(row.note || ''),
  }))
  const themeRows = parseJsonRows(get('purpose.items', JSON.stringify(THEMES_FALLBACK)))
  const themes = (themeRows?.length ? themeRows : THEMES_FALLBACK).map((row) => ({
    title: String(row.title || ''),
    text: String(row.text || ''),
  }))
  const structureRows = parseJsonRows(get('structure.items', JSON.stringify(STRUCTURE_FALLBACK)))
  const structure = (structureRows?.length ? structureRows : STRUCTURE_FALLBACK).map((row) => ({
    title: String(row.title || ''),
    body: String(row.body || ''),
  }))
  const projectRows = parseJsonRows(get('projects.items', JSON.stringify(PROJECTS_FALLBACK)))
  const projects = (projectRows?.length ? projectRows : PROJECTS_FALLBACK).map((row) => {
    const slug = String(row.slug || '')
    const source = PROJECTS.find((item) => item.slug === slug)
    return {
      slug,
      acronym: String(row.acronym || source?.acronym || slug),
      budget: String(row.budget || source?.budget || ''),
      composante: String(row.composante || source?.composante || ''),
      funding: String(row.funding || fundingNote(slug)),
      partner: String(row.partner || source?.partner || ''),
      period: String(row.period || source?.period || ''),
      logo: assetUrl(String(row.logo || `/img/logo-${slug}.png`)),
      theme: source?.theme || 'jeuness',
    }
  })
  return (
    <div className="page page--financement">
      <CmsSection id="hero" className="fin-hero" labelledBy="fin-title">
        <div className="fin-hero__copy">
          <EditableText
            section="hero"
            field="badge"
            fallback="LE PROGRAMME EU4YOUTH"
            as="p"
            className="fin-hero__eyebrow"
            label="Badge"
          />
          <EditableText
            section="hero"
            field="title"
            fallback={'FINANCEMENT\nUNION EUROPÉENNE'}
            as="h1"
            id="fin-title"
            className="fin-hero__title"
            label="Titre"
          >
            {titleLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < titleLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </EditableText>
          <EditableText
            section="hero"
            field="body"
            fallback="EU4Youth est le programme d’appui à la jeunesse tunisienne financé par l’Union européenne et mis en œuvre en partenariat avec les institutions tunisiennes et les acteurs nationaux et internationaux engagés en faveur des jeunes."
            as="p"
            label="Chapô"
          />
        </div>

        <div className="fin-hero__aside">
          <div className="fin-hero__figure" aria-label="Budget global de 60 millions d’euros">
            <span>
              <CountUp value={get('hero.amount', '60')} />
            </span>
            <strong>{get('hero.unit', 'M€')}</strong>
            <small>{get('hero.figureLabel', 'BUDGET GLOBAL')}</small>
            <Pencil section="hero" field="amount" fallback="60" label="Compteur (60)" />
          </div>

          <span className="fin-hero__flags">
            <FunderFlags variant="footer" />
          </span>
        </div>
      </CmsSection>

      <CmsSection id="facts" className="fin-facts" labelledBy="fin-facts-title">
        <EditableText
          section="facts"
          field="title"
          fallback="LE FINANCEMENT EN CHIFFRES"
          as="h2"
          id="fin-facts-title"
          label="Titre"
        >
          {get('facts.title', 'LE FINANCEMENT EN CHIFFRES')}
        </EditableText>
        <EditableText
          section="facts"
          field="intro"
          fallback="Doté d’un budget de 60 millions d’euros pour 2019–2027, EU4Youth est la plus importante enveloppe européenne dédiée à la jeunesse tunisienne. La convention de financement a été signée en juin 2019."
          as="p"
          className="fin-facts__intro"
          label="Introduction"
        />
        <ListDock>
          <EditableJsonList
            section="facts"
            field="items"
            label="Chiffres"
            className="fin-list-cms"
            wrapItems={false}
            manageLabel="Gérer les chiffres"
            fallback={FACTS_FALLBACK}
            fields={[
              { key: 'value', label: 'Valeur (le compteur s’arrête ici)' },
              { key: 'label', label: 'Libellé' },
              { key: 'note', label: 'Note' },
            ]}
            emptyItem={{ value: '', label: '', note: '' }}
            renderItem={() => null}
          />
          <ul className="fin-facts__grid">
            {facts.map((fact, index) => (
              <li
                key={`${fact.label}-${index}`}
                className={index === 0 ? 'fin-fact fin-fact--featured' : 'fin-fact'}
              >
                <span className="fin-fact__value">
                  <CountUp value={fact.value} />
                </span>
                <span className="fin-fact__label">{fact.label}</span>
                <span className="fin-fact__note">{fact.note}</span>
              </li>
            ))}
          </ul>
        </ListDock>
      </CmsSection>

      <CmsSection id="projects" className="fin-projects" labelledBy="fin-projects-title">
        <div className="fin-projects__heading">
          <div>
            <EditableText
              section="projects"
              field="eyebrow"
              fallback="BUDGETS PUBLIÉS DES PROJETS"
              as="p"
              label="Sur-titre"
            >
              {get('projects.eyebrow', 'BUDGETS PUBLIÉS DES PROJETS')}
            </EditableText>
            <EditableText
              section="projects"
              field="title"
              fallback="LES SIX PROJETS"
              as="h2"
              id="fin-projects-title"
              label="Titre"
            >
              {get('projects.title', 'LES SIX PROJETS')}
            </EditableText>
          </div>
          <EditableText
            section="projects"
            field="body"
            fallback="Chaque projet dispose de son propre budget, partenaire de mise en œuvre et périmètre d’action. Les montants ci-dessous sont les enveloppes publiées ; leur somme ne reconstitue pas seule le budget global du programme."
            as="p"
            label="Texte"
          />
        </div>

        <ListDock>
          <EditableJsonList
            section="projects"
            field="items"
            label="Budgets des projets"
            className="fin-list-cms"
            wrapItems={false}
            manageLabel="Gérer les budgets"
            fallback={PROJECTS_FALLBACK}
            fields={[
              { key: 'slug', label: 'Identifiant' },
              { key: 'acronym', label: 'Acronyme' },
              { key: 'budget', label: 'Budget' },
              { key: 'composante', label: 'Composante' },
              { key: 'funding', label: 'Financement', multiline: true },
              { key: 'partner', label: 'Partenaire', multiline: true },
              { key: 'period', label: 'Période' },
              { key: 'logo', label: 'Logo (chemin /img/…)' },
            ]}
            emptyItem={{
              slug: 'nouveau',
              acronym: 'Nouveau',
              budget: '',
              composante: '',
              funding: "Financé par l'Union européenne dans le cadre d'EU4Youth",
              partner: '',
              period: '',
              logo: '/img/logo-jeuness.png',
            }}
            renderItem={() => null}
          />
          <ul className="fin-projects__grid">
            {projects.map((project) => (
              <li
                key={project.slug}
                className="fin-project"
                style={{ '--project-colour': `var(--p-${project.theme})` } as CSSProperties}
              >
                <Link to={`/projets/${project.slug}`}>
                  <div className="fin-project__head">
                    <img src={project.logo} alt="" aria-hidden="true" />
                    <span>{project.acronym}</span>
                  </div>
                  <p className="fin-project__budget">{project.budget}</p>
                  <p className="fin-project__component">{project.composante}</p>
                  <dl>
                    <div>
                      <dt>Financement</dt>
                      <dd>{project.funding}</dd>
                    </div>
                    <div>
                      <dt>Partenaire</dt>
                      <dd>{project.partner}</dd>
                    </div>
                    <div>
                      <dt>Période</dt>
                      <dd>{project.period}</dd>
                    </div>
                  </dl>
                  <span className="fin-project__more">Découvrir le projet »</span>
                </Link>
              </li>
            ))}
          </ul>
        </ListDock>
      </CmsSection>

      <CmsSection id="purpose" className="fin-purpose" labelledBy="fin-purpose-title">
        <EditableText
          section="purpose"
          field="title"
          fallback={'UN FINANCEMENT\nAU SERVICE DES TERRITOIRES'}
          as="h2"
          id="fin-purpose-title"
          label="Titre"
        >
          {(() => {
            const lines = linesOf(
              get('purpose.title', 'UN FINANCEMENT\nAU SERVICE DES TERRITOIRES'),
              ['UN FINANCEMENT', 'AU SERVICE DES TERRITOIRES'],
            )
            return (
              <>
                {lines[0]}
                {lines[1] ? <span>{lines[1]}</span> : null}
              </>
            )
          })()}
        </EditableText>
        <ListDock>
          <EditableJsonList
            section="purpose"
            field="items"
            label="Axes de financement"
            className="fin-list-cms"
            wrapItems={false}
            manageLabel="Gérer les axes"
            fallback={THEMES_FALLBACK}
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'text', label: 'Texte', multiline: true },
            ]}
            emptyItem={{ title: '', text: '' }}
            renderItem={() => null}
          />
          <div className="fin-purpose__grid">
            {themes.map((theme, index) => (
              <article key={`${theme.title}-${index}`}>
                <span aria-hidden="true">0{index + 1}</span>
                <h3>{theme.title}</h3>
                <p>{theme.text}</p>
              </article>
            ))}
          </div>
        </ListDock>
      </CmsSection>

      <CmsSection id="structure" className="fin-structure" labelledBy="fin-structure-title">
        <EditableText
          section="structure"
          field="title"
          fallback="COMMENT LE FINANCEMENT EST ORGANISÉ"
          as="h2"
          id="fin-structure-title"
          label="Titre"
        >
          {get('structure.title', 'COMMENT LE FINANCEMENT EST ORGANISÉ')}
        </EditableText>
        <ListDock>
          <EditableJsonList
            section="structure"
            field="items"
            label="Organisation"
            className="fin-list-cms"
            wrapItems={false}
            manageLabel="Gérer l’organisation"
            fallback={STRUCTURE_FALLBACK}
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'body', label: 'Texte', multiline: true },
            ]}
            emptyItem={{ title: '', body: '' }}
            renderItem={() => null}
          />
          <div className="fin-structure__grid">
            {structure.map((item, index) => (
              <article key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </ListDock>
      </CmsSection>

      <CmsSection id="cta" className="fin-cta" labelledBy="fin-cta-title">
        <div>
          <EditableText
            section="cta"
            field="eyebrow"
            fallback="ALLER PLUS LOIN"
            as="p"
            label="Sur-titre"
          >
            {get('cta.eyebrow', 'ALLER PLUS LOIN')}
          </EditableText>
          <EditableText
            section="cta"
            field="title"
            fallback="DÉCOUVRIR LES ACTIONS FINANCÉES"
            as="h2"
            id="fin-cta-title"
            label="Titre"
          >
            {get('cta.title', 'DÉCOUVRIR LES ACTIONS FINANCÉES')}
          </EditableText>
        </div>
        <div className="fin-cta__actions">
          <Link className="btn btn--fill-blue" to="/projets">
            <EditableText
              section="cta"
              field="projects"
              fallback="Voir les six projets"
              as="span"
              multiline={false}
              label="Bouton projets"
            >
              {get('cta.projects', 'Voir les six projets')}
            </EditableText>{' '}
            <span aria-hidden="true">»</span>
          </Link>
          <Link className="btn btn--line-orange" to="/publications">
            <EditableText
              section="cta"
              field="publications"
              fallback="Publications et ressources"
              as="span"
              multiline={false}
              label="Bouton publications"
            >
              {get('cta.publications', 'Publications et ressources')}
            </EditableText>{' '}
            <span aria-hidden="true">»</span>
          </Link>
        </div>
      </CmsSection>
    </div>
  )
}
