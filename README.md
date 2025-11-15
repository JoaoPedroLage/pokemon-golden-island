# Pokemon Golden Island

## Description

A full-stack application that allows users to interact with Pokemon. Users can randomly encounter Pokemon, capture them, release them, and view their captured Pokemon list.

## Requirements

-   [x] Backend developed with [NestJS](https://github.com/nestjs/nest)
-   [x] Frontend developed with [Next.js](https://github.com/vercel/next.js)
-   [x] Database: [PostgreSQL](https://www.postgresql.org/)
-   [x] Pokemon data from [PokeAPI](https://pokeapi.co/)
-   [x] Only first generation Pokemon available
-   [x] Project versioned on GitHub
-   [x] README.md with setup instructions

## Deployment on Render

### Backend Configuration

The backend is configured to deploy on Render. Make sure to configure the following environment variables in the Render dashboard:

#### Required Environment Variables:

1. **DATABASE_URL** - PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database`
   - You can create a PostgreSQL database in Render and use the Internal Database URL

2. **JWT_SECRET** - Secret key for JWT token generation
   - Generate a strong random string (e.g., using `openssl rand -base64 32`)

3. **NODE_ENV** - Set to `production`

4. **PORT** - Server port (default: 3001, but Render will set this automatically)

#### Render Service Configuration:

- **Root Directory**: `backend`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm run start:prod`

The `render.yaml` file is included in the repository and should be automatically detected by Render.

### Frontend Configuration

The frontend is configured to use the backend API URL via environment variable:

- **NEXT_PUBLIC_API_URL** - Backend API URL
  - For production: `https://pokemon-golden-island.onrender.com`
  - For local development: `http://localhost:3001`

## Frontend - Next.js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
#
cd ./frontd/
#
npm install
#
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

https://pokemon-golden-island-jpolive-dev.vercel.app/

##

## Backend - Nest

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

### Project Setup

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pokemon_golden_age
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3001
```

### Database Setup

1. Make sure PostgreSQL is running
2. Run Prisma migrations:

```bash
npm run db:generate
npm run db:migrate
```

### Compile and Run

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run build
npm run start:prod
```

## Run tests

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

See the [LICENSE](LICENSE) file for full details, or visit [Creative Commons](https://creativecommons.org/licenses/by-nc-sa/4.0/) for more information.

**Note:** This license applies to the Pokemon Golden Island project. Third-party dependencies (NestJS, Next.js, etc.) maintain their own licenses.
