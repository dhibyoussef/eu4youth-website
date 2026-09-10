import { useMemo, useState } from 'react'
import './period-calendar.css'

export type PeriodFilterValue =
  | { mode: 'all' }
  | { mode: 'preset'; preset: '30d' | 'year' }
  | { mode: 'month'; month: string }
  | { mode: 'day'; day: string }

const MONTHS_FR = [
  'JANVIER',
  'FÉVRIER',
  'MARS',
  'AVRIL',
  'MAI',
  'JUIN',
  'JUILLET',
  'AOÛT',
  'SEPTEMBRE',
  'OCTOBRE',
  'NOVEMBRE',
  'DÉCEMBRE',
] as const

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const

export const parsePeriodParam = (raw: string | null): PeriodFilterValue => {
  if (!raw || raw === 'Toutes') return { mode: 'all' }
  if (raw === '30 derniers jours' || raw === '30d') return { mode: 'preset', preset: '30d' }
  if (raw === 'Cette année' || raw === 'year') return { mode: 'preset', preset: 'year' }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { mode: 'day', day: raw }
  if (/^\d{4}-\d{2}$/.test(raw)) return { mode: 'month', month: raw }
  return { mode: 'all' }
}

export const serializePeriodParam = (value: PeriodFilterValue): string | null => {
  if (value.mode === 'all') return null
  if (value.mode === 'preset') return value.preset === '30d' ? '30d' : 'year'
  if (value.mode === 'month') return value.month
  return value.day
}

export const periodFilterLabel = (value: PeriodFilterValue): string => {
  if (value.mode === 'all') return 'Toutes'
  if (value.mode === 'preset') return value.preset === '30d' ? '30 derniers jours' : 'Cette année'
  if (value.mode === 'month') {
    const [year, month] = value.month.split('-').map(Number)
    return `${MONTHS_FR[month - 1].toLocaleLowerCase('fr')} ${year}`
  }
  const [year, month, day] = value.day.split('-').map(Number)
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

export const matchesPeriodFilter = (isoDate: string, value: PeriodFilterValue, now = new Date()) => {
  if (value.mode === 'all') return true
  const published = new Date(`${isoDate}T00:00:00`)
  if (value.mode === 'preset') {
    const age = now.getTime() - published.getTime()
    if (value.preset === '30d') return age <= 30 * 86_400_000 && age >= 0
    return published.getFullYear() === now.getFullYear()
  }
  if (value.mode === 'month') return isoDate.startsWith(value.month)
  return isoDate === value.day
}

type PeriodCalendarFilterProps = {
  value: PeriodFilterValue
  onChange: (value: PeriodFilterValue) => void
  markedDates?: readonly string[]
  accent?: 'orange' | 'pink' | 'teal'
}

export default function PeriodCalendarFilter({
  value,
  onChange,
  markedDates = [],
  accent = 'orange',
}: PeriodCalendarFilterProps) {
  const initial = value.mode === 'month'
    ? value.month
    : value.mode === 'day'
      ? value.day.slice(0, 7)
      : new Date().toISOString().slice(0, 7)
  const [viewMonth, setViewMonth] = useState(initial)

  const [year, month] = viewMonth.split('-').map(Number)
  const cells = useMemo(() => buildMonthCells(year, month - 1), [year, month])

  const markedSet = useMemo(() => new Set(markedDates), [markedDates])
  const markedMonths = useMemo(
    () => new Set(markedDates.map((date) => date.slice(0, 7))),
    [markedDates],
  )

  const shiftMonth = (delta: number) => {
    const date = new Date(year, month - 1 + delta, 1)
    setViewMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  }

  const isSelectedDay = (day: string) => value.mode === 'day' && value.day === day
  const isSelectedMonth =
    value.mode === 'month' && value.month === viewMonth

  return (
    <div className={`period-cal period-cal--${accent}`}>
      <div className="period-cal__presets">
        <button
          type="button"
          className={value.mode === 'all' ? 'is-active' : ''}
          onClick={() => onChange({ mode: 'all' })}
        >
          Toutes
        </button>
        <button
          type="button"
          className={value.mode === 'preset' && value.preset === '30d' ? 'is-active' : ''}
          onClick={() => onChange({ mode: 'preset', preset: '30d' })}
        >
          30 derniers jours
        </button>
        <button
          type="button"
          className={value.mode === 'preset' && value.preset === 'year' ? 'is-active' : ''}
          onClick={() => onChange({ mode: 'preset', preset: 'year' })}
        >
          Cette année
        </button>
      </div>

      <div className="period-cal__head">
        <button type="button" className="period-cal__nav" aria-label="Mois précédent" onClick={() => shiftMonth(-1)}>
          ‹
        </button>
        <strong>{MONTHS_FR[month - 1]}</strong>
        <button type="button" className="period-cal__nav" aria-label="Mois suivant" onClick={() => shiftMonth(1)}>
          Next ›
        </button>
      </div>

      <button
        type="button"
        className={`period-cal__month${isSelectedMonth ? ' is-active' : ''}${markedMonths.has(viewMonth) ? ' has-mark' : ''}`}
        onClick={() => onChange({ mode: 'month', month: viewMonth })}
      >
        Tout le mois
      </button>

      <div className="period-cal__weekdays" aria-hidden="true">
        {WEEKDAYS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="period-cal__grid" role="grid" aria-label="Calendrier de période">
        {cells.map((cell) => {
          if (!cell.inMonth) {
            return <span key={cell.key} className="period-cal__day period-cal__day--muted" aria-hidden="true" />
          }
          const active = isSelectedDay(cell.iso)
          const marked = markedSet.has(cell.iso)
          return (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              className={[
                'period-cal__day',
                active ? 'is-active' : '',
                marked ? 'has-mark' : '',
              ].join(' ')}
              aria-pressed={active}
              onClick={() => onChange({ mode: 'day', day: cell.iso })}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      <p className="period-cal__year">{year}</p>
    </div>
  )
}

function buildMonthCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: Array<{ key: string; day: number; iso: string; inMonth: boolean }> = []

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({ key: `pad-${index}`, day: 0, iso: '', inMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ key: iso, day, iso, inMonth: true })
  }

  return cells
}
