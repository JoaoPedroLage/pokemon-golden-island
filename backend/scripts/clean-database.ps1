# Script PowerShell para limpar o banco de dados
# Uso: .\scripts\clean-database.ps1

Write-Host "🧹 Limpando banco de dados..." -ForegroundColor Cyan

# Função para ler variáveis do arquivo .env
function Read-EnvFile {
    param([string]$FilePath)
    
    $envVars = @{}
    if (Test-Path $FilePath) {
        Get-Content $FilePath | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Remove aspas se existirem
                $value = $value -replace '^["'']|["'']$', ''
                $envVars[$key] = $value
            }
        }
    }
    return $envVars
}

# Tentar ler do arquivo .env primeiro
$envPath = Join-Path $PSScriptRoot "..\.env"
$envVars = Read-EnvFile -FilePath $envPath

# Obter variáveis (prioridade: variável de ambiente > .env > padrão)
$postgresUser = $env:POSTGRES_USER
if (-not $postgresUser -and $envVars.ContainsKey("POSTGRES_USER")) {
    $postgresUser = $envVars["POSTGRES_USER"]
}
if (-not $postgresUser) {
    $postgresUser = "your_username"
    Write-Host "⚠️  Usando usuário padrão: $postgresUser" -ForegroundColor Yellow
    Write-Host "💡 Defina POSTGRES_USER no arquivo .env para usar um usuário específico" -ForegroundColor Yellow
}

$postgresDb = $env:POSTGRES_DB
if (-not $postgresDb -and $envVars.ContainsKey("POSTGRES_DB")) {
    $postgresDb = $envVars["POSTGRES_DB"]
}
if (-not $postgresDb) {
    $postgresDb = "pokemon_golden_age"
}

Write-Host "📊 Usuário: $postgresUser | Banco: $postgresDb" -ForegroundColor Gray

# Comando SQL para limpar o banco
$sqlCommand = @"
DELETE FROM "Pokemon";
DELETE FROM "Pokedex";
DELETE FROM "Player";
DELETE FROM "User";
ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Player_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Pokedex_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Pokemon_id_seq" RESTART WITH 1;
"@

# Executar o comando
Write-Host "`n🔄 Executando limpeza..." -ForegroundColor Yellow
docker-compose exec -T postgres psql -U $postgresUser -d $postgresDb -c $sqlCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Banco de dados limpo com sucesso!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Erro ao limpar o banco de dados" -ForegroundColor Red
    Write-Host "💡 Verifique se:" -ForegroundColor Yellow
    Write-Host "   - Os containers estão rodando (docker-compose ps)" -ForegroundColor Yellow
    Write-Host "   - O usuário do PostgreSQL está correto" -ForegroundColor Yellow
    Write-Host "   - O nome do banco de dados está correto" -ForegroundColor Yellow
    exit 1
}

