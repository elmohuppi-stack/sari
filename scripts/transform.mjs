#!/usr/bin/env node

/**
 * Transformiert die SARI-Hospitalisierungsinzidenz TSV-Datei in das
 * interne JSON-Format für das Frontend.
 *
 * Usage: node scripts/transform.mjs [--data-date=YYYY-MM-DD]
 *
 * Erwartet: data/SARI-Hospitalisierungsinzidenz.tsv
 * Erzeugt:  data/sari-data.json
 *
 * `--data-date` ist der Datenstand, den scripts/fetch-data.mjs aus der
 * letzten Kalenderwoche ableitet (Sonntag dieser Woche). Ohne Angabe wird
 * er hier selbst berechnet. Im JSON steht er als `dataStand`; das Frontend
 * zeigt damit "Daten bis …" statt des Zeitpunkts unseres Builds.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const TSV_PATH = resolve(ROOT, 'data', 'SARI-Hospitalisierungsinzidenz.tsv')
const JSON_PATH = resolve(ROOT, 'data', 'sari-data.json')

const VALID_AGE_GROUPS = new Set(['00+', '0-4', '5-14', '15-34', '35-59', '60-79', '80+'])
const VALID_SARI_TYPES = new Set(['Gesamt', 'COVID-19', 'Influenza', 'RSV'])

/**
 * Montag der Kalenderwoche als ISO-String, gerechnet in UTC.
 * UTC ist hier Pflicht: der Rechner läuft in Europe/Berlin, GitHub Actions in
 * UTC. Mit lokalen Date-Objekten käme je nach Zeitzone ein anderer Tag heraus.
 */
function weekStartDate(weekStr) {
  const match = weekStr.match(/^(\d{4})-W(\d{1,2})$/)
  if (!match) return null

  const year = parseInt(match[1], 10)
  const week = parseInt(match[2], 10)

  // ISO-Wochen: Der 4. Januar liegt immer in KW 1.
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7 // Sonntag = 7
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1)

  const monday = new Date(mondayOfWeek1)
  monday.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7)

  return monday.toISOString().split('T')[0]
}

/**
 * Sonntag der Woche als ISO-String – der letzte Tag, den eine Kalenderwoche
 * abdeckt. Dient als Datenstand, wenn fetch-data.mjs keinen übergibt.
 */
