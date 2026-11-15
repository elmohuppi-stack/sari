export interface SariDataRow {
  season: string
  kalenderwoche: number
  altersgruppe: string
  sari: number | null
  covid19: number | null
  influenza: number | null
  rsv: number | null
}

export interface SariDataPoint {
  season: string
  kalenderwoche: string
  weekStartDate: string // ISO date
  year: number
  ageGroup: string
  sariType: SariType
  incidence: number | null
}

export type SariType = 'Gesamt' | 'COVID-19' | 'Influenza' | 'RSV'

export type AgeGroup = '00+' | '0-4' | '5-14' | '15-34' | '35-59' | '60-79' | '80+'

/**
 * Zeitraum-Filter. Neben 'all' gibt es zwei Formen:
 *   'from-2024/25' – ab dieser Saison bis heute
 *   '2026/27'      – genau diese Saison
 * Die verfügbaren Werte kommen aus den Daten (siehe dataStore.seasons),
 * damit eine neue Saison nicht im Code nachgetragen werden muss.
 */
export type TimeRange = 'all' | `from-${string}` | `${number}/${number}`

export interface FilterState {
  timeRange: TimeRange
  ageGroup: AgeGroup
  sariType: SariType
}

export interface KeyFigure {
  label: string
  value: string
  description: string
}
