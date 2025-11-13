FROM node:20

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor a porta 3001
EXPOSE 3001

# Instalar wait-for-it para aguardar o PostgreSQL
RUN apt-get update && apt-get install -y wait-for-it && rm -rf /var/lib/apt/lists/*

# Criar script de inicialização
RUN echo '#!/bin/sh\n\
echo "Aguardando PostgreSQL..."\n\
wait-for-it postgres:5432 -t 30\n\
echo "Executando migrations..."\n\
npx prisma migrate deploy || echo "Migrations já aplicadas ou erro ao executar"\n\
echo "Iniciando servidor..."\n\
npm run start:prod' > /app/start.sh && chmod +x /app/start.sh

# Comando para iniciar a aplicação
CMD ["/app/start.sh"]

