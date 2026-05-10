.PHONY: install dev build preview transform clean

# Abhängigkeiten installieren
install:
	npm install

# Entwicklungsserver starten (mit Hot-Reload)
dev:
	npm run dev

# Produktions-Build erstellen
build:
	npm run build

# Produktions-Build lokal ausliefern (nach `make build`)
preview:
	npm run preview

# TSV-Daten in JSON transformieren
transform:
	node scripts/transform.mjs

# Alles in einem Schritt: transform → build
all: transform build

# node_modules und dist löschen
clean:
	rm -rf node_modules dist
