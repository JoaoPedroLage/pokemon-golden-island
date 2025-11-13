#!/bin/bash

# Script bash para limpar o banco de dados
# Uso: ./scripts/clean-database.sh

echo "🧹 Limpando banco de dados..."

# Carregar variáveis do arquivo .env se existir
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
    echo "📄 Carregando variáveis do arquivo .env..."
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
fi

# Tentar obter o usuário do PostgreSQL (prioridade: variável de ambiente > .env > padrão)
POSTGRES_USER=${POSTGRES_USER:-your_username}
POSTGRES_DB=${POSTGRES_DB:-pokemon_golden_age}

echo "📊 Usuário: $POSTGRES_USER | Banco: $POSTGRES_DB"

# Comando SQL para limpar o banco
SQL_COMMAND='DELETE FROM "Pokemon"; DELETE FROM "Pokedex"; DELETE FROM "Player"; DELETE FROM "User"; ALTER SEQUENCE "User_id_seq" RESTART WITH 1; ALTER SEQUENCE "Player_id_seq" RESTART WITH 1; ALTER SEQUENCE "Pokedex_id_seq" RESTART WITH 1; ALTER SEQUENCE "Pokemon_id_seq" RESTART WITH 1;'

# Executar o comando
echo ""
echo "🔄 Executando limpeza..."
docker-compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$SQL_COMMAND"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Banco de dados limpo com sucesso!"
else
    echo ""
    echo "❌ Erro ao limpar o banco de dados"
    echo "💡 Verifique se:"
    echo "   - Os containers estão rodando (docker-compose ps)"
    echo "   - O usuário do PostgreSQL está correto"
    echo "   - O nome do banco de dados está correto"
    exit 1
fi
