# ==============================================================================
# Medivolix Database Restore Utility (PowerShell for Windows)
# Usage:
#   .\restore.ps1 -BackupFile .\backups\medivolix_db_backup_YYYYMMDD_HHMMSS.zip
#   .\restore.ps1 -Latest -Force
# ==============================================================================

[CmdletBinding()]
param(
    [string]$BackupFile = "",
    [switch]$Latest,
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3306,
    [string]$DbUser = "root",
    [string]$DbPassword = $env:DB_PASSWORD,
    [string]$DbName = "medivolix_db",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Medivolix Database Restore Utility" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backupsDir = if ($PSScriptRoot) { Join-Path $PSScriptRoot "backups" } else { Join-Path (Get-Location) "database\backups" }

# If -Latest is passed or BackupFile is empty, auto-detect the newest backup
if ($Latest -or [string]::IsNullOrWhiteSpace($BackupFile)) {
    if (Test-Path $backupsDir) {
        $newest = Get-ChildItem -Path $backupsDir -Filter "${DbName}_backup_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($newest) {
            $BackupFile = $newest.FullName
            Write-Host "[INFO] Automatically selected latest backup: $($newest.Name)" -ForegroundColor Gray
        }
    }
}

if ([string]::IsNullOrWhiteSpace($BackupFile) -or -not (Test-Path $BackupFile)) {
    Write-Error "[ERROR] Specified backup file does not exist or no backup was found: '$BackupFile'"
    exit 1
}

# Locate mysql executable
$mysqlCmd = Get-Command "mysql.exe" -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    $possiblePaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 26.7\bin\mysql.exe",
        "C:\xampp\mysql\bin\mysql.exe"
    )
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $mysqlCmd = $path
            break
        }
    }
}

if (-not $mysqlCmd) {
    Write-Error "[ERROR] mysql.exe was not found in PATH or standard installation paths."
    exit 1
}

# Password fallback
if ([string]::IsNullOrEmpty($DbPassword)) {
    $DbPassword = "shiv@17sql"
}

# Confirmation prompt unless -Force
if (-not $Force) {
    Write-Host "[WARNING] Restoring this backup will OVERWRITE existing data in database '$DbName'!" -ForegroundColor Yellow
    $confirmation = Read-Host "Are you sure you want to proceed? (Type 'YES' to confirm)"
    if ($confirmation -ne "YES") {
        Write-Host "[CANCELLED] Restore aborted by user." -ForegroundColor Gray
        exit 0
    }
}

# Extract if ZIP
$tempSqlFile = $null
$sqlToImport = $BackupFile

if ($BackupFile.EndsWith(".zip", [System.StringComparison]::OrdinalIgnoreCase)) {
    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("medivolix_restore_" + [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    Write-Host "[INFO] Extracting backup archive to temporary folder..." -ForegroundColor Gray
    Expand-Archive -Path $BackupFile -DestinationPath $tempDir -Force
    $extractedSql = Get-ChildItem -Path $tempDir -Filter "*.sql" | Select-Object -First 1
    if (-not $extractedSql) {
        Remove-Item -Path $tempDir -Recurse -Force
        Write-Error "[ERROR] No SQL file found inside archive '$BackupFile'"
        exit 1
    }
    $sqlToImport = $extractedSql.FullName
    $tempSqlFile = $tempDir
}

Write-Host "[INFO] Target Database : $DbName on ${DbHost}:${DbPort}" -ForegroundColor Gray
Write-Host "[INFO] Restoring SQL   : $sqlToImport" -ForegroundColor Yellow

$mysqlExecutable = if ($mysqlCmd -is [string]) { $mysqlCmd } else { $mysqlCmd.Source }
$mysqlArgs = "--host=$DbHost --port=$DbPort --user=$DbUser --password=$DbPassword $DbName"

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = $mysqlExecutable
$processInfo.Arguments = $mysqlArgs
$processInfo.RedirectStandardInput = $true
$processInfo.RedirectStandardError = $true
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$process = [System.Diagnostics.Process]::Start($processInfo)
$sqlContent = [System.IO.File]::ReadAllText($sqlToImport, [System.Text.Encoding]::UTF8)
$process.StandardInput.Write($sqlContent)
$process.StandardInput.Close()

$stderr = $process.StandardError.ReadToEnd()
$process.WaitForExit()

# Clean up temp files if extracted
if ($tempSqlFile -and (Test-Path $tempSqlFile)) {
    Remove-Item -Path $tempSqlFile -Recurse -Force
}

if ($process.ExitCode -ne 0) {
    Write-Error "[ERROR] Restore failed with exit code $($process.ExitCode): $stderr"
    exit $process.ExitCode
}

Write-Host "[SUCCESS] Database '$DbName' successfully restored from backup!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
