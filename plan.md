# Plan: SARI-Dashboard

## Ziel

Es soll eine öffentlich nutzbare Website entstehen, die die SARI-Hospitalisierungsinzidenz in Deutschland verständlich und grafisch darstellt. Nutzerinnen und Nutzer sollen die Daten nach Zeitraum, Altersgruppe und SARI-Typ filtern können.

Die Website wird als **statische Vue-App** gebaut und per **Docker + nginx** auf einem **Hetzner Cloud Server** ausgeliefert. Es gibt kein Backend und keinen Admin-Bereich. Die Daten werden manuell über ein Transformationsskript aktualisiert.

- **Subdomain:** `sari.elmarhepp.de` (Wildcard-DNS)
- **Deployment:** Docker-Container auf Hetzner, Reverse Proxy leitet an den Container weiter

Quelle der Daten:
- https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz/blob/main/SARI-Hospitalisierungsinzidenz.tsv

---

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

---

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

---

## Technischer Plan

### 1. Frontend-Stack

Gewünschter Stack:

- Vue 3
- TypeScript
- Vite
- Tailwind CSS

Ergänzende Empfehlungen:

- Vue Router für Seiten
- Pinia für State-Management mit drei Stores:
  - **useDataStore** – lädt und hält die vollständigen Daten
  - **useFilterStore** – aktuelle Filterauswahl (Zeitraum, Altersgruppe, SARI-Typ)
  - **useUiStore** – mobil aufgeklappte Filter, aktiver Tab, etc.
- vue-echarts mit Apache ECharts für Diagramme
- Papa Parse oder d3-dsv zum TSV-Parsing
- date-fns für Datumslogik
- @vueuse/core für Utility-Funktionen (Responsive Breakpoints, useFetch, useLocalStorage)

Begründung:

- Vue 3 ist gut für eine schlanke, interaktive Datenanwendung geeignet.
- Tailwind CSS beschleunigt die UI-Umsetzung und erleichtert ein konsistentes Designsystem.
- ECharts ist für Zeitreihen, Tooltips, Responsiveness und spätere Erweiterungen sehr geeignet.

### 2. Kein Backend – statische Website

Die Website kommt **ohne Backend** aus:

- Die Daten liegen als **JSON-Datei** im Repository (`data/sari-data.json`)
- Das Frontend lädt die JSON-Datei beim Seitenaufbau
- Filterung und Berechnung erfolgen **clientseitig**
- Kein Admin-Login, keine Datenbank, kein Server-Side-Rendering

Begründung:

- Die Datenmenge (ca. 10.000–15.000 Zeilen) ist clientseitig problemlos verarbeitbar
- Die RKI-Daten ändern sich nur ca. alle 1–3 Monate
- Ein Backend wäre für den MVP Overhead ohne Mehrwert
- Die Website bleibt sicherer und einfacher zu betreiben

### 3. Datenmodell und Aufbereitung

#### Ausgangsformat (wide)

Die TSV-Quelldatei enthält die SARI-Typen als separate Spalten:

| Saison | Kalenderwoche | Altersgruppe | SARI | COVID-19 | Influenza | RSV |
|--------|--------------|--------------|------|----------|-----------|-----|

#### Zielformat (long)

Für die Verarbeitung wird das Format in ein langes (long) Format transformiert:

| Saison | Kalenderwoche | Altersgruppe | sariType | incidence |
|--------|--------------|--------------|----------|-----------|

Jede Zeile im Ausgangsformat ergibt **4 Zeilen** im Zielformat (eine pro SARI-Typ).

#### Angereicherte Felder

- `weekStartDate` – echtes Datum für den Wochenstart (ISO 8601)
- `year` – Kalenderjahr
- `season` – unveränderte Saisonangabe
- `ageGroup` – normalisierte Altersgruppe
- `sariType` – normalisierter SARI-Wert (Gesamt, COVID-19, Influenza, RSV)
- `incidence` – numerischer Wert (Hospitalisierungsinzidenz pro 100.000 Einwohner)

Wichtig:

- Der Zeitraum "letzte 6 Monate" und "letzte 12 Monate" sollte sich am letzten verfügbaren Datenpunkt orientieren, nicht am heutigen Datum.
- Für "bestimmtes Jahr" wird das Kalenderjahr verwendet (nicht die Saison).

### 4. Datenaktualisierung (manuell)

Statt eines Admin-Backends gibt es ein Transformationsskript:

```
Repository:
├── src/                    # Vue-App
├── data/
│   ├── SARI-Hospitalisierungsinzidenz.tsv   # Original (von RKI)
│   └── sari-data.json                        # Transformiert (generiert)
└── scripts/
    └── transform.mjs                          # TSV → JSON Konverter
```

#### Update-Workflow

1. Per SSH auf den Hetzner Server einloggen
2. Aktuelle TSV von GitHub herunterladen
3. Transformationsskript ausführen → erzeugt neue `sari-data.json`
4. JSON-Datei in das Docker-Volumen kopieren
5. Website zeigt sofort die neuen Daten (ohne Neustart)

```bash
# Beispiel-Update auf dem Server
cd /opt/sari
curl -o data/SARI-Hospitalisierungsinzidenz.tsv \
  https://raw.githubusercontent.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz/main/SARI-Hospitalisierungsinzidenz.tsv
node scripts/transform.mjs
docker cp data/sari-data.json sari:/usr/share/nginx/html/data/sari-data.json
```

