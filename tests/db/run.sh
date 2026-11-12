#!/usr/bin/env bash
# Spins up a throwaway Postgres, loads the Supabase shim + supabase/schema.sql,
# and runs every tests/db/*.test.sql file. Fails on the first broken assertion.
# Needs Postgres 15+ server binaries (initdb, pg_ctl) on PATH or in /usr/lib/postgresql/*/bin.
set -euo pipefail
cd "$(dirname "$0")/../.."

if ! command -v initdb >/dev/null 2>&1; then
  PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)
  [ -n "${PGBIN:-}" ] && export PATH="$PGBIN:$PATH"
fi
command -v initdb >/dev/null || { echo "initdb not found: install PostgreSQL server binaries"; exit 1; }

DATA=$(mktemp -d)
SOCK=$(mktemp -d)
# Postgres refuses to run as root; in root containers, run the server as "postgres".
AS=()
if [ "$(id -u)" = 0 ]; then
  id postgres >/dev/null 2>&1 || { echo "running as root needs a 'postgres' user"; exit 1; }
  chown postgres "$DATA" "$SOCK"
  AS=(runuser -u postgres --)
fi
cleanup() { "${AS[@]}" pg_ctl -D "$DATA" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DATA" "$SOCK"; }
trap cleanup EXIT

"${AS[@]}" env PATH="$PATH" initdb -D "$DATA" -U postgres --auth=trust >/dev/null
"${AS[@]}" env PATH="$PATH" pg_ctl -D "$DATA" -o "-k $SOCK -c listen_addresses=''" -l "$DATA/log" -w start >/dev/null

export PGOPTIONS="-c client_min_messages=warning"
PSQL=(psql -h "$SOCK" -U postgres -d postgres -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" -f tests/db/supabase-shim.sql
"${PSQL[@]}" -f supabase/schema.sql

status=0
for t in tests/db/*.test.sql; do
  if "${PSQL[@]}" -f "$t"; then echo "PASS $t"; else echo "FAIL $t"; status=1; fi
done
exit $status
