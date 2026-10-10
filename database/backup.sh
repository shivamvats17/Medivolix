#!/usr/bin/env bash
# ==============================================================================
# Medivolix Database Automated Backup Script (Bash for Linux / macOS)
# Usage:
#   ./database/backup.sh
#   DB_NAME=medivolix_db DB_USER=root ./database/backup.sh
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backups}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-shiv@17sql}"
DB_NAME="${DB_NAME:-medivolix_db}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;36m Medivolix Automated Database Backup Utility (Bash)\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"
GZ_FILE="${DUMP_FILE}.gz"

echo -e "\033[0;37m[INFO] Target: ${DB_NAME} on ${DB_HOST}:${DB_PORT}\033[0m"
echo -e "\033[0;37m[INFO] Output: ${GZ_FILE}\033[0m"

echo -e "\033[1;33m[INFO] Executing mysqldump...\033[0m"
mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --set-gtid-purged=OFF \
  --default-character-set=utf8mb4 \
  "$DB_NAME" > "$DUMP_FILE"

echo -e "\033[1;32m[SUCCESS] Raw SQL dump generated. Compressing with gzip...\033[0m"
gzip -f "$DUMP_FILE"

FILE_SIZE=$(du -h "$GZ_FILE" | cut -f1)
echo -e "\033[1;32m[SUCCESS] Backup archive ready: ${GZ_FILE} (${FILE_SIZE})\033[0m"

# Clean up backups older than retention days
echo -e "\033[0;37m[INFO] Purging backups older than ${RETENTION_DAYS} days...\033[0m"
find "$BACKUP_DIR" -type f -name "${DB_NAME}_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} +

echo -e "\033[1;36m[COMPLETE] Database backup finished successfully.\033[0m"
