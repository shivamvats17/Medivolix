#!/usr/bin/env bash
# ==============================================================================
# Medivolix Database Restore Utility (Bash for Linux / macOS)
# Usage:
#   ./database/restore.sh ./database/backups/medivolix_db_backup_YYYYMMDD_HHMMSS.sql.gz
#   ./database/restore.sh --latest --force
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backups}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-shiv@17sql}"
DB_NAME="${DB_NAME:-medivolix_db}"
FORCE=0
BACKUP_FILE=""

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --force|-f)
      FORCE=1
      shift
      ;;
    --latest|-l)
      BACKUP_FILE=$(find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" | sort -r | head -n 1)
      shift
      ;;
    *)
      BACKUP_FILE="$1"
      shift
      ;;
  esac
done

if [[ -z "$BACKUP_FILE" ]]; then
  # Auto-select latest
  BACKUP_FILE=$(find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" | sort -r | head -n 1)
fi

if [[ -z "$BACKUP_FILE" || ! -f "$BACKUP_FILE" ]]; then
  echo -e "\033[1;31m[ERROR] No valid backup file specified or found in ${BACKUP_DIR}\033[0m" >&2
  exit 1
fi

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;36m Medivolix Database Restore Utility (Bash)\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[0;37m[INFO] Backup File : ${BACKUP_FILE}\033[0m"
echo -e "\033[0;37m[INFO] Target DB   : ${DB_NAME} on ${DB_HOST}:${DB_PORT}\033[0m"

if [[ $FORCE -eq 0 ]]; then
  echo -e "\033[1;33m[WARNING] Restoring this backup will OVERWRITE data in ${DB_NAME}!\033[0m"
  read -r -p "Type 'YES' to confirm: " CONFIRMATION
  if [[ "$CONFIRMATION" != "YES" ]]; then
    echo -e "\033[0;37m[CANCELLED] Restore aborted by user.\033[0m"
    exit 0
  fi
fi

echo -e "\033[1;33m[INFO] Decompressing and importing SQL into MySQL...\033[0m"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gzip -dc "$BACKUP_FILE" | mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    "$DB_NAME"
else
  mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    "$DB_NAME" < "$BACKUP_FILE"
fi

echo -e "\033[1;32m[SUCCESS] Database ${DB_NAME} restored successfully!\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"
