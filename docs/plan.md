# Plan: Website zur Visualisierung der SARI-Hospitalisierungsinzidenz

## Ziel

Es soll eine öffentlich nutzbare Website entstehen, die die SARI-Hospitalisierungsinzidenz in Deutschland verständlich und grafisch darstellt. Nutzerinnen und Nutzer sollen die Daten nach Zeitraum, Altersgruppe und SARI-Typ filtern können. Zusätzlich soll es einen geschützten Admin-Bereich geben, über den neuere Daten aus der offiziellen Quelle des Robert Koch-Instituts aktualisiert werden können.

Quelle der Daten:

- https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz/blob/main/SARI-Hospitalisierungsinzidenz.tsv

## Inhaltlicher Plan

### 1. Kernnutzen der Website

Die Website soll auf einfache Fragen schnelle Antworten geben:

- Wie entwickelt sich die Hospitalisierungsinzidenz über die Zeit?
- Wie sieht die Entwicklung für eine bestimmte Altersgruppe aus?
- Wie unterscheiden sich Gesamt, COVID-19, Influenza und RSV?
- Wie sehen die Werte in einem frei gewählten Zeitraum aus?

Die Website ist damit primär ein Analyse- und Visualisierungstool, nicht nur eine Download-Seite für Rohdaten.

### 2. Inhaltliche Bausteine der öffentlichen Website

Die öffentliche Website sollte aus folgenden Bereichen bestehen:

1. Startbereich mit Titel, kurzer Erklärung und direktem Einstieg in die Visualisierung
2. Filterbereich für Zeitraum, Altersgruppe und SARI-Typ
3. Hauptdiagramm zur Entwicklung der Hospitalisierungsinzidenz
4. Kennzahlenbereich mit kompakten Zusammenfassungen zum aktuellen Filter
5. Tabellarische Ansicht oder Exportmöglichkeit für die gefilterten Daten
6. Methoden- und Quellenbereich mit kurzer fachlicher Einordnung
7. Impressum
8. Datenschutzerklärung

### 3. Filter und Interaktion

Geplante Filter:

- Zeitraum:
  - letzte 6 Monate
  - letzte 12 Monate
  - bestimmtes Jahr
  - gesamter Zeitraum
- Altersgruppe:
  - 00+
  - 0-4
  - 5-14
  - 15-34
  - 35-59
  - 60-79
  - 80+
- SARI-Typ:
  - Gesamt
  - COVID-19
  - Influenza
  - RSV

Empfehlung für spätere Erweiterung:

- Auswahl nach Saison zusätzlich zum Kalenderjahr
- Vergleich von zwei Gruppen oder zwei SARI-Typen gleichzeitig

### 4. Grafische Darstellung

Primäre Visualisierung:

- Liniendiagramm für die zeitliche Entwicklung

Zusätzliche Elemente:

- Tooltip mit Kalenderwoche, Saison, Altersgruppe, SARI-Typ und Wert
- Kennzahlenkarten mit:
  - aktuellstem Wert im Filter
  - Maximum im gewählten Zeitraum
  - Durchschnitt im gewählten Zeitraum
- Tabelle der aktuell gefilterten Werte

Darstellungsregeln:

- Y-Achse immer als Hospitalisierungsinzidenz pro 100.000 Einwohner
- X-Achse als Wochenverlauf
- einheitliche Farbgebung je SARI-Typ
- keine stillschweigende Glättung oder Interpolation von fehlenden Werten
- klare Anzeige des letzten verfügbaren Datenstands

### 5. Rechtliche Inhalte in Deutschland

Für eine öffentlich zugängliche Website in Deutschland sollten mindestens diese Inhalte vorgesehen werden:

1. Impressum
2. Datenschutzerklärung

Pragmatische Einordnung:

