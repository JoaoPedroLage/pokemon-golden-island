#!/bin/bash

# Script para iniciar o Prisma Studio no container Docker
# Uso: ./scripts/start-prisma-studio.sh

echo "🚀 Iniciando Prisma Studio no Docker..."
echo "📊 Acesse em: http://localhost:5555"
echo ""

# Verificar se o container está rodando
if ! docker-compose ps -q backend > /dev/null 2>&1; then
    echo "❌ Erro: Container backend não está rodando!"
    echo "💡 Execute: docker-compose up -d"
    exit 1
fi

# Executar Prisma Studio no container
echo "🔄 Iniciando Prisma Studio..."
echo "⚠️  Este processo ficará rodando. Pressione Ctrl+C para parar."
echo ""

# Executar Prisma Studio (não em background, para manter o processo ativo)
docker-compose exec backend npx prisma studio --hostname 0.0.0.0 --port 5555

