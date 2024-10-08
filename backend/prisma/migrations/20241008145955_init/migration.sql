-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pokeballs" INTEGER NOT NULL DEFAULT 30,
    "berries" INTEGER NOT NULL DEFAULT 5,
    "pokedexId" INTEGER,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pokedex" (
    "id" SERIAL NOT NULL,
    "totalPokemons" INTEGER NOT NULL DEFAULT 0,
    "totalCaptured" INTEGER NOT NULL DEFAULT 0,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "Pokedex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sprite" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "pokedexId" INTEGER NOT NULL,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_pokedexId_key" ON "Player"("pokedexId");

-- CreateIndex
CREATE UNIQUE INDEX "Pokedex_playerId_key" ON "Pokedex"("playerId");

-- AddForeignKey
ALTER TABLE "Pokedex" ADD CONSTRAINT "Pokedex_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pokemon" ADD CONSTRAINT "Pokemon_pokedexId_fkey" FOREIGN KEY ("pokedexId") REFERENCES "Pokedex"("id") ON DELETE CASCADE ON UPDATE CASCADE;