function weekEndDate(weekStr) {
  const monday = weekStartDate(weekStr)
  if (!monday) return null
  const date = new Date(`${monday}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 6)
  return date.toISOString().split('T')[0]
}

/** Argumente der Form --name=wert einsammeln. */
function parseArgs(argv) {
  const args = {}
  for (const arg of argv.slice(2)) {
    const match = /^--([^=]+)=(.*)$/.exec(arg)
    if (match) args[match[1]] = match[2]
  }
  return args
}

/**
 * Extrahiert das Kalenderjahr aus einer Saison-Angabe wie "2025/26".
 * Nimmt den ersten Teil (Startjahr).
 */
function extractYearFromSeason(season) {
  const match = season.match(/^(\d{4})/)
  if (match) return parseInt(match[1], 10)
  return null
}

function validate() {
  const errors = []

  if (!existsSync(TSV_PATH)) {
    errors.push(`TSV-Datei nicht gefunden: ${TSV_PATH}`)
    return errors
  }

  const content = readFileSync(TSV_PATH, 'utf-8')
  const lines = content.trim().split('\n')

  if (lines.length < 2) {
    errors.push('TSV-Datei enthält keine Datenzeilen')
    return errors
  }

  // Header prüfen. Ein BOM am Dateianfang wird entfernt – fetch-data.mjs
  // akzeptiert es ebenfalls, sonst würde der Abruf die Datei durchlassen und
  // erst dieser Schritt daran scheitern.
  const header = lines[0].replace(/^\uFEFF/, '').split('\t')
  const expectedHeader = ['Saison', 'Kalenderwoche', 'Altersgruppe', 'SARI', 'Hospitalisierungsinzidenz']
  for (let i = 0; i < expectedHeader.length; i++) {
    if (header[i] !== expectedHeader[i]) {
      errors.push(`Erwartete Spalte "${expectedHeader[i]}" an Position ${i}, gefunden: "${header[i]}"`)
    }
  }

  // Datenzeilen prüfen (stichprobenartig)
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    const lineNum = i + 1

    if (cols.length !== 5) {
      errors.push(`Zeile ${lineNum}: Erwarte 5 Spalten, gefunden ${cols.length}`)
      continue
    }

    const [season, week, ageGroup, sariType, incidence] = cols

    if (!season) errors.push(`Zeile ${lineNum}: Saison ist leer`)
    if (!week) errors.push(`Zeile ${lineNum}: Kalenderwoche ist leer`)
    if (!ageGroup) errors.push(`Zeile ${lineNum}: Altersgruppe ist leer`)
    if (!sariType) errors.push(`Zeile ${lineNum}: SARI-Typ ist leer`)

    if (ageGroup && !VALID_AGE_GROUPS.has(ageGroup)) {
      errors.push(`Zeile ${lineNum}: Ungültige Altersgruppe "${ageGroup}"`)
    }

    if (sariType && !VALID_SARI_TYPES.has(sariType)) {
      errors.push(`Zeile ${lineNum}: Ungültiger SARI-Typ "${sariType}"`)
    }

    if (incidence !== undefined && incidence !== '') {
      const num = parseFloat(incidence)
      if (isNaN(num) || num < 0) {
        errors.push(`Zeile ${lineNum}: Ungültiger Inzidenzwert "${incidence}"`)
      }
    }
  }

  return errors
}

function transform() {
  const args = parseArgs(process.argv)

  console.log('🔍 Validiere TSV-Datei...')
  const errors = validate()

  if (errors.length > 0) {
    console.error('❌ Validierungsfehler:')
    for (const err of errors) {
      console.error(`   - ${err}`)
    }
    console.error('❌ Keine JSON-Datei geschrieben – letzter gültiger Stand bleibt erhalten.')
    process.exit(1)
  }

  console.log('✅ Validierung erfolgreich')
  console.log('🔄 Transformiere Daten...')

  const content = readFileSync(TSV_PATH, 'utf-8')
  const lines = content.trim().split('\n')

  const dataPoints = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    const [season, week, ageGroup, sariType, incidence] = cols

    const weekStart = weekStartDate(week)
    const year = extractYearFromSeason(season)
    const incidenceNum = incidence !== '' ? parseFloat(incidence) : null

    dataPoints.push({
      season,
      kalenderwoche: week,
      weekStartDate: weekStart,
      year,
      ageGroup,
      sariType,
      incidence: incidenceNum,
    })
  }

  // Metadaten für das Frontend: Zeitraum-Filter und Kopfzeile werden daraus
  // erzeugt, statt Saisons im Code fest zu verdrahten.
  const weeks = [...new Set(dataPoints.map((d) => d.kalenderwoche))].sort()
  const latestWeek = weeks[weeks.length - 1] ?? null
  const firstWeek = weeks[0] ?? null
  const latestPoint = dataPoints.reduce(
    (latest, point) => (latest === null || point.kalenderwoche > latest.kalenderwoche ? point : latest),
    null
  )

  // Der Datenstand kommt von fetch-data.mjs (Sonntag der letzten KW) oder wird
  // hier aus der letzten Kalenderwoche berechnet.
  const dataStand = args['data-date'] ?? (latestWeek ? weekEndDate(latestWeek) : null)

  // lastUpdated nur dann erneuern, wenn sich die Daten wirklich geändert haben.
  // Sonst erzeugt jeder Lauf einen Diff aus einer einzigen Zeile, die Action
  // committet und deployt wöchentlich ohne Anlass. dataStand und die
  // Datenpunkte bleiben dabei identisch.
  const previous = existsSync(JSON_PATH)
    ? JSON.parse(readFileSync(JSON_PATH, 'utf-8'))
    : null

  const dataChanged =
    previous === null ||
    previous.dataStand !== dataStand ||
    previous.latestWeek !== latestWeek ||
    JSON.stringify(previous.data) !== JSON.stringify(dataPoints)

  const now = new Date().toISOString()
  const output = {
    lastUpdated: dataChanged ? now : (previous?.lastUpdated ?? now),
    dataStand,
    latestWeek,
    firstWeek,
    latestSeason: latestPoint?.season ?? null,
    data: dataPoints,
  }

  writeFileSync(JSON_PATH, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`✅ ${dataPoints.length} Datenpunkte geschrieben nach: ${JSON_PATH}`)
  console.log(
    dataChanged
      ? `   Letztes Update: ${output.lastUpdated} (Daten geändert)`
      : `   Letztes Update: ${output.lastUpdated} (unverändert – Zeitstempel beibehalten)`
  )
  console.log(`   Datenstand:     ${output.dataStand} (letzte KW: ${latestWeek})`)
}

transform()
