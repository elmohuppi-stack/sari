# Datenpipeline

Wie die Daten in dieses Dashboard kommen und wie sie aktuell bleiben.

## Woher die Daten kommen

| Punkt | Wert |
| --- | --- |
| Quelle | Robert Koch-Institut, Datensatz „SARI-Hospitalisierungsinzidenz" |
| Repository | https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz |
| Datei | `SARI-Hospitalisierungsinzidenz.tsv` (UTF-8, Tab-getrennt) |
| Lizenz | CC-BY-4.0 – Namensnennung „Robert Koch-Institut" ist Pflicht (steht im Footer und im Dashboard) |
| Abruf-URL | `https://raw.githubusercontent.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz/main/SARI-Hospitalisierungsinzidenz.tsv` |
| Rhythmus beim RKI | wöchentlich, jeweils mit den bis dahin am RKI validierten Daten |

Das RKI liefert eine lange Tabelle: pro Saison, Kalenderwoche, Altersgruppe
(7 Werte) und SARI-Typ (4 Werte) eine Hospitalisierungsinzidenz je 100.000
Einwohner. Das Frontend braucht diese Werte als JSON – dafür gibt es die
Transformationsstufe.

## Der Weg durch das Projekt

```
RKI-GitHub (TSV)
      │  scripts/fetch-data.mjs     herunterladen + prüfen
      ▼
data/SARI-Hospitalisierungsinzidenz.tsv      (versioniert)
      │  scripts/transform.mjs      validieren + umformen
      ▼
data/sari-data.json                          (versioniert)
      │  Dockerfile: COPY data /usr/share/nginx/html/data
      ▼
https://sari.elmarhepp.de/data/sari-data.json
      │  src/stores/dataStore.ts    fetch beim Seitenaufruf
      ▼
Dashboard, Kopfzeile ("Daten bis …"), Footer
```

`scripts/update-data.mjs` führt beide Schritte hintereinander aus.

### Was in der JSON zusätzlich zu den Datenpunkten steht

| Feld | Bedeutung |
| --- | --- |
| `dataStand` | letzter Tag, den die Daten abdecken (Sonntag der letzten KW) |
| `latestWeek` | letzte Kalenderwoche, z.B. `2026-W45` |
| `firstWeek` | erste Kalenderwoche des Datensatzes |
| `latestSeason` | aktuelle Saison, z.B. `2026/27` |
| `lastUpdated` | Zeitpunkt, an dem die JSON erzeugt wurde |
| `data` | die Datenpunkte |

`dataStand` ist bewusst nicht `lastUpdated`: `lastUpdated` ist der Moment
unseres Laufs, `dataStand` das Datum, bis zu dem das RKI Daten geliefert hat.
Das Frontend zeigt beides getrennt an (Kopfzeile und Footer).

## Wöchentliche Automatisierung

`.github/workflows/update-data.yml` läuft **jeden Mittwoch und jeden Freitag
um 06:00 UTC** (08:00 bzw. 07:00 deutsche Zeit, je nach Sommerzeit) und
zusätzlich per `workflow_dispatch` von Hand.

Ablauf:

1. Repository auschecken, Node 22
2. `node scripts/update-data.mjs` – Daten holen, prüfen, JSON schreiben
3. `git diff -- data/` – ohne Änderung kein Commit
4. Bei Änderung: Commit + Push (`Daten: RKI-Stand <Datum> (<KW>)`)
5. Server-Stand prüfen: steht `/var/www/sari` auf einem anderen Commit als
   `origin/main`?
6. Wenn ja: `./deploy.sh deploy` per SSH auf dem Server (`/var/www/sari`)
7. Zusammenfassung im Action-Log (Datenstand, KW, Anzahl Datenpunkte,
   Server-Commit vor dem Lauf, ob deployt wurde)

**Warum Mittwoch:** Das RKI stellt die Vorwoche üblicherweise am Dienstag
bereit. Mittwochmorgen ist sie meistens da, und ein Fehlschlag fällt noch in
derselben Woche auf.

**Warum zusätzlich Freitag:** Der Mittwochstermin ist zu knapp, wenn das RKI
später veröffentlicht. Am 18.11.2026 lief der Lauf um 06:00 UTC, die KW 46 war
noch nicht online – der Lauf endete grün mit „Keine Änderung", ohne Commit und
ohne Deploy, und die Seite blieb eine Woche auf dem alten Stand. Der
Freitagslauf holt einen verspäteten RKI-Push nach. Er kostet nichts: ohne neue
Daten ist die JSON byte-identisch (`lastUpdated` bleibt stehen), es gibt keinen
Commit – und ohne Abweichung zwischen Server und `origin/main` auch keinen
Deploy.

