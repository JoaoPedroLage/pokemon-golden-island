# Scripts de Banco de Dados

Este diretório contém scripts úteis para gerenciar o banco de dados.

## Scripts Disponíveis

### 1. `clean-database.ts` - Limpar e Resetar

Remove todos os dados e reseta as sequências (auto-increment) para 1.

**Uso:**
```bash
npm run db:clean
# ou
npm run db:reset  # (alias para db:clean)
```

**O que faz:**
- Deleta todos os registros de todas as tabelas
- Reseta as sequências (auto-increment) para 1
- Mantém a estrutura do banco de dados

### 2. Scripts Shell

- `clean-database.sh` - Script bash para Linux/Mac
- `clean-database.ps1` - Script PowerShell para Windows
- `clean-database.sql` - Script SQL puro (referência)
- `start-prisma-studio.sh` - Iniciar Prisma Studio (Linux/Mac)
- `start-prisma-studio.ps1` - Iniciar Prisma Studio (Windows)

## Uso

### Opção 1: Scripts Shell (RECOMENDADO - Funciona imediatamente)

Os scripts leem automaticamente as variáveis do arquivo `.env` na raiz do backend.

**Windows (PowerShell):**
```powershell
.\scripts\clean-database.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/clean-database.sh
./scripts/clean-database.sh
```

**📝 Configuração do .env:**
Crie um arquivo `.env` na raiz do backend com:
```env
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha
POSTGRES_DB=pokemon_golden_age
POSTGRES_PORT=5432
```

Os scripts usam a seguinte prioridade:
1. Variáveis de ambiente do sistema
2. Arquivo `.env`
3. Valores padrão

### Opção 2: Scripts NPM (Após reconstruir container)

```bash
# Reconstruir container (se necessário)
docker-compose build backend
docker-compose up -d

# Executar script
docker-compose exec backend npm run db:clean
# ou
docker-compose exec backend npm run db:reset
```

### Opção 3: Localmente (sem Docker)

```bash
npm run db:clean
# ou
npm run db:reset  # (alias para db:clean)
```

## Ordem de Deleção

Os scripts deletam os dados na ordem correta para respeitar as foreign keys:

1. `Pokemon` (depende de Pokedex)
2. `Pokedex` (depende de Player)
3. `Player` (depende de User)
4. `User` (independente)

## ⚠️ Aviso

**ATENÇÃO:** Esses scripts deletam TODOS os dados do banco de dados. Use com cuidado!

- Faça backup antes de executar em produção
- Certifique-se de que está no ambiente correto
- Esses scripts são ideais para desenvolvimento e testes

## Prisma Studio no Docker

Para acessar o Prisma Studio pelo Docker:

### Opção 1: Script Shell (RECOMENDADO)

**Windows (PowerShell):**
```powershell
.\scripts\start-prisma-studio.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/start-prisma-studio.sh
./scripts/start-prisma-studio.sh
```

### Opção 2: Comando NPM

```bash
npm run db:studio:docker
```

### Opção 3: Comando Direto

```bash
docker-compose exec backend npx prisma studio --hostname 0.0.0.0
```

Depois de executar, acesse: **http://localhost:5555**

⚠️ **Nota:** A porta 5555 já está exposta no `docker-compose.yml`. Certifique-se de que o container backend está rodando.

## Exemplo de Uso

```bash
# Limpar e resetar banco de dados
npm run db:clean

# (Opcional) Aplicar migrations novamente se necessário
npm run db:migrate

# Abrir Prisma Studio para visualizar os dados
npm run db:studio:docker
```

