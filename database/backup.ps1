# ==============================================================================
# Medivolix Database Automated Backup Script (PowerShell for Windows)
# Usage:
#   .\backup.ps1
#   .\backup.ps1 -DbUser root -DbName medivolix_db -RetentionDays 14
# ==============================================================================

[CmdletBinding()]
param(
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3306,
    [string]$DbUser = "root",
    [string]$DbPassword = $env:DB_PASSWORD,
    [string]$DbName = "medivolix_db",
    [string]$BackupDir = "",
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($BackupDir)) {
    if ($PSScriptRoot) {
        $BackupDir = Join-Path $PSScriptRoot "backups"
    } else {
        $BackupDir = Join-Path (Get-Location) "database\backups"
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Medivolix Automated Database Backup Utility" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Ensure backup destination directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "[INFO] Created backup directory: $BackupDir" -ForegroundColor Gray
}

# Timestamp for the filename
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFileName = "${DbName}_backup_${timestamp}.sql"
$dumpFilePath = Join-Path $BackupDir $dumpFileName
$zipFilePath = Join-Path $BackupDir "${DbName}_backup_${timestamp}.zip"

# Locate mysqldump executable
$mysqlDumpCmd = Get-Command "mysqldump.exe" -ErrorAction SilentlyContinue
if (-not $mysqlDumpCmd) {
    # Check standard Windows MySQL installations
    $possiblePaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
        "C:\Program Files\MySQL\MySQL Server 26.7\bin\mysqldump.exe",
        "C:\xampp\mysql\bin\mysqldump.exe"
    )
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $mysqlDumpCmd = $path
            break
        }
    }
}

if (-not $mysqlDumpCmd) {
    Write-Error "[ERROR] mysqldump.exe was not found in PATH or standard installation paths. Ensure MySQL tools are installed."
    exit 1
}

Write-Host "[INFO] Database Target : $DbName on ${DbHost}:${DbPort}" -ForegroundColor Gray
Write-Host "[INFO] Backup Output   : $dumpFilePath" -ForegroundColor Gray

# Prompt for password if not passed via parameter or environment variable
if ([string]::IsNullOrEmpty($DbPassword)) {
    $DbPassword = "shiv@17sql"
}

# Execute mysqldump with production safeguards:
# --single-transaction: consistent snapshot without table locking
# --routines: exports stored procedures & functions
# --triggers: exports database triggers
# --events: exports scheduled events
$dumpArgs = @(
    "--host=$DbHost",
    "--port=$DbPort",
    "--user=$DbUser",
    "--password=$DbPassword",
    "--single-transaction",
    "--quick",
    "--routines",
    "--triggers",
    "--events",
    "--set-gtid-purged=OFF",
    "--default-character-set=utf8mb4",
    $DbName
)

Write-Host "[INFO] Executing mysqldump..." -ForegroundColor Yellow

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = if ($mysqlDumpCmd -is [string]) { $mysqlDumpCmd } else { $mysqlDumpCmd.Source }
$processInfo.Arguments = ($dumpArgs -join " ")
$processInfo.RedirectStandardOutput = $true
$processInfo.RedirectStandardError = $true
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$process = [System.Diagnostics.Process]::Start($processInfo)
$stdout = $process.StandardOutput.ReadToEnd()
$stderr = $process.StandardError.ReadToEnd()
$process.WaitForExit()

if ($process.ExitCode -ne 0) {
    Write-Error "[ERROR] mysqldump failed with exit code $($process.ExitCode): $stderr"
    exit $process.ExitCode
}

# Write SQL dump to file
[System.IO.File]::WriteAllText($dumpFilePath, $stdout, [System.Text.Encoding]::UTF8)

$fileSizeKb = [math]::Round((Get-Item $dumpFilePath).Length / 1KB, 2)
Write-Host "[SUCCESS] SQL dump completed successfully ($fileSizeKb KB)." -ForegroundColor Green

# Compress to ZIP
Write-Host "[INFO] Compressing dump to ZIP archive..." -ForegroundColor Gray
Compress-Archive -Path $dumpFilePath -DestinationPath $zipFilePath -Force
Remove-Item -Path $dumpFilePath -Force

$zipSizeKb = [math]::Round((Get-Item $zipFilePath).Length / 1KB, 2)
Write-Host "[SUCCESS] Created compressed backup archive: $zipFilePath ($zipSizeKb KB)" -ForegroundColor Green

# Retention policy: remove backups older than $RetentionDays
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldFiles = Get-ChildItem -Path $BackupDir -Filter "${DbName}_backup_*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

if ($oldFiles) {
    Write-Host "[INFO] Cleaning up backups older than $RetentionDays days..." -ForegroundColor Gray
    foreach ($file in $oldFiles) {
        Remove-Item -Path $file.FullName -Force
        Write-Host "  - Removed obsolete backup: $($file.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "[COMPLETE] Backup operation finished successfully." -ForegroundColor Cyan
