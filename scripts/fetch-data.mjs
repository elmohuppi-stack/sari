#!/usr/bin/env node

/**
 * Lädt die SARI-Hospitalisierungsinzidenz des RKI herunter und legt sie als
 * data/SARI-Hospitalisierungsinzidenz.tsv ab.
 *
 * Usage: node scripts/fetch-data.mjs [--allow-empty]
 *
 * Quelle: https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz
 * Lizenz: CC-BY-4.0 (Quelle: Robert Koch-Institut)
 *
 * Die Datei wird erst geschrieben, nachdem der Abruf plausibel aussieht:
 * Header passt, genug Zeilen, bekannte Altersgruppe/SARI-Typ vorhanden.
 * Sonst bleibt der letzte gültige Stand liegen (Exit-Code 1).
 *
 * Abgerufen wird über raw.githubusercontent.com (kein API-Limit, kein Token).
 * Fällt GitHub aus, ist der Exit-Code != 0 — besser als ein stilles
 * Weiterlaufen mit alten Daten.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const TSV_PATH = resolve(ROOT, 'data', 'SARI-Hospitalisierungsinzidenz.tsv')
const REMOTE_URL =
  'https://raw.githubusercontent.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz/main/SARI-Hospitalisierungsinzidenz.tsv'

const EXPECTED_HEADER = [
  'Saison',
  'Kalenderwoche',
  'Altersgruppe',
  'SARI',
  'Hospitalisierungsinzidenz',
]

// Mindestumfang, damit eine abgeschnittene oder leere Datei auffällt.
// Der Datensatz beginnt 2014 und umfasst 4 SARI-Typen × 7 Altersgruppen,
// also deutlich mehr als 5000 Zeilen.
const MIN_ROWS = 5000

const allowEmpty = process.argv.includes('--allow-empty')

async function download() {
  console.log(`📥 Lade RKI-Daten: ${REMOTE_URL}`)
  const response = await fetch(REMOTE_URL, {
    headers: { 'User-Agent': 'sari-dashboard-datapipeline' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} beim Abruf der RKI-TSV`)
  }

  return response.text()
}

/**
 * Wandelt "2026-W45" in das Datum des Wochenendes (Sonntag) um. Der RKI-Stand
 * wird als "Daten bis einschließlich KW X" verstanden, der Sonntag ist damit
 * der letzte abgedeckte Tag.
 */
function parseWeekToDate(weekStr) {
  const match = /^(\d{4})-W(\d{1,2})$/.exec(weekStr ?? '')
  if (!match) return null

  const year = parseInt(match[1], 10)
  const week = parseInt(match[2], 10)

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1)

  const sunday = new Date(mondayOfWeek1)
  sunday.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7 + 6)
  return sunday
}

/** Letzte Kalenderwoche der Datei (lexikographisch = chronologisch bei YYYY-Www). */
function latestWeekOf(content) {
  let latest = ''
  for (const line of content.trim().split('\n').slice(1)) {
    const week = line.split('\t')[1]
    if (week && week > latest) latest = week
  }
  return latest
}

/**
 * Sammelt Auffälligkeiten in der geladenen Datei. Leeres Array = alles gut.
 */
function check(content) {
  const problems = []
  const lines = content.trim().split('\n')

  if (lines.length < 2) {
    problems.push('Datei enthält keine Datenzeilen')
    return problems
  }

  const header = lines[0].replace(/^\uFEFF/, '').split('\t')
  if (header.join('\t') !== EXPECTED_HEADER.join('\t')) {
    problems.push(`Unerwarteter Header: "${lines[0].slice(0, 120)}"`)
  }

  if (lines.length - 1 < MIN_ROWS) {
    problems.push(`Nur ${lines.length - 1} Datenzeilen, erwartet mindestens ${MIN_ROWS}`)
  }

  const ageGroups = new Set()
  const sariTypes = new Set()

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    if (cols.length !== 5) {
      problems.push(`Zeile ${i + 1}: ${cols.length} statt 5 Spalten`)
      break
    }
    ageGroups.add(cols[2])
    sariTypes.add(cols[3])
  }

  if (!ageGroups.has('00+')) problems.push('Altersgruppe "00+" fehlt')
  if (!sariTypes.has('Gesamt')) problems.push('SARI-Typ "Gesamt" fehlt')

  const latestWeek = latestWeekOf(content)
  const lastDate = parseWeekToDate(latestWeek)
  if (!lastDate) {
    problems.push(`Letzte Kalenderwoche nicht lesbar: "${latestWeek}"`)
  } else if (lastDate.getTime() > Date.now() + 7 * 24 * 60 * 60 * 1000) {
    problems.push(`Letzte Kalenderwoche liegt in der Zukunft: ${latestWeek}`)
  }

  return problems
}

/** Gleiche Datei wie lokal? Dann müssen wir nichts schreiben. */
function isUnchanged(content) {
  if (!existsSync(TSV_PATH)) return false
  return readFileSync(TSV_PATH, 'utf-8') === content
}

async function main() {
  let content
  try {
    content = await download()
  } catch (error) {
    if (allowEmpty) {
      console.warn(`⚠️  Abruf fehlgeschlagen (${error.message}) – --allow-empty gesetzt, breche ohne Fehler ab.`)
      return
    }
    console.error(`❌ Abruf fehlgeschlagen: ${error.message}`)
    console.error('   Die vorhandene TSV bleibt unverändert.')
    process.exit(1)
  }

  console.log(`🔍 Prüfe geladene Datei (${content.trim().split('\n').length - 1} Zeilen)...`)
  const problems = check(content)
  if (problems.length > 0) {
    console.error('❌ Die geladene Datei sieht nicht wie der erwartete Datensatz aus:')
    for (const problem of problems) console.error(`   - ${problem}`)
    console.error('   Die vorhandene TSV bleibt unverändert.')
    process.exit(1)
  }

  const latestWeek = latestWeekOf(content)
  const lastDate = parseWeekToDate(latestWeek)

  if (isUnchanged(content)) {
    console.log(`✅ Keine Änderung: RKI-Stand ist weiterhin ${latestWeek}`)
  } else {
    writeFileSync(TSV_PATH, content, 'utf-8')
    console.log(`✅ Geschrieben: ${TSV_PATH}`)
    console.log(`   RKI-Stand: ${latestWeek} (bis ${lastDate.toISOString().slice(0, 10)})`)
  }

  // Der Datenstand geht an transform.mjs: das Frontend zeigt damit
  // "Daten bis <Datum>" statt das Datum unseres Abrufs.
  console.log(`DATA_STAND=${lastDate.toISOString().slice(0, 10)}`)
}

main()
