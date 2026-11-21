# SARI-Dashboard

Visualisierung der SARI-Hospitalisierungsinzidenz des Robert Koch-Instituts
(RKI) für Deutschland, pro 100.000 Einwohner, filterbar nach Zeitraum,
Altersgruppe und SARI-Typ (Gesamt, COVID-19, Influenza, RSV).

Live: https://sari.elmarhepp.de

## Daten

Quelle ist der RKI-Datensatz „SARI-Hospitalisierungsinzidenz"
(CC-BY-4.0): https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz

Die Daten werden **wöchentlich automatisch** aktualisiert: eine GitHub Action
holt jeden Mittwoch- und Freitagmorgen die aktuelle TSV, wandelt sie in
`data/sari-data.json`, committet Änderungen und deployt auf den Server, sobald
dieser hinter `origin/main` liegt.

Details zum Ablauf, zu den Schutzmechanismen und zur Einrichtung:
[docs/datenpipeline.md](docs/datenpipeline.md)

## Kommandos

```bash
make install        # Abhängigkeiten installieren
make dev            # Entwicklungsserver
make build          # Produktions-Build
make update-data    # RKI-Daten holen und JSON neu erzeugen
make data-report    # Datenstand anzeigen
make all            # update-data + build
make help           # alle Kommandos

./deploy.sh         # deployen (pull, rebuild, Verifikation)
./deploy.sh status  # Container-Status, logs, rebuild, rollback
```

## Aufbau

- `src/` – Vue 3 + TypeScript + Pinia, Charts mit ECharts
- `data/` – RKI-TSV und daraus erzeugte JSON (beides versioniert)
- `scripts/` – Datenabruf und Transformation
- `deploy.sh` – Deployment auf den Server (wie bei den anderen Apps)
- `.github/workflows/update-data.yml` – wöchentlicher Datenlauf
- `docs/` – Deployment-Standard, Datenpipeline, RKI-Dokumentation, Lizenz

