# SARI Dashboard

Dieses Repository dient als Grundlage fuer eine Webanwendung zur grafischen Darstellung der SARI-Hospitalisierungsinzidenz in Deutschland.

Ziel ist eine oeffentliche Website, auf der sich die Daten nach Zeitraum, Altersgruppe und SARI-Typ filtern und als interaktive Zeitreihe anzeigen lassen.

## Projektziel

Die Anwendung soll die SARI-Daten des Robert Koch-Instituts verstaendlich und nutzerfreundlich visualisieren.

Geplante Kernfunktionen:

- Darstellung der Hospitalisierungsinzidenz als Zeitreihe
- Filter fuer Zeitraum
- Filter fuer Altersgruppe
- Filter fuer SARI-Typ
- Kennzahlen zum aktuell gewaehlten Ausschnitt
- tabellarische Ansicht oder Export der gefilterten Daten
- geschuetzter Admin-Bereich zum Aktualisieren neuer Datenstaende

## Geplante Filter

- letzte 6 Monate
- letzte 12 Monate
- bestimmtes Jahr
- gesamter Zeitraum
- Altersgruppen von `0-4` bis `80+` sowie `00+`
- SARI-Typen `Gesamt`, `COVID-19`, `Influenza`, `RSV`

## Geplanter Stack

Frontend:

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- ECharts fuer Diagramme

Backend:

- schlankes Backend fuer Admin-Login und Datenaktualisierung
- Import der aktuellen TSV-Datei aus der offiziellen RKI-Quelle
- Validierung und Freigabe neuer Datenstaende

## Brauchen wir ein Backend?

Fuer die reine Visualisierung waere kein Backend zwingend notwendig.

Da dieses Projekt aber einen Admin-Workflow fuer Datenupdates bekommen soll, ist ein Backend oder eine vergleichbare BaaS-Loesung sinnvoll. Es wird benoetigt fuer:

- geschuetzten Admin-Zugang
- manuellen oder spaeter automatisierten Datenimport
- Validierung der importierten TSV-Datei
- Speicherung des letzten gueltigen Datenstands
- kontrollierte Freigabe aktualisierter Daten fuer das Frontend

## Datenquelle

Die Datengrundlage stammt aus dem offiziellen Repository des Robert Koch-Instituts:

- https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz

Direkte Quelldatei:

- https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz/blob/main/SARI-Hospitalisierungsinzidenz.tsv

Die originale Datensatzdokumentation liegt in diesem Repository aktuell in der Datei [Readme-RKI.md](Readme-RKI.md).

## Rechtliche Seiten

Fuer die geplante Veroeffentlichung in Deutschland sollen von Anfang an diese Seiten vorgesehen werden:

- Impressum
- Datenschutzerklaerung

Hinweis: Die konkrete Ausgestaltung muss vor dem Launch auf Betreiber, Hosting und eingesetzte Dienste abgestimmt werden.

## Projektstatus

Das Projekt befindet sich aktuell in der Konzeptions- und Planungsphase.

Der naechste groessere Schritt ist das Aufsetzen des Frontends mit Vue, Vite und Tailwind sowie die Definition des Datenmodells fuer Import, Filterung und Visualisierung.

## Repository-Struktur

- [README.md](README.md): Projektbeschreibung dieses Dashboards
- [plan.md](plan.md): fachlicher und technischer Umsetzungsplan
- [Readme-RKI.md](Readme-RKI.md): originale bzw. uebernommene Datensatzdokumentation
- [data/SARI-Hospitalisierungsinzidenz.tsv](data/SARI-Hospitalisierungsinzidenz.tsv): lokale Datendatei
- [LIZENZ.txt](LIZENZ.txt): Lizenztext

## Naechste Schritte

1. Frontend-Grundgeruest mit Vue 3, Vite, TypeScript und Tailwind aufsetzen
2. TSV-Daten einlesen und in ein internes Datenmodell ueberfuehren
3. Zeitfilter und Diagrammkomponenten implementieren
4. Impressum und Datenschutzerklaerung als eigene Seiten anlegen
5. Admin-Workflow fuer Datenupdates entwerfen und umsetzen
