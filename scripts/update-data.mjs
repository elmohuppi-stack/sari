#!/usr/bin/env node

/**
 * Kompletter Datenlauf: RKI-TSV herunterladen, prüfen und in data/sari-data.json
 * umwandeln. Das ist der Einstiegspunkt für die wöchentliche Automatisierung.
 *
 * Usage: node scripts/update-data.mjs [--skip-fetch]
 *
 *   1. fetch-data.mjs  – holt die TSV von GitHub (RKI) und prüft sie
 *   2. transform.mjs   – erzeugt die JSON für das Frontend
 *
 * Schlägt Schritt 1 fehl, bleibt alles beim letzten gültigen Stand und der
 * Exit-Code ist 1. --skip-fetch verwandelt nur die bereits vorhandene TSV neu
 * (z.B. nach Änderungen an transform.mjs).
 */

import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const skipFetch = process.argv.includes('--skip-fetch')

let dataStand = null

if (!skipFetch) {
  const fetch = spawnSync(process.execPath, [resolve(__dirname, 'fetch-data.mjs')], {
    cwd: ROOT,
    encoding: 'utf-8',
  })

  process.stdout.write(fetch.stdout ?? '')
  process.stderr.write(fetch.stderr ?? '')

  if (fetch.status !== 0) {
    console.error('❌ Datenabruf fehlgeschlagen – Transformation wird nicht ausgeführt.')
    process.exit(fetch.status ?? 1)
  }

  // fetch-data.mjs gibt den Datenstand als letzte Zeile "DATA_STAND=…" aus.
  const match = /^DATA_STAND=(\d{4}-\d{2}-\d{2})$/m.exec(fetch.stdout ?? '')
  dataStand = match ? match[1] : null
}

const transformArgs = [resolve(__dirname, 'transform.mjs')]
if (dataStand) transformArgs.push(`--data-date=${dataStand}`)

console.log('')
const transform = spawnSync(process.execPath, transformArgs, {
  cwd: ROOT,
  encoding: 'utf-8',
  stdio: 'inherit',
})

if (transform.status !== 0) {
  console.error('❌ Transformation fehlgeschlagen – data/sari-data.json wurde nicht ersetzt.')
  process.exit(transform.status ?? 1)
}

console.log('')
console.log('✅ Datenlauf abgeschlossen.')
if (dataStand) {
  // Für den Workflow: daraus wird die Commit-Nachricht gebaut.
  console.log(`DATA_STAND=${dataStand}`)
}
