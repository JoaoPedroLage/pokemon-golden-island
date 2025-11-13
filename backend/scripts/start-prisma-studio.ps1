# Script PowerShell para iniciar o Prisma Studio no container Docker
# Uso: .\scripts\start-prisma-studio.ps1

Write-Host "🚀 Iniciando Prisma Studio no Docker..." -ForegroundColor Cyan
Write-Host "📊 Acesse em: http://localhost:5555" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Pressione Ctrl+C para parar o Prisma Studio" -ForegroundColor Yellow
Write-Host ""

# Verificar se o container está rodando
$containerRunning = docker-compose ps -q backend
if (-not $containerRunning) {
    Write-Host "❌ Erro: Container backend não está rodando!" -ForegroundColor Red
    Write-Host "💡 Execute: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Executar Prisma Studio no container
Write-Host "🔄 Iniciando Prisma Studio..." -ForegroundColor Yellow
Write-Host "⚠️  Este processo ficará rodando. Pressione Ctrl+C para parar." -ForegroundColor Yellow
Write-Host ""

# Executar Prisma Studio (não em background, para manter o processo ativo)
docker-compose exec backend npx prisma studio --hostname 0.0.0.0 --port 5555

