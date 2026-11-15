#!/usr/bin/env node

/**
 * Zeigt den Datenstand aus data/sari-data.json an – für den Blick nach dem
 * Datenlauf und für den GitHub-Action-Schritt, der die Commit-Nachricht baut.
 *
 * Usage: node scripts/data-report.mjs [--github-output]
 *
 *   --github-output  schreibt data_stand / latest_week / data_points in
 *                    $GITHUB_OUTPUT (nur innerhalb einer Action sinnvoll)
 */

import { readFileSync, appendFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const JSON_PATH = resolve(ROOT, 'data', 'sari-data.json')

const json = JSON.parse(readFileSync(JSON_PATH, 'utf-8'))
const { dataStand, latestWeek, firstWeek, lastUpdated, data } = json

const values = data ?? []
const seasons = [...new Set(values.map((d) => d.season))].sort()

console.log(`Datenstand:      ${dataStand ?? '—'}`)
console.log(`Letzte KW:       ${latestWeek ?? '—'}`)
console.log(`Erste KW:        ${firstWeek ?? '—'}`)
console.log(`Datenpunkte:     ${values.length}`)
console.log(`Saisons:         ${seasons.join(', ')}`)
console.log(`JSON erzeugt am: ${lastUpdated ?? '—'}`)

if (process.argv.includes('--github-output')) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) {
    console.error('❌ --github-output gesetzt, aber $GITHUB_OUTPUT fehlt (läuft nicht in einer Action).')
    process.exit(1)
  }
  // Leere Werte bekommen einen Platzhalter: die Commit-Nachricht im Workflow
  // wird aus diesen Outputs gebaut und soll nie "RKI-Stand  ()" heißen.
  appendFileSync(
    output,
    [
      `data_stand=${dataStand ?? 'unbekannt'}`,
      `latest_week=${latestWeek ?? 'unbekannt'}`,
      `data_points=${values.length}`,
      '',
    ].join('\n'),
    'utf-8'
  )
}
