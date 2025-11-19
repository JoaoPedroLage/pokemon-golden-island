# Pokemon Golden Island

## Description

A full-stack application that allows users to interact with Pokemon. Users can randomly encounter Pokemon, capture them, release them, and view their captured Pokemon list.

-----

## 🌟 Project Overview

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | [Next.js](https://github.com/vercel/next.js) (React) | High-performance user interface, routing, and HTTP requests. |
| **Backend** | [NestJS](https://github.com/nestjs/nest) (TypeScript) | Modular API layer for business logic, JWT authentication, and database communication. |
| **Database**| [PostgreSQL](https://www.postgresql.org/) | Robust and relational data persistence (users, captured Pokémon). |
| **Orchestration** | **Docker** | Containerization and reproducible local development environment setup (Backend + DB). |

### Requirements Met

  -   [x] Backend developed with NestJS
  -   [x] Frontend developed with Next.js
  -   [x] Database: PostgreSQL
  -   [x] Environment orchestration with **Docker**
  -   [x] Pokemon data from [PokeAPI](https://pokeapi.co/)
  -   [x] Only first generation Pokemon available
  -   [x] Project versioned on GitHub
  -   [x] README.md with complete setup instructions

-----

## 🐳 Getting Started (Full-Stack with Docker)

This is the **recommended** method to run the project, ensuring a complete and instantly reproducible development environment.

**Prerequisites:**

  - **Docker** and **Docker Compose** installed and running.
  - Node.js and NPM (or Yarn/pnpm/Bun) for the Frontend.

### 1\. Environment Setup

Create the Backend environment file in the **`backend`** directory:

```bash
# Create .env from .env.example
cp backend/.env.example backend/.env
```

*(Ensure the `DATABASE_URL` in `.env` is configured for the local Docker service, e.g., `localhost:5432`)*

### 2\. Start Containers and Database Migrations

Execute the commands from the **project root directory**:

```bash
# 🛠️ START: Initializes services (Backend and PostgreSQL Database)
docker-compose up --build -d

# 🗄️ Apply Prisma Migrations on the running Backend container
# This sets up the database schema inside the container's PostgreSQL instance.
docker-compose exec backend npm run db:migrate
```

### 3\. Start the Frontend (Next.js)

With the Backend running (API at `http://localhost:3001`), start the Frontend:

```bash
# Navigate to the Frontend directory
cd ./frontd/

# Install dependencies
npm install

# Run the development server
npm run dev

# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the result.

-----

## Backend - Manual Setup (Alternative)

Use these instructions if you prefer to run the Backend directly on your machine without Docker, assuming a local PostgreSQL instance is already running.

### 1\. Project Setup and Dependencies

```bash
cd backend
npm install
```

### 2\. Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pokemon_golden_age
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3001
```

### 3\. Database Setup

1.  Make sure PostgreSQL is running and accessible (default port: 5432).
2.  Run Prisma migrations:

<!-- end list -->

```bash
npm run db:generate
npm run db:migrate
```

### 4\. Compile and Run

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run build
npm run start:prod
```

-----

## Deployment Configuration

### Deploy on Vercel

The Frontend is deployed to Vercel:
[https://pokemon-golden-island-jpolive-dev.vercel.app/](https://pokemon-golden-island-jpolive-dev.vercel.app/)

### Render Backend Configuration

The Backend is configured for deployment on Render. Ensure the following environment variables are set in the Render dashboard:

#### Required Environment Variables:

1.  **DATABASE\_URL** - PostgreSQL connection string (Use the Internal Database URL provided by Render)
2.  **JWT\_SECRET** - Secret key for JWT token generation
3.  **NODE\_ENV** - Set to `production`

#### Render Service Configuration:

  - **Root Directory**: `backend`
  - **Build Command**: `npm install && npx prisma generate && npm run build`
  - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

The `render.yaml` file is included in the repository and should be automatically detected by Render.

### Frontend API URL Configuration

The frontend uses the following environment variable to connect to the API:

  - **NEXT\_PUBLIC\_API\_URL**   - For production: `https://pokemon-golden-island.onrender.com`
      - For local development: `http://localhost:3001`

-----

## Run Tests

```bash
$ unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)**.

This means:

  - ✅ **Free to use** for non-commercial purposes
  - ✅ **Free to modify** and distribute
  - ❌ **Cannot be used** for commercial purposes
  - ✅ **Must share alike** - derivative works must use the same license

See the [LICENSE](https://www.google.com/search?q=LICENSE) file for full details, or visit [Creative Commons](https://creativecommons.org/licenses/by-nc-sa/4.0/) for more information.

**Note:** This license applies to the Pokemon Golden Island project. Third-party dependencies (NestJS, Next.js, etc.) maintain their own licenses.

```
```