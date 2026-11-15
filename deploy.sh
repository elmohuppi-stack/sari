#!/bin/bash
# ============================================================
# Deploy SARI-Dashboard auf den Multi-App-Server nuernberg-16gb (netcup)
# ============================================================
# Usage: ./deploy.sh [action]
#
# Actions:
#   deploy    (default) Pull & restart
#   logs      Show container logs
#   status    Show container status
#   rebuild   Force rebuild without cache
#   rollback  Revert to previous commit
#
# Vorher gab es hier kein Deploy-Skript; sari wurde von Hand mit
# `git pull && docker compose up -d --build` aktualisiert. Jetzt wie bei
# mediathek, knora und wetter: ein deploy.sh im App-Verzeichnis.
#
# Aufruf lokal (vom eigenen Rechner) oder auf dem Server:
#   ./deploy.sh              deployt den Stand von origin/main
#   ./deploy.sh logs
#   ./deploy.sh status
#   ./deploy.sh rollback
#
# DEPLOY_HOST ist per Default "elmarhepp" (siehe ~/.ssh/config). Laeuft das
# Skript direkt auf dem Server, wird kein SSH benutzt.
# ============================================================

set -euo pipefail

# ─── Farben ───
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
info() { echo -e "${YELLOW}▸ $*${NC}"; }
ok()   { echo -e "${GREEN}✔ $*${NC}"; }
fail() { echo -e "${RED}✖ $*${NC}" >&2; exit 1; }

# ─── Konfiguration ───
APP_SLUG="sari"
DEPLOY_PATH="/var/www/${APP_SLUG}"
SERVER="${DEPLOY_HOST:-elmarhepp}"
BRANCH="${DEPLOY_BRANCH:-main}"
FRONTEND_DOMAIN="sari.elmarhepp.de"
WEB_PORT=3061
COMPOSE_FILE="docker-compose.yml"

# ─── Hilfe ───
usage() {
    echo "Usage: ./deploy.sh [action]"
    echo ""
    echo "Actions:"
    echo "  deploy    (default) Pull & restart"
    echo "  logs      Show container logs"
    echo "  status    Show container status"
    echo "  rebuild   Force rebuild without cache"
    echo "  rollback  Revert to previous commit"
    exit 1
}

# ─── Ausführung lokal oder auf dem Server ───
# Laeuft das Skript im App-Verzeichnis auf dem Server, werden die Befehle
# direkt ausgefuehrt. Sonst per SSH auf den Server (Standardfall: vom eigenen
# Rechner aus).
SELF_DIR="$(cd "$(dirname "$0")" && pwd -P)"
if [ "$SELF_DIR" = "$DEPLOY_PATH" ]; then
    ON_SERVER=1
else
    ON_SERVER=0
fi

remote() {
    if [ "$ON_SERVER" = "1" ]; then
        ( cd "$DEPLOY_PATH" && eval "$*" )
    else
        ssh "$SERVER" "cd '$DEPLOY_PATH' && $*"
    fi
}

ACTION="${1:-deploy}"

case "$ACTION" in
    deploy)
        echo "=== Deploy $APP_SLUG ==="

        info "1. Repository aktualisieren"
        remote "git fetch origin && git checkout '$BRANCH' && git pull --ff-only origin '$BRANCH'"

        info "2. .env pruefen"
        # Die .env traegt WEB_PORT und die VITE_LEGAL_*-Werte; sie wird von
        # Vite beim Bauen eingebacken und darf nicht im Repository liegen.
        remote "test -f .env || { echo '   ✖ .env fehlt in $DEPLOY_PATH – aus .env.example anlegen'; exit 1; }"
        ok "   .env vorhanden"

        # Das geteilte Netz muss existieren, sonst startet Compose nicht
        # (networks.apps-net ist external: true).
        info "3. Docker-Netz apps-net sicherstellen"
        remote "docker network inspect apps-net >/dev/null 2>&1 || docker network create apps-net"
        ok "   apps-net vorhanden"

        info "4. Container bauen und starten"
        remote "docker compose -f '$COMPOSE_FILE' up -d --build"

        info "5. Verifikation"
        sleep 2
        remote "docker compose -f '$COMPOSE_FILE' ps"
        echo ""
        echo "--- HTTP und Datenstand ---"
        curl -s -o /dev/null -w "  https://${FRONTEND_DOMAIN}/  ->  %{http_code}\n" \
            "https://${FRONTEND_DOMAIN}/" || echo "  (HTTP-Abruf fehlgeschlagen)"
        curl -s "https://${FRONTEND_DOMAIN}/data/sari-data.json" 2>/dev/null \
            | grep -E '"dataStand"|"latestWeek"' | sed 's/^/  /' \
            || echo "  (Datenstand nicht abrufbar)"
        echo ""
        ok "Deployment abgeschlossen - https://${FRONTEND_DOMAIN}"
        ;;

    logs)
        info "Logs fuer $APP_SLUG (folgt, Strg+C beendet)"
        if [ "$ON_SERVER" = "1" ]; then
            (cd "$DEPLOY_PATH" && docker compose -f "$COMPOSE_FILE" logs -f --tail=50)
        else
            ssh -t "$SERVER" "cd '$DEPLOY_PATH' && docker compose -f '$COMPOSE_FILE' logs -f --tail=50"
        fi
        ;;

    status)
        info "Status von $APP_SLUG"
        remote "docker compose -f '$COMPOSE_FILE' ps"
        ;;

    rebuild)
        info "Rebuild von $APP_SLUG ohne Cache"
        remote "docker compose -f '$COMPOSE_FILE' build --no-cache && docker compose -f '$COMPOSE_FILE' up -d"
        ok "$APP_SLUG neu gebaut"
        ;;

    rollback)
        info "Rollback von $APP_SLUG (ein Commit zurueck)"
        remote "git checkout HEAD~1 && docker compose -f '$COMPOSE_FILE' up -d --build"
        echo ""
        info "Hinweis: danach mit 'git checkout $BRANCH' zurueck auf den Branch"
        ok "$APP_SLUG zurueckgerollt"
        ;;

    *)
        usage
        ;;
esac
