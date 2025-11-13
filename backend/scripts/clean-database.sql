-- Script SQL para limpar o banco de dados
-- Deleta todos os dados e reseta as sequências

-- Deletar dados (em ordem para respeitar foreign keys)
DELETE FROM "Pokemon";
DELETE FROM "Pokedex";
DELETE FROM "Player";
DELETE FROM "User";

-- Resetar sequências (auto-increment)
ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Player_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Pokedex_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Pokemon_id_seq" RESTART WITH 1;

