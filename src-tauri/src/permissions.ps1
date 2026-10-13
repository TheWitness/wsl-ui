# Shared by the operation process and the UAC launcher. Classification uses
# exception metadata, never translated message text.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$env:WSL_UTF8 = '1'
function Get-FailureKind($record) {
    $kind = 'other'
    $exception = $record.Exception
    while ($null -ne $exception) {
        $codes = @($exception.HResult)
        if ($exception -is [System.ComponentModel.Win32Exception]) {
            $codes += $exception.NativeErrorCode
        }
        foreach ($code in $codes) {
            $bits = [long]$code -band 0xffffffffL
            if ($bits -eq 1223 -or $bits -eq 0x800704c7L) { return 'cancelled' }
            if ($bits -in @(5, 740, 1314, 0x80070005L, 0x800702e4L, 0x80070522L, 0x80041003L)) {
                $kind = 'permission_denied'
            }
        }
        if (($exception -is [System.UnauthorizedAccessException]) -or ($exception -is [System.Security.SecurityException])) { $kind = 'permission_denied' }
        if ($exception -is [System.Management.Automation.CommandNotFoundException] -and $kind -eq 'other') {
            $kind = 'unavailable'
        }
        $exception = $exception.InnerException
    }
    if ($kind -eq 'other' -and $record.CategoryInfo.Category -eq 'PermissionDenied') {
        $kind = 'permission_denied'
    }
    return $kind
}
function Write-Result($success, $kind, $message) {
    $json = @{ success = $success; kind = $kind; message = [string]$message } | ConvertTo-Json -Compress
    [System.IO.File]::WriteAllText($resultPath, $json, [System.Text.UTF8Encoding]::new($false))
}
