# Memasang artikel blog harian ke Task Scheduler Windows, dengan pola jadwal yang sama seperti "Edlink Harian":
# harian jam 07:00, jam mulai bergeser acak 0-45 menit, jalan begitu laptop menyala jika terlewat, wajib jaringan,
# dan berjalan tanpa jendela (conhost --headless).
#
# Pemakaian:
#   powershell -ExecutionPolicy Bypass -File scripts\pasang_jadwal.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\pasang_jadwal.ps1 -Jam 07:00 -AcakMenit 45
# Hapus:
#   Unregister-ScheduledTask -TaskName 'Blog Harian' -Confirm:$false
#
# Task menjalankan skrip pembungkus di ~/.claude/blog-daily/run.ps1 yang selalu memperbarui klon khusus
# (bukan working copy yang dipakai sehari-hari) ke origin/main sebelum menjalankan runner. Runner hanya
# membuat draft lokal; tidak ada yang dikirim keluar sebelum --publish dijalankan manual.
param(
  [string]$Jam = '07:00',
  [int]$AcakMenit = 45,
  [string]$Repo = 'https://github.com/hadymaggot/hadymaggot.github.io.git'
)

# Alias python di WindowsApps kurang andal untuk sesi terjadwal; pakai path interpreter yang sebenarnya.
$python = (& (Get-Command python -ErrorAction Stop).Source -c 'import sys; print(sys.executable)').Trim()
$dasar = Join-Path $env:USERPROFILE '.claude\blog-daily'
$klon = Join-Path $dasar 'repo'
$pembungkus = Join-Path $dasar 'run.ps1'
New-Item -ItemType Directory -Force -Path $dasar | Out-Null

# Pembungkus berada di luar repository supaya tidak ikut berubah saat klon diperbarui.
@"
`$ErrorActionPreference = 'Stop'
`$klon = '$klon'
`$log = Join-Path '$dasar' 'run.log'
function Catat(`$pesan) { "`$(Get-Date -Format s) `$pesan" | Add-Content -Path `$log -Encoding utf8 }
try {
  if (-not (Test-Path (Join-Path `$klon '.git'))) {
    git clone --quiet --filter=blob:none --no-checkout '$Repo' `$klon
  }
  git -C `$klon fetch --quiet origin
  git -C `$klon checkout --quiet --force -B main origin/main
  `$runner = Join-Path `$klon 'scripts\daily_post_run.py'
  if (-not (Test-Path `$runner)) { Catat 'Runner belum ada di main; menunggu PR artikel harian di-merge.'; exit 0 }
  & '$python' -I `$runner *>> `$log
  exit `$LASTEXITCODE
} catch {
  Catat "Gagal: `$_"
  exit 1
}
"@ | Set-Content -Path $pembungkus -Encoding utf8

# conhost --headless: tanpa jendela sama sekali, sama seperti task Edlink.
$arg = "--headless powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$pembungkus`""
$aksi = New-ScheduledTaskAction -Execute 'conhost.exe' -Argument $arg -WorkingDirectory $dasar
$trigger = New-ScheduledTaskTrigger -Daily -At $Jam -RandomDelay (New-TimeSpan -Minutes $AcakMenit)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 90)
Register-ScheduledTask -TaskName 'Blog Harian' -Description 'Membuat draft artikel blog dari memory Claude Code. Draft hanya lokal, dikirim manual lewat --publish.' `
  -Action $aksi -Trigger $trigger -Settings $settings -Force | Out-Null
$info = Get-ScheduledTask 'Blog Harian' | Get-ScheduledTaskInfo
Write-Host "Blog Harian terpasang. Jadwal berikutnya: $($info.NextRunTime)"
