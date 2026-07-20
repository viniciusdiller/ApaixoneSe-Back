-- AlterTable
ALTER TABLE `pontos_agua` ADD COLUMN `endereco` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `locais_culturais` ADD COLUMN `endereco` VARCHAR(191) NULL;

-- AlterTable
-- A coluna `endereco` na tabela `eventos` já existe fisicamente no banco
-- (aplicada por uma migration anterior cujo arquivo foi perdido). Mantida
-- aqui apenas para documentar o schema — não reexecutada neste ambiente.
-- ALTER TABLE `eventos` ADD COLUMN `endereco` VARCHAR(191) NULL;