**Warum ein Zeitplan und kein Trigger auf das RKI-Repo:** Ob und wann dort
Pushes erfolgen, ist nicht zugesichert. Der Zeitplan ist die verlässlichere
Zusage.

**Deploy hängt am Server-Stand, nicht am Daten-Diff:** Der frühere Auslöser
`changed == 'true'` hatte zwei Lücken – eine reine Code-Änderung ohne neue
Daten wurde nie automatisch ausgeliefert, und ein fehlgeschlagener Deploy
konnte bis zur nächsten Datenänderung liegen bleiben. Jetzt vergleicht der
Schritt „Server-Stand prüfen" den Commit auf dem Server mit dem Lauf-Commit;
deployt wird, wenn beide abweichen. Ist der Server nicht abfragbar (SSH
gestört), wird deployt statt geschwiegen – besser ein überflüssiger
`docker compose up -d --build` als eine Woche alte Daten.

**Daten-Commit ohne Deploy:** Ohne die Secrets `SSH_HOST`, `SSH_USER`,
`SSH_KEY` wird nur committet. Der Server zieht die Daten dann erst beim
nächsten Deploy (siehe unten). Secrets eintragen unter: Settings → Secrets and
variables → Actions. Ohne Deploy-Schritt bleibt der Server auf dem alten Stand
– deshalb ist der Deploy-Schritt für „läuft von allein" notwendig.