- Ein Impressum ist für ein veröffentlichtes Webangebot in Deutschland in der Regel erforderlich.
- Eine Datenschutzerklärung ist erforderlich, sobald personenbezogene Daten verarbeitet werden oder Dienste eingesetzt werden, bei denen Daten anfallen können. Das ist praktisch fast immer relevant, zum Beispiel bei Hosting-Logs, Webanalyse, Kontaktformularen oder externen Schriftarten.

Empfehlung für das Projekt:

- Impressum und Datenschutzerklärung von Anfang an als feste Seiten einplanen
- keine unnötigen Third-Party-Dienste einbinden, um die Datenschutzanforderungen schlank zu halten
- möglichst lokale Assets statt externer Fonts oder Tracker verwenden

Hinweis:

- Das ist keine Rechtsberatung. Vor Veröffentlichung sollte der konkrete Inhalt von Impressum und Datenschutzerklärung auf den tatsächlichen Betreiber, das Hosting und die eingebundenen Dienste abgestimmt werden.

## Form und UX

### 1. Gestalterische Richtung

Die Website sollte sachlich, modern und belastbar wirken. Der Stil muss eher wie ein gutes Datenprodukt als wie eine Marketingseite funktionieren.

Empfohlene Prinzipien:

- klare visuelle Hierarchie
- ruhige, seriöse Farbwelt
- hohe Lesbarkeit auf Desktop und Mobilgeräten
- Fokus auf Diagramm und Filter statt dekorativer Elemente

### 2. Seitenaufbau

Vorgeschlagene Struktur der Startseite:

1. Header mit Titel, Kurzbeschreibung und Navigation
2. Filterleiste
3. Hauptdiagramm
4. Kennzahlenkarten
5. Datentabelle oder Downloadbereich
6. Kontextblock mit Quelle und Methodik
7. Footer mit Impressum, Datenschutz und Datenquelle

### 3. Mobile Verhalten

Für kleine Bildschirme:

- Filter untereinander statt nebeneinander
- Diagramm über volle Breite
- Kennzahlen im kompakten Grid
- Tabelle reduziert oder einklappbar

## Technischer Plan

### 1. Frontend-Stack

Gewünschter Stack:

- Vue 3
- TypeScript
- Vite
- Tailwind CSS

Ergänzende Empfehlungen:

- Vue Router für Seiten und Admin-Bereich
- Pinia für überschaubaren globalen State
- vue-echarts mit Apache ECharts für Diagramme
- Papa Parse oder d3-dsv zum TSV-Parsing
- date-fns für Datumslogik

Begründung:

- Vue 3 ist gut für eine schlanke, interaktive Datenanwendung geeignet.
- Tailwind CSS beschleunigt die UI-Umsetzung und erleichtert ein konsistentes Designsystem.
- ECharts ist für Zeitreihen, Tooltips, Responsiveness und spätere Erweiterungen sehr geeignet.

### 2. Brauchen wir ein Backend?

Kurzantwort:

- Für die reine Anzeige der Daten: nein, nicht zwingend.
- Für einen echten Admin-Workflow zum Aktualisieren der Daten: ja, empfohlen.

Begründung:

Ohne Backend wäre eine einfache Website möglich, die direkt eine lokale TSV-Datei oder die Rohdatei von GitHub einliest. Das reicht für eine reine Visualisierung.

Sobald aber diese Anforderungen hinzukommen, ist ein Backend sinnvoll:

- geschützter Admin-Zugang
- kontrolliertes Aktualisieren der Daten
- Validierung der eingelesenen TSV-Datei
- Protokollierung, wann und von wem ein Update ausgelöst wurde
- Versionierung oder Rückfall auf den letzten gültigen Datenstand
- stabile Bereitstellung der aufbereiteten Daten an das Frontend

Empfehlung:

- Frontend als statische Vue-Anwendung
- kleines Backend für Admin und Datensynchronisierung

### 3. Empfohlene Zielarchitektur

#### Öffentlicher Bereich

