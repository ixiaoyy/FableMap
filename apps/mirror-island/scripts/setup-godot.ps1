param([switch]$SkipTemplates)
$ErrorActionPreference = 'Stop'
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$runtime = Join-Path $repo 'artifacts/godot-runtime'
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot '../godot/engine-lock.json') -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $runtime | Out-Null

# 下载固定版本到本项目缓存，校验不符即终止；不修改 PATH 或用户全局 Godot 安装。
function Get-VerifiedArtifact([string]$Url, [string]$Name, [string]$Algorithm, [string]$Hash) {
    $target = Join-Path $runtime $Name
    if (!(Test-Path -LiteralPath $target) -or (Get-FileHash -LiteralPath $target -Algorithm $Algorithm).Hash.ToLowerInvariant() -ne $Hash) {
        & curl.exe --fail --silent --show-error --location --connect-timeout 15 --max-time 480 --output $target $Url
        if ($LASTEXITCODE -ne 0) { throw "下载失败：$Name" }
    }
    if ((Get-FileHash -LiteralPath $target -Algorithm $Algorithm).Hash.ToLowerInvariant() -ne $Hash) { throw "校验失败：$Name" }
    return $target
}

# 解压前逐项校验绝对目标必须位于指定目录；没有递归删除或跨目录移动。
function Expand-CheckedArchive([string]$Archive, [string]$Destination, [string[]]$AllowedNames = @()) {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $destinationPath = [IO.Path]::GetFullPath($Destination)
    $prefix = $destinationPath.TrimEnd('\') + '\'
    [IO.Directory]::CreateDirectory($destinationPath) | Out-Null
    $zip = [IO.Compression.ZipFile]::OpenRead($Archive)
    try {
        foreach ($entry in $zip.Entries) {
            if (!$entry.Name -or ($AllowedNames.Count -gt 0 -and $entry.Name -notin $AllowedNames)) { continue }
            $relative = if ($AllowedNames.Count -gt 0) { $entry.Name } else { $entry.FullName }
            $target = [IO.Path]::GetFullPath([IO.Path]::Combine($destinationPath, $relative))
            if (!$target.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { throw '归档包含越界路径' }
            [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target)) | Out-Null
            [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)
        }
    } finally { $zip.Dispose() }
}

$version = $lock.version.Replace('-stable','')
$engine = Get-VerifiedArtifact "https://downloads.godotengine.org/?flavor=stable&platform=windows.64&slug=win64.exe.zip&version=$version" $lock.engine_archive 'SHA512' $lock.engine_sha512
Expand-CheckedArchive $engine (Join-Path $runtime $version)
$vendor = Get-VerifiedArtifact $lock.yati.url 'yati-v2.2.7-gdscript.zip' 'SHA256' $lock.yati.sha256
Expand-CheckedArchive $vendor (Join-Path $runtime 'yati-v2.2.7')
$null = Get-VerifiedArtifact $lock.font.url 'NotoSansCJKsc-Regular.otf' 'SHA256' $lock.font.sha256
& curl.exe --fail --silent --show-error --location --connect-timeout 15 --max-time 30 --output (Join-Path $runtime 'NotoSansCJK-LICENSE.txt') $lock.font.license_url
if ($LASTEXITCODE -ne 0) { throw '字体许可证下载失败' }
if (!$SkipTemplates) {
    $templates = Get-VerifiedArtifact "https://downloads.godotengine.org/?flavor=stable&platform=templates&slug=export_templates.tpz&version=$version" $lock.templates_archive 'SHA512' $lock.templates_sha512
    Expand-CheckedArchive $templates (Join-Path $runtime 'templates') @('web_nothreads_debug.zip','web_nothreads_release.zip','windows_debug_x86_64.exe','windows_release_x86_64.exe','version.txt')
}
Write-Output "Godot $($lock.version) 已校验并准备：$runtime"
