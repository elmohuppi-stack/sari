#!/usr/bin/env node

/**
 * Transformiert die SARI-Hospitalisierungsinzidenz TSV-Datei in das
 * interne JSON-Format für das Frontend.
 *
 * Usage: node scripts/transform.mjs
 *
 * Erwartet: data/SARI-Hospitalisierungsinzidenz.tsv
 * Erzeugt:  data/sari-data.json
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
 * Parst eine Kalenderwoche im Format "2026-W18" und gibt das Datum
 * des Montags dieser Woche als ISO-String zurück.
 */
function parseCalendarWeek(weekStr) {
  const match = weekStr.match(/^(\d{4})-W(\d{1,2})$/)
  if (!match) return null

  const year = parseInt(match[1], 10)
  const week = parseInt(match[2], 10)

  // ISO Wochendatum: Der 4. Januar ist immer in KW 1
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7 // Sonntag = 7
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1)

  const monday = new Date(mondayOfWeek1)
  monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7)

  return monday.toISOString().split('T')[0]
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

  // Header prüfen
  const header = lines[0].split('\t')
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

    const weekStartDate = parseCalendarWeek(week)
    const year = extractYearFromSeason(season)
    const incidenceNum = incidence !== '' ? parseFloat(incidence) : null

    dataPoints.push({
      season,
      kalenderwoche: week,
      weekStartDate,
      year,
      ageGroup,
      sariType,
      incidence: incidenceNum,
    })
  }

  const now = new Date().toISOString()
  const output = {
    lastUpdated: now,
    data: dataPoints,
  }

  writeFileSync(JSON_PATH, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`✅ ${dataPoints.length} Datenpunkte geschrieben nach: ${JSON_PATH}`)
  console.log(`   Letztes Update: ${now}`)
}

transform()
