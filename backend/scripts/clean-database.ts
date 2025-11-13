import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Delete in reverse order of dependencies to avoid foreign key errors
    // Pokemon depends on Pokedex
    const deletedPokemons = await prisma.pokemon.deleteMany({});
    console.log(`✓ ${deletedPokemons.count} Pokemon(s) deleted`);

    // Pokedex depends on Player
    const deletedPokedexes = await prisma.pokedex.deleteMany({});
    console.log(`✓ ${deletedPokedexes.count} Pokedex(es) deleted`);

    // Player depends on User
    const deletedPlayers = await prisma.player.deleteMany({});
    console.log(`✓ ${deletedPlayers.count} Player(s) deleted`);

    // User is independent
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✓ ${deletedUsers.count} User(s) deleted`);

    // Reset sequences (auto-increment)
    console.log('\n🔄 Resetting sequences...');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "User_id_seq" RESTART WITH 1');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "Player_id_seq" RESTART WITH 1');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "Pokedex_id_seq" RESTART WITH 1');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "Pokemon_id_seq" RESTART WITH 1');
    console.log('✓ Sequences reset');

    console.log('\n✅ Database cleaned and reset successfully!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
cleanDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

