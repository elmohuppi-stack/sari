# Zwei Stufen: bauen und ausliefern.
#
# Vorher stand hier nur `FROM nginx:alpine` mit `COPY dist` — das Frontend wurde
# also auf einem Laptop gebaut und das Ergebnis in das Verzeichnis auf dem Server
# gelegt. Zwei Folgen, die beide erst am 11. August 2026 auffielen:
#
#   1. `docker compose up -d --build` auf dem Server baute das Frontend NICHT.
#      Die ausgelieferten Dateien trugen das Datum 10. Mai. Damit lief auch der
#      Mechanismus für die Betreiberangaben ins Leere: `legal-materialize`
#      schreibt die VITE_LEGAL_*-Werte in `.env`, Vite backt sie beim Build ein —
#      nur fand hier kein Build statt. Eine geänderte Anschrift hätte sari nie
#      erreicht, ohne Fehlermeldung.
#   2. `dist/` steht in `.gitignore` und lag damit in keinem Repository. Der
#      geplante Umzug klont jede App neu; sari hätte danach eine leere Seite
#      ausgeliefert, und zwar mit Statuscode 200.
#
# Befund und Begründung: platform, OFFENE-PROBLEME.md Punkt 39.
#
# Gegenprobe vor der Umstellung: ein kalter Build aus diesem Quelltext ergibt
# Dateien, die **byte-identisch** mit dem Mai-Stand sind (`diff -r` ohne Befund,
# 12 Sekunden). Die Umstellung ändert also nichts an der ausgelieferten Seite.

FROM node:22-alpine AS build
WORKDIR /app

# Erst die Manifeste, dann der Rest: so bleibt die npm-Schicht im Cache, solange
# sich die Abhängigkeiten nicht ändern.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# `.env` muss mit in den Build-Kontext — Vite ersetzt `import.meta.env.VITE_*`
# beim Bauen statisch, und dort stehen die Betreiberangaben. Fehlt die Datei,
# rendert das Impressum einen sichtbaren Platzhalter statt einer leeren Zeile.
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY data /usr/share/nginx/html/data
COPY nginx.conf /etc/nginx/conf.d/default.conf
