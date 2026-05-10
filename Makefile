.PHONY: help install dev build preview transform all clean

# ─── Hilfe ────────────────────────────────────────────────────────────────────

default: help

help:
	@echo "╔══════════════════════════════════════════════════════╗"
	@echo "║   SARI-Dashboard — verfügbare Make-Kommandos        ║"
	@echo "╚══════════════════════════════════════════════════════╝"
	@echo ""
	@echo "  make install    Abhängigkeiten installieren (npm install)"
	@echo "  make dev        Entwicklungsserver starten (Hot-Reload)"
	@echo "  make build      Produktions-Build erstellen"
	@echo "  make preview    Build lokal ausliefern (nach make build)"
	@echo "  make transform  TSV-Daten in JSON konvertieren"
	@echo "  make all        transform + build in einem Schritt"
	@echo "  make clean      node_modules und dist löschen"
	@echo "  make help       Diese Hilfe anzeigen"
	@echo ""

# ─── Workflows ─────────────────────────────────────────────────────────────────

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

transform:
	node scripts/transform.mjs

all: transform build

clean:
	rm -rf node_modules dist
