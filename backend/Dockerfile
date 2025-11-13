FROM node:20

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN echo "📦 Gerando Prisma Client..." && \
    npx prisma generate && \
    echo "✅ Prisma Client gerado"

# Build da aplicação com verificação detalhada
RUN echo "🔨 Iniciando build da aplicação..." && \
    npm run build || (echo "❌ Build falhou!" && exit 1) && \
    echo "📦 Verificando resultado do build..." && \
    if [ ! -d "dist" ]; then \
      echo "❌ Erro: Diretório dist não foi criado"; \
      echo "Verificando estrutura do projeto:"; \
      ls -la; \
      echo "Verificando se src existe:"; \
      ls -la src/; \
      exit 1; \
    fi && \
    if [ ! -f "dist/src/main.js" ] && [ ! -f "dist/main.js" ]; then \
      echo "❌ Erro: Arquivo dist/src/main.js ou dist/main.js não foi criado"; \
      echo "Conteúdo do diretório dist:"; \
      ls -la dist/ || echo "Diretório dist não existe"; \
      echo "Conteúdo do diretório dist/src (se existir):"; \
      ls -la dist/src/ 2>/dev/null || echo "Diretório dist/src não existe"; \
      echo "Verificando se src/main.ts existe:"; \
      ls -la src/main.ts || echo "src/main.ts não encontrado"; \
      exit 1; \
    fi && \
    echo "✅ Build concluído com sucesso!" && \
    echo "Arquivos gerados em dist/:" && \
    ls -lh dist/ | head -15

# Expor a porta 3001
EXPOSE 3001

# Instalar wait-for-it e postgresql-client para aguardar e verificar o PostgreSQL
RUN apt-get update && apt-get install -y wait-for-it postgresql-client && rm -rf /var/lib/apt/lists/*

# Criar script de inicialização
RUN echo '#!/bin/sh\n\
set -e\n\
echo "=== Iniciando aplicação ==="\n\
echo "Aguardando PostgreSQL estar pronto..."\n\
wait-for-it postgres:5432 -t 60 --strict -- echo "PostgreSQL está pronto"\n\
echo "Aguardando alguns segundos para garantir que o banco está totalmente inicializado..."\n\
sleep 10\n\
# Construir ou corrigir DATABASE_URL\n\
if [ -z "${DATABASE_URL}" ] || [ "${DATABASE_URL}" = "" ] || [ "${DATABASE_URL}" = "null" ]; then\n\
  export DATABASE_URL="postgresql://${POSTGRES_USER:-your_username}:${POSTGRES_PASSWORD:-your_password}@postgres:5432/${POSTGRES_DB:-pokemon_golden_age}"\n\
  echo "DATABASE_URL construída automaticamente (estava vazia ou inválida)"\n\
else\n\
  echo "Usando DATABASE_URL fornecida via variável de ambiente"\n\
  # Verificar se começa com protocolo correto\n\
  if ! echo "${DATABASE_URL}" | grep -qE "^(postgresql|postgres)://"; then\n\
    echo "⚠ DATABASE_URL não começa com postgresql:// ou postgres://, reconstruindo..."\n\
    export DATABASE_URL="postgresql://${POSTGRES_USER:-your_username}:${POSTGRES_PASSWORD:-your_password}@postgres:5432/${POSTGRES_DB:-pokemon_golden_age}"\n\
    echo "✓ DATABASE_URL reconstruída com protocolo correto"\n\
  else\n\
    # Substituir localhost por postgres se necessário (para Docker)\n\
    if echo "${DATABASE_URL}" | grep -q "@localhost:"; then\n\
      export DATABASE_URL=$(echo "${DATABASE_URL}" | sed "s/@localhost:/@postgres:/g")\n\
      echo "✓ DATABASE_URL corrigida: localhost substituído por postgres"\n\
    fi\n\
  fi\n\
fi\n\
echo "DATABASE_URL configurada (ocultando senha): $(echo "$DATABASE_URL" | sed 's/:[^@]*@/:****@/g')"\n\
# Verificar se DATABASE_URL contém postgres (nome do serviço)\n\
if echo "$DATABASE_URL" | grep -q "@postgres:"; then\n\
  echo "✓ DATABASE_URL está configurada corretamente com nome do serviço Docker"\n\
else\n\
  echo "⚠ AVISO: DATABASE_URL pode não estar usando o nome do serviço Docker correto"\n\
fi\n\
# Verificar conexão com o banco antes de continuar\n\
echo "Verificando conexão com o banco de dados..."\n\
RETRIES=15\n\
until PGPASSWORD="${POSTGRES_PASSWORD:-your_password}" psql -h postgres -U "${POSTGRES_USER:-your_username}" -d "${POSTGRES_DB:-pokemon_golden_age}" -c "SELECT 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do\n\
  echo "Aguardando banco estar totalmente disponível... ($RETRIES tentativas restantes)"\n\
  RETRIES=$((RETRIES-1))\n\
  sleep 2\n\
done\n\
if [ $RETRIES -eq 0 ]; then\n\
  echo "⚠ Aviso: Não foi possível verificar a conexão, mas continuando..."\n\
else\n\
  echo "✓ Conexão com o banco verificada"\n\
fi\n\
echo "Executando migrations..."\n\
npx prisma migrate deploy || echo "Migrations já aplicadas ou erro ao executar"\n\
echo "Aguardando mais alguns segundos antes de iniciar o servidor..."\n\
sleep 3\n\
# Verificar se o build existe (NestJS gera em dist/src/main.js)\n\
if [ ! -f "/app/dist/src/main.js" ] && [ ! -f "/app/dist/main.js" ]; then\n\
  echo "❌ Erro: Arquivo dist/src/main.js ou dist/main.js não encontrado. Executando build..."\n\
  cd /app\n\
  echo "Verificando estrutura antes do build:"\n\
  ls -la /app/src/ | head -5\n\
  echo "Executando build..."\n\
  npm run build\n\
  BUILD_EXIT_CODE=$?\n\
  if [ $BUILD_EXIT_CODE -ne 0 ]; then\n\
    echo "❌ Build falhou com código de saída: $BUILD_EXIT_CODE"\n\
    exit 1\n\
  fi\n\
  if [ ! -f "/app/dist/src/main.js" ] && [ ! -f "/app/dist/main.js" ]; then\n\
    echo "❌ Erro: Build executado mas dist/src/main.js ou dist/main.js ainda não existe"\n\
    echo "Conteúdo do diretório /app:"\n\
    ls -la /app/ | head -10\n\
    echo "Conteúdo do diretório dist (se existir):"\n\
    ls -la /app/dist/ 2>/dev/null || echo "Diretório dist não existe"\n\
    echo "Verificando se src/main.ts existe:"\n\
    ls -la /app/src/main.ts || echo "src/main.ts não encontrado"\n\
    exit 1\n\
  fi\n\
  echo "✅ Build executado com sucesso no runtime"\n\
fi\n\
echo "✓ Build verificado. Iniciando servidor NestJS..."\n\
exec npm run start:prod' > /app/start.sh && chmod +x /app/start.sh

# Comando para iniciar a aplicação
CMD ["/app/start.sh"]

