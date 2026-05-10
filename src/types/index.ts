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
  kalenderwoche: number
  weekStartDate: string // ISO date
  year: number
  ageGroup: string
  sariType: SariType
  incidence: number | null
}

export type SariType = 'Gesamt' | 'COVID-19' | 'Influenza' | 'RSV'

export type AgeGroup = '00+' | '0-4' | '5-14' | '15-34' | '35-59' | '60-79' | '80+'

export type TimeRange = '2025/26' | 'from-2024/25' | 'from-2023/24' | 'from-2022/23' | 'from-2021/22' | 'from-2020/21' | 'from-2019/20' | 'from-2018/19' | 'from-2017/18' | 'all'

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