**Deploy-Methode:** über `deploy.sh` im App-Verzeichnis, wie bei den anderen
Apps auf dem Server (mediathek, knora, wetter). Details im Abschnitt
[Deploy](#deploy) unten.

Zwei Fallen sind im Workflow bewusst umgangen, weil sie einen Lauf still
scheitern lassen:

- `secrets.*` ist in `if:`-Ausdrücken nicht erlaubt („Unrecognized named-value:
  secrets") – der Workflow würde schon beim Parsen abbrechen und nie starten.
  Die Prüfung läuft deshalb in einem eigenen Schritt über ein `env:` und setzt
  ein Output (`deploy_check.outputs.enabled`).
- `node … | tee` ohne `pipefail` liefert den Exit-Code von `tee` statt von
  `node`. Ein fehlgeschlagener Abruf ginge als Erfolg durch, der Lauf endete
  grün mit alten Daten. Alle `run`-Blöcke setzen deshalb `set -euo pipefail`.

## Deploy

sari wird wie die anderen Apps auf dem Server über ein `deploy.sh` im
App-Verzeichnis deployt. Das Skript liegt im Repository und funktioniert lokal
wie auf dem Server:

```bash
./deploy.sh              # deployt origin/main: pull, rebuild, Verifikation
./deploy.sh status       # Container-Status
./deploy.sh logs         # Container-Logs (folgt, Strg+C beendet)
./deploy.sh rebuild      # Rebuild ohne Cache
./deploy.sh rollback     # ein Commit zurück
```

`DEPLOY_HOST` ist per Default `elmarhepp` (aus `~/.ssh/config`), `DEPLOY_BRANCH`
default `main`. Beides lässt sich überschreiben:

```bash
DEPLOY_HOST=elmarhepp DEPLOY_BRANCH=main ./deploy.sh
```

### Deploy-Key für die GitHub Action

Der automatische Deploy braucht einen eigenen SSH-Key, nicht den persönlichen
des Rechners. Eingerichtet am 15.11.2026:

```bash
# 1. Key erzeugen (ohne Passphrase – die Action kann keine eingeben)
ssh-keygen -t ed25519 -C "github-actions@sari" -f ~/.ssh/sari-deploy -N ""

# 2. Public Key auf den Server  (>> nicht > – bestehende Keys bleiben erhalten)
cat ~/.ssh/sari-deploy.pub | ssh elmarhepp 'cat >> ~/.ssh/authorized_keys'

# 3. Privaten Key in die GitHub-Secrets legen
pbcopy < ~/.ssh/sari-deploy      # dann im Browser bei SSH_KEY einfügen
```

Fingerprint zum Abgleich: `SHA256:rt+SLA5ETtUdxXeL8ZdL1mm+oSkp/9/Pjr1HjmW3NEk`

Die drei Repository-Secrets liegen unter
`https://github.com/elmohuppi-stack/sari/settings/secrets/actions`:

| Secret | Wert |
| --- | --- |
| `SSH_HOST` | `159.195.214.166` |
| `SSH_USER` | `root` |
| `SSH_KEY` | Inhalt von `~/.ssh/sari-deploy` (privat, komplett) |

Gegenprobe, ob Key und Server zusammenpassen – genau der Befehl, den die
Action ausführt:

```bash
ssh -i ~/.ssh/sari-deploy -o IdentitiesOnly=yes elmarhepp \
  'cd /var/www/sari && git pull --ff-only && ./deploy.sh deploy'
```

Der Server erlaubt `permitrootlogin without-password` bei
`passwordauthentication no` – ein Key ist also zwingend, ein Passwort hilft
nicht weiter. Bei einer Fehlermeldung `Permission denied (publickey)` fehlt
der Public Key in `/root/.ssh/authorized_keys`.

Der Deploy prüft am Ende selbst, ob die Seite antwortet (HTTP-Code) und welcher
Datenstand ausgeliefert wird. Ein Lauf, der „durchläuft", aber alte Daten zeigt,
fällt damit sofort auf – genau der Fall, der im Mai 2026 unbemerkt passiert ist.

Ein zentrales `deploy-app.sh`, wie es `docs/deployment-standard.md` beschreibt,
gibt es auf dem Server nicht (geprüft am 15.11.2026: `/usr/local/bin` ist leer).
Maßgeblich ist das `deploy.sh` im jeweiligen App-Verzeichnis.

## Lokal arbeiten

```bash
make update-data    # RKI-Daten holen + JSON neu erzeugen
make fetch-data     # nur die TSV holen
make transform      # nur die vorhandene TSV neu umwandeln
make data-report    # Datenstand im JSON anzeigen
make all            # update-data + build
```

Nach einem Datenlauf lokal prüfen: `npm run dev`, dann Kopfzeile
(„Daten bis …") und den Zeitraum-Filter ansehen – die neue Saison erscheint
dort automatisch, weil die Optionen aus den Daten abgeleitet werden
(`dataStore.seasons`).

## Schutz vor kaputten Daten

`fetch-data.mjs` schreibt die TSV erst, wenn der Abruf plausibel ist. Geprüft
wird:

- HTTP-Status 200 (sonst Exit 1, Datei bleibt)
- Header exakt wie erwartet (Spaltennamen und Reihenfolge)
- mindestens 5000 Datenzeilen
- jede Zeile hat 5 Spalten
- Altersgruppe `00+` und SARI-Typ `Gesamt` vorhanden
- letzte Kalenderwoche ist lesbar und liegt nicht in der Zukunft

`transform.mjs` validiert danach nochmals die Werte (bekannte Altersgruppen,
bekannte SARI-Typen, numerische Inzidenz ≥ 0) und schreibt die JSON nur bei
Erfolg. Ein fehlgeschlagener Lauf hinterlässt also immer den letzten gültigen
Stand – die Seite zeigt alte, aber korrekte Daten statt eines Fehlers.

## Bekannte Stolpersteine

- **Zeitzonen:** Kalenderwochen werden in UTC umgerechnet. Mit lokalen
  Date-Objekten käme je nach Rechner-Zeitzone ein anderer Tag heraus
  (GitHub Actions läuft in UTC, der Laptop in Europe/Berlin).
- **Neue Saison:** Ab KW 40 beginnt beim RKI eine neue Saison (z.B. `2026/27`).
  Der Zeitraum-Filter im Dashboard wird aus den Daten gebaut, hier ist keine
  Codeänderung nötig.
- **Browser-Cache:** `dataStore` lädt die JSON mit `cache: 'no-cache'`, damit
  nach einem Deploy nicht die alte Datei aus dem Cache kommt.
- **Nachmeldungen:** Das RKI ergänzt Werte auch für bereits veröffentlichte
  Wochen. Da bei jedem Lauf die komplette TSV ersetzt wird, sind solche
  Korrekturen automatisch enthalten.
- **Datei wird ersetzt, nicht ergänzt:** Maßgeblich ist immer die RKI-Datei.
  Eigene Korrekturen an `data/sari-data.json` gehen beim nächsten Lauf verloren.