- Vue-App rendert Diagramm, Filter und Kontextinformationen
- öffentliche App konsumiert bereits validierte und normalisierte Daten im JSON-Format

#### Admin-Bereich

- Login für Admin-Nutzer
- Button oder Formular: "Neueste RKI-Daten importieren"
- Backend lädt die aktuelle TSV-Datei von der offiziellen Quelle
- Backend validiert Struktur und Inhalte
- Backend speichert neuen Snapshot
- Backend veröffentlicht den neuen Datenstand für das Frontend

#### Datenfluss

1. Admin startet Import
2. Backend lädt TSV von GitHub
3. Backend prüft Dateiformat und Spalten
4. Backend transformiert TSV in ein sauberes internes Format
5. Backend speichert Rohdatei und normalisierte Daten
6. Frontend verwendet nur den freigegebenen letzten gültigen Stand

### 4. Datenmodell und Aufbereitung

Ausgangsfelder im Datensatz:

- Saison
- Kalenderwoche
- Altersgruppe
- SARI
- Hospitalisierungsinzidenz

Empfohlene interne Anreicherung:

- weekStartDate als echtes Datum für die Kalenderwoche
- year als Kalenderjahr
- season als unveränderte Saisonangabe
- ageGroup als normalisierte Altersgruppe
- sariType als normalisierter SARI-Wert
- incidence als numerischer Wert
- importedAt als Zeitstempel des Imports
- sourceVersion oder sourceHash zur Nachvollziehbarkeit

Wichtig:

- Der Zeitraum "letzte 6 Monate" und "letzte 12 Monate" sollte sich am letzten verfügbaren Datenpunkt orientieren, nicht am heutigen Datum.
- Für "bestimmtes Jahr" muss fachlich sauber definiert werden, ob Kalenderjahr oder Saison gemeint ist. Für den MVP wird Kalenderjahr empfohlen.

### 5. Backend-Optionen

#### Option A: Eigenes kleines Backend

Technologien:

- Node.js
- Fastify oder Express
- SQLite oder Postgres

Vorteile:

- volle Kontrolle
- einfacher Admin-Workflow
- gut erweiterbar

Nachteile:

- mehr Betriebsaufwand

#### Option B: Backend as a Service

Technologien:

- Supabase für Auth und Datenbank
- Serverless Function für Importjob

Vorteile:

- weniger Infrastrukturarbeit
- schneller Start
- Auth, Datenbank und Storage schon vorhanden

Nachteile:

- Abhängigkeit von externer Plattform
- etwas mehr Produktbindung an den Anbieter

Empfehlung für dieses Projekt:

- Wenn schnell geliefert werden soll: Supabase plus Serverless Importfunktion
- Wenn volle Kontrolle und langfristige Eigenständigkeit wichtig sind: kleines Node-Backend mit Datenbank

## Admin-Funktion zum Aktualisieren der Daten

### 1. Ziel

Als Admin soll man die aktuellen Zahlen aus der offiziellen GitHub-Quelle aktualisieren können, ohne das Frontend manuell neu bauen oder Dateien per Hand austauschen zu müssen.

### 2. Minimaler Admin-Workflow

1. Admin meldet sich an
2. Admin sieht den aktuell veröffentlichten Datenstand
3. Admin klickt auf "Daten aktualisieren"
4. System lädt die neueste TSV-Datei von GitHub
5. System validiert die Datei
6. System zeigt Importergebnis an
7. System veröffentlicht den neuen Stand oder verwirft ihn bei Fehlern

### 3. Validierungen beim Import

Vor der Veröffentlichung müssen mindestens diese Prüfungen laufen:

- TSV ist erreichbar
- Header entspricht dem erwarteten Schema
- Pflichtspalten vorhanden
- Werteformate plausibel
- Hospitalisierungsinzidenz numerisch und nicht negativ
- Altersgruppe und SARI-Typ nur aus erlaubten Werten
- keine leeren Schlüsselfelder

### 4. Admin-Oberfläche