#### Validierung beim Transformieren

Das Skript prüft vor der Ausgabe:

- TSV ist lesbar und Header vorhanden
- Pflichtspalten existieren
- Hospitalisierungsinzidenz ist numerisch und nicht negativ
- Altersgruppe und SARI-Typ nur aus erlaubten Werten
- Keine leeren Schlüsselfelder

Bei Fehlern wird keine neue JSON-Datei geschrieben – der letzte gültige Stand bleibt erhalten.

---

## Deployment

### 1. Zielarchitektur

```
sari.elmarhepp.de
       │
       ▼
Reverse Proxy (Port 443, Let's Encrypt)
       │
       ▼
Docker Container (Port 8080 → 80)
       │
       ▼
nginx → statische Vue-App + data/sari-data.json
```

### 2. Dockerfile

```dockerfile
# Build-Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime-Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/data/sari-data.json /usr/share/nginx/html/data/sari-data.json
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### 3. nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /data/ {
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### 4. docker-compose.yml

```yaml
services:
  sari:
    build: .
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    volumes:
      - sari-data:/usr/share/nginx/html/data
    networks:
      - proxy

volumes:
  sari-data:

networks:
  proxy:
    external: true
```

### 5. Reverse Proxy (auf dem Hetzner Host)

Der Reverse Proxy (z. B. nginx-proxy, Caddy oder Traefik) leitet `sari.elmarhepp.de` an `127.0.0.1:8080` weiter und stellt ein Let's-Encrypt-Zertifikat aus.

---

## Umsetzung in Phasen

### Phase 1: Konzept und Setup

1. Informationsarchitektur festlegen
2. Designrichtung und Wireframe definieren
3. Vue-, Vite- und Tailwind-Projekt aufsetzen
4. Routing-Grundstruktur anlegen

Ergebnis:
- laufendes Frontend-Grundgerüst

### Phase 2: Datenverarbeitung und Visualisierung

1. TSV parsen und internes Datenmodell definieren
2. Datumslogik für Kalenderwochen implementieren
3. Filterlogik für Zeitraum, Altersgruppe und SARI-Typ bauen
4. Hauptdiagramm und Kennzahlenkarten umsetzen
5. Tabellarische Ansicht ergänzen
6. Transformationsskript (`scripts/transform.mjs`) schreiben

Ergebnis:
- funktionierende öffentliche Visualisierung mit lokal geladenen Daten

### Phase 3: Recht und Inhaltsseiten

1. Impressumsseite anlegen
2. Datenschutzseite anlegen
3. Quellen- und Methodikbereich ergänzen

Ergebnis:
- veröffentlichungsfähige Grundstruktur mit Pflichtseiten

### Phase 4: Deployment

1. Dockerfile und nginx.conf erstellen
2. docker-compose.yml für den Hetzner Server anlegen
3. CI-Build testen (lokal `docker build` und `docker run`)
4. Auf dem Hetzner Server deployen
5. Reverse Proxy für `sari.elmarhepp.de` konfigurieren
6. Let's Encrypt einrichten
7. Transformationsskript auf dem Server testen

Ergebnis:
- live geschaltete Website unter `sari.elmarhepp.de`

### Phase 5: Qualität

1. Tests für Parsing, Filter und Datenvalidierung
2. Responsive Optimierung
3. Accessibility-Prüfung
4. Monitoring und Fehlerlogging (nginx Logs)

Ergebnis:
- belastbarer erster Release

---

## MVP-Empfehlung

Für eine erste sinnvolle Version sollte umgesetzt werden:

1. Öffentliche Startseite mit Diagramm
2. Filter für Zeitraum, Altersgruppe und SARI-Typ
3. Kennzahlenkarten
4. Datentabelle oder CSV-Export für den gefilterten Ausschnitt
5. Impressum und Datenschutzerklärung
6. Transformationsskript für Daten-Updates
7. Docker-Deployment auf dem Hetzner Server

---

## Offene fachliche Entscheidungen

Vor der Umsetzung sollten diese Punkte final entschieden werden:

1. Soll "bestimmtes Jahr" als Kalenderjahr oder als Saison verstanden werden? → **Entschieden: Kalenderjahr**
2. Soll es im MVP nur Einzelauswahl oder direkt Vergleichsansichten geben?
3. Sollen Rohdaten im Frontend zusätzlich downloadbar sein?
4. Soll die transform.mjs schon Teil des Docker-Builds sein (dann wird beim Bauen des Images automatisch die aktuelle TSV geladen)?
5. Welcher Reverse Proxy wird auf dem Hetzner Server verwendet? (nginx-proxy, Caddy, Traefik, anderer)

---

## Konkrete Empfehlung

Empfohlener Start:

- Frontend mit Vue 3, TypeScript, Vite und Tailwind CSS
- Diagramme mit ECharts
- Daten als statische JSON-Datei (clientseitig geladen)
- Transformationsskript für manuelle Updates
- Docker + nginx auf dem Hetzner Server
- Subdomain: `sari.elmarhepp.de`

Diese Kombination hält die Architektur extrem einfach, vermeidet Betriebskomplexität und liefert trotzdem eine voll funktionsfähige Visualisierung mit kontrollierter Datenaktualisierung.
