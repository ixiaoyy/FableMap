param([ValidateSet('check','web','windows','editor','run')][string]$Action = 'check')
$ErrorActionPreference = 'Stop'
# 保留已交付的 PowerShell 入口，版本、检查和导出统一由跨平台 CLI 负责。
& node (Join-Path $PSScriptRoot 'godot.mjs') $Action
exit $LASTEXITCODE
