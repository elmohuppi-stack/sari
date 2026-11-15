.PHONY: help install dev build preview fetch-data transform update-data data-report deploy status logs all clean

# ─── Hilfe ────────────────────────────────────────────────────────────────────

default: help

help:
	@echo "╔══════════════════════════════════════════════════════╗"
	@echo "║   SARI-Dashboard — verfügbare Make-Kommandos        ║"
	@echo "╚══════════════════════════════════════════════════════╝"
	@echo ""
	@echo "  make install      Abhängigkeiten installieren (npm install)"
	@echo "  make dev          Entwicklungsserver starten (Hot-Reload)"
	@echo "  make build        Produktions-Build erstellen"
	@echo "  make preview      Build lokal ausliefern (nach make build)"
	@echo "  make update-data  RKI-Daten holen und nach JSON wandeln"
	@echo "  make fetch-data   nur die TSV vom RKI holen"
	@echo "  make transform    nur die vorhandene TSV nach JSON wandeln"
	@echo "  make data-report  Datenstand im JSON anzeigen"
	@echo "  make deploy       auf den Server deployen (./deploy.sh)"
	@echo "  make status       Container-Status auf dem Server"
	@echo "  make logs         Container-Logs auf dem Server"
	@echo "  make all          update-data + build in einem Schritt"
	@echo "  make clean        node_modules und dist löschen"
	@echo "  make help         Diese Hilfe anzeigen"
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

update-data:
	npm run update-data

fetch-data:
	npm run fetch-data

transform:
	npm run transform

data-report:
	npm run data-report

deploy:
	./deploy.sh deploy

status:
	./deploy.sh status

logs:
	./deploy.sh logs

all: update-data build

clean:
	rm -rf node_modules dist