Die Admin-Seite sollte enthalten:

- letzter Importzeitpunkt
- Quelle der zuletzt importierten Datei
- Anzahl importierter Datensätze
- Status des Imports
- Button zum manuellen Aktualisieren
- optional Vorschau der Änderungen vor Veröffentlichung

### 5. Sicherheitsanforderungen

- Admin-Bereich nur nach Login erreichbar
- Import-Endpunkt geschützt
- einfache Rollenlogik reicht zunächst aus: admin
- Rate Limiting für Import-Endpunkt
- Logging für erfolgreiche und fehlgeschlagene Updates

## Umsetzung in Phasen

### Phase 1: Konzept und Setup

1. Informationsarchitektur festlegen
2. Designrichtung und Wireframe definieren
3. Vue-, Vite- und Tailwind-Projekt aufsetzen
4. Routing-Grundstruktur anlegen

Ergebnis:

- laufendes Frontend-Grundgerüst

### Phase 2: Datenverarbeitung und Visualisierung

1. TSV parsern und internes Datenmodell definieren
2. Datumslogik für Kalenderwochen implementieren
3. Filterlogik für Zeitraum, Altersgruppe und SARI-Typ bauen
4. Hauptdiagramm und Kennzahlenkarten umsetzen
5. Tabellarische Ansicht ergänzen

Ergebnis:

- funktionierende öffentliche Visualisierung mit statischen oder lokal geladenen Daten

### Phase 3: Recht und Inhaltsseiten

1. Impressumsseite anlegen
2. Datenschutzseite anlegen
3. Quellen- und Methodikbereich ergänzen

Ergebnis:

- veröffentlichungsfähige Grundstruktur mit Pflichtseiten

### Phase 4: Backend und Admin-Funktionen

1. Authentifizierung für Admins einführen
2. Import-Endpunkt für die RKI-TSV bauen
3. Validierung und Speicherung implementieren
4. Admin-Seite für manuelle Aktualisierung bauen
5. Veröffentlichung des letzten gültigen Datenstands umsetzen

Ergebnis:

- kontrollierte Datenaktualisierung ohne manuelle Dateipflege im Frontend

### Phase 5: Qualität und Deployment

1. Tests für Parsing, Filter und Importvalidierung
2. Responsive Optimierung
3. Accessibility-Prüfung
4. Deployment-Setup für Frontend und Backend
5. Monitoring und Fehlerlogging

Ergebnis:

- belastbarer erster Release

## MVP-Empfehlung

Für eine erste sinnvolle Version sollte umgesetzt werden:

1. öffentliche Startseite mit Diagramm
2. Filter für Zeitraum, Altersgruppe und SARI-Typ
3. Kennzahlenkarten
4. Datentabelle oder CSV-Export für den gefilterten Ausschnitt
5. Impressum und Datenschutzerklärung
6. Admin-Login
7. manueller Import der neuesten TSV-Daten über das Backend

## Offene fachliche Entscheidungen

Vor der Umsetzung sollten diese Punkte final entschieden werden:

1. Soll "bestimmtes Jahr" als Kalenderjahr oder als Saison verstanden werden?
2. Soll es im MVP nur Einzelauswahl oder direkt Vergleichsansichten geben?
3. Sollen Rohdaten im Frontend zusätzlich downloadbar sein?
4. Soll ein Import sofort live gehen oder erst nach Vorschau und Freigabe?
5. Wo soll die Anwendung gehostet werden?

## Konkrete Empfehlung

Empfohlener Start:

- Frontend mit Vue 3, TypeScript, Vite und Tailwind CSS
- Diagramme mit ECharts
- öffentliches Frontend als statische App
- kleines Backend oder BaaS für Admin-Login und Datenimport

Diese Kombination hält den öffentlichen Teil einfach und performant, schafft aber gleichzeitig die nötige Kontrolle für einen echten Admin-Prozess zur Datenaktualisierung.
