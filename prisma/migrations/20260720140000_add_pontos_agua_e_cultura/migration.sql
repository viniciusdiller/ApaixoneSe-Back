-- CreateTable
CREATE TABLE `pontos_agua` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('PRAIA', 'LAGOA') NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `descricaoCurta` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `imagemUrl` VARCHAR(191) NULL,
    `filtros` JSON NULL,
    `acessivel` BOOLEAN NOT NULL DEFAULT false,
    `dificuldade` VARCHAR(191) NULL,
    `estacionamento` BOOLEAN NOT NULL DEFAULT false,
    `quiosques` BOOLEAN NOT NULL DEFAULT false,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pontos_agua_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locais_culturais` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `texto` TEXT NOT NULL,
    `imagemUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
