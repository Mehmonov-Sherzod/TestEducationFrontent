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

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjExMTExMTExLTExMTEtMTExMS0xMTExLTExMTExMTExMTExOSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJTaGVyem9kIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoibWVobW92b3ZzaGVyem9kQGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlN1cGVyQWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJNYW5hZ2VVc2VycyIsIk1hbmFnZUFkbWlucyIsIlN5c3RlbVNldHRpbmdzIiwiTWFuYWdlVXNlcnNTdHVkZW50IiwiTWFuYWdlVGVzdHMiLCJNYW5hZ2VUb3BpY3MiLCJNYW5hZ2VTdWJqZWN0cyIsIk1hbmFnZVF1ZXN0aW9ucyIsIlZpZXdSZXN1bHRzIiwiVGFrZVRlc3QiLCJWaWV3T3duUmVzdWx0cyIsIlZpZXdBdmFpbGFibGVUZXN0cyJdLCJleHAiOjE3Njc2OTcxMDR9.kfJJjewcuMlyroXqnQiX2tD6tdZzWBJ7Mg99ZrGcpJY"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$baseUrl = "https://localhost:5001"

# Fan ID lari
$fanlar = @{
    "Majburiy Matematika" = @{ Id = "11111111-1111-1141-1111-111111111119"; Easy = 100; Medium = 0; Hard = 0 }
    "Majburiy Tarix" = @{ Id = "11111111-1111-1151-1111-111111111119"; Easy = 100; Medium = 0; Hard = 0 }
    "Majburiy Ona Tili" = @{ Id = "11111111-1111-1161-1111-111111111119"; Easy = 100; Medium = 0; Hard = 0 }
    "Matematika" = @{ Id = "019b5946-1a9a-782c-8de4-42e9636ec2fa"; Easy = 50; Medium = 100; Hard = 50 }
    "Fizika" = @{ Id = "019b8500-fc24-7f56-b1e3-cfb5a700f3f9"; Easy = 50; Medium = 100; Hard = 50 }
}

# Mavzu olish yoki yaratish
function Get-OrCreateTopic($subjectId, $subjectName) {
    # Mavzularni olish - GET /api/Topic/paged?SubjectId=xxx&PageNumber=1&PageSize=10
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/Topic/paged?SubjectId=$subjectId&PageNumber=1&PageSize=10&Search=" -Method Get -Headers $headers
        $topics = $response.Result.Values
        if ($topics -and $topics.Count -gt 0) {
            return $topics[0].Id
        }
    } catch {
        Write-Host "    Mavzu olishda xatolik: $($_.Exception.Message)" -ForegroundColor Gray
    }

    # Mavzu yaratish - POST /api/Topic/create%20-%20topic (URL encoded space)
    $topicBody = @{ TopicName = "$subjectName - Umumiy"; SubjectId = $subjectId } | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/Topic/create%20-%20topic" -Method Post -Headers $headers -Body $topicBody
        return $response.Result.Id
    } catch {
        Write-Host "    Mavzu yaratishda xatolik: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Savol yaratish (multipart/form-data)
function Create-Question($subjectId, $topicId, $questionText, $level, $answers) {
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"

    $bodyLines = @()
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"QuestionText`"$LF"
    $bodyLines += $questionText

    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"TopicId`"$LF"
    $bodyLines += $topicId

    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"SubjectId`"$LF"
    $bodyLines += $subjectId

    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"Level`"$LF"
    $bodyLines += $level

    for ($i = 0; $i -lt $answers.Count; $i++) {
        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"Answers[$i].Text`"$LF"
        $bodyLines += $answers[$i].Text

        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"Answers[$i].IsCorrect`"$LF"
        $bodyLines += $answers[$i].IsCorrect.ToString().ToLower()
    }

    $bodyLines += "--$boundary--"
    $body = $bodyLines -join $LF

    $multipartHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/QuestionAnswer" -Method Post -Headers $multipartHeaders -Body $body
        return $true
    } catch {
        return $false
    }
}

Write-Host "=== SAVOLLAR QO'SHISH BOSHLANDI ===" -ForegroundColor Cyan
Write-Host ""

foreach ($fanName in $fanlar.Keys) {
    $fan = $fanlar[$fanName]
    $subjectId = $fan.Id

    Write-Host "Fan: $fanName" -ForegroundColor Yellow

    # Mavzu olish
    $topicId = Get-OrCreateTopic -subjectId $subjectId -subjectName $fanName
    if (-not $topicId) {
        Write-Host "  Mavzu topilmadi, o'tkazib yuborildi" -ForegroundColor Red
        continue
    }
    Write-Host "  Mavzu ID: $topicId" -ForegroundColor Gray

    $created = 0
    $errors = 0

    # Easy savollar
    for ($i = 1; $i -le $fan.Easy; $i++) {
        $questionText = "$fanName - Oson savol #$i"
        $answers = @(
            @{ Text = "To'g'ri javob"; IsCorrect = $true }
            @{ Text = "Noto'g'ri A"; IsCorrect = $false }
            @{ Text = "Noto'g'ri B"; IsCorrect = $false }
            @{ Text = "Noto'g'ri C"; IsCorrect = $false }
        )

        if (Create-Question -subjectId $subjectId -topicId $topicId -questionText $questionText -level 0 -answers $answers) {
            $created++
        } else {
            $errors++
        }
        Write-Host "`r  Easy: $i/$($fan.Easy)" -NoNewline
    }
    if ($fan.Easy -gt 0) { Write-Host " OK" -ForegroundColor Green }

    # Medium savollar
    for ($i = 1; $i -le $fan.Medium; $i++) {
        $questionText = "$fanName - O'rta savol #$i"
        $answers = @(
            @{ Text = "To'g'ri javob"; IsCorrect = $true }
            @{ Text = "Noto'g'ri A"; IsCorrect = $false }
            @{ Text = "Noto'g'ri B"; IsCorrect = $false }
            @{ Text = "Noto'g'ri C"; IsCorrect = $false }
        )

        if (Create-Question -subjectId $subjectId -topicId $topicId -questionText $questionText -level 1 -answers $answers) {
            $created++
        } else {
            $errors++
        }
        Write-Host "`r  Medium: $i/$($fan.Medium)" -NoNewline
    }
    if ($fan.Medium -gt 0) { Write-Host " OK" -ForegroundColor Green }

    # Hard savollar
    for ($i = 1; $i -le $fan.Hard; $i++) {
        $questionText = "$fanName - Qiyin savol #$i"
        $answers = @(
            @{ Text = "To'g'ri javob"; IsCorrect = $true }
            @{ Text = "Noto'g'ri A"; IsCorrect = $false }
            @{ Text = "Noto'g'ri B"; IsCorrect = $false }
            @{ Text = "Noto'g'ri C"; IsCorrect = $false }
        )

        if (Create-Question -subjectId $subjectId -topicId $topicId -questionText $questionText -level 2 -answers $answers) {
            $created++
        } else {
            $errors++
        }
        Write-Host "`r  Hard: $i/$($fan.Hard)" -NoNewline
    }
    if ($fan.Hard -gt 0) { Write-Host " OK" -ForegroundColor Green }

    Write-Host "  Jami: $created ta qo'shildi, $errors ta xatolik" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "=== TAYYOR ===" -ForegroundColor Green
