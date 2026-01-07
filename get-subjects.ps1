# SSL certificate check ni o'chirish
add-type @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertsPolicy : ICertificatePolicy {
    public bool CheckValidationResult(ServicePoint srvPoint, X509Certificate certificate, WebRequest request, int certificateProblem) {
        return true;
    }
}
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

$body = @{
    PageNumber = 1
    PageSize = 100
    Search = ""
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://localhost:5001/api/Subject/get-all-page" -Method Post -ContentType "application/json" -Body $body
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Xatolik: $($_.Exception.Message)"
}
