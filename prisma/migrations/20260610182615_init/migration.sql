-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `usuario` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `perfil` ENUM('USUARIO', 'PARCEIRO', 'ADMIN') NOT NULL DEFAULT 'USUARIO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_usuario_key`(`usuario`),
    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atividades` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `local` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `roteiro` ENUM('A_PE', 'ESPORTE_E_AVENTURA', 'DE_PRAIAS', 'CULTURAL', 'RELIGIOSO', 'RURAL', 'ECOLOGICO') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitas` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `gastronomiaId` VARCHAR(191) NULL,
    `atividadeId` VARCHAR(191) NULL,
    `dataVisita` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `local` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos_principais` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `etapa` VARCHAR(191) NULL,
    `data` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastronomias` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `instagram` VARCHAR(191) NULL,
    `validade` DATETIME(3) NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `especialidade` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `responsavelNome` VARCHAR(191) NOT NULL,
    `responsavelCpf` VARCHAR(191) NOT NULL,
    `documentoPdfUrl` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    `usuarioId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gastronomias_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospedagens` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `tags` JSON NULL,
    `instagram` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `textoDiferencial` TEXT NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `responsavelNome` VARCHAR(191) NOT NULL,
    `responsavelCpf` VARCHAR(191) NOT NULL,
    `documentoPdfUrl` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    `usuarioId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hospedagens_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicos_turista` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('GUIA_TURISMO', 'AGENCIA_TURISMO', 'ESPORTE_LAZER', 'LOCADORA_VEICULOS') NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `instagram` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,
    `validade` DATETIME(3) NULL,
    `descricao` TEXT NULL,
    `endereco` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NULL,
    `roteiro` ENUM('A_PE', 'ESPORTE_E_AVENTURA', 'DE_PRAIAS', 'CULTURAL', 'RELIGIOSO', 'RURAL', 'ECOLOGICO') NULL,
    `idiomas` VARCHAR(191) NULL,
    `comprovanteUrl` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDENTE', 'APROVADO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    `usuarioId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cat` (
    `id` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `imagensUrl` JSON NULL,
    `videoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CasaDeCambio` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secretaria_turismo` (
    `id` VARCHAR(191) NOT NULL,
    `textoExplicativo` TEXT NOT NULL,
    `videoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secretaria_turismo_turistando` (
    `id` VARCHAR(191) NOT NULL,
    `secretariaTurismoId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `imagensUrl` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secretaria_turismo_projeto` (
    `id` VARCHAR(191) NOT NULL,
    `secretariaTurismoId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `imagemUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planos_viagem` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_plano_viagem` (
    `id` VARCHAR(191) NOT NULL,
    `dataHoraAgendada` DATETIME(3) NOT NULL,
    `anotacao` TEXT NULL,
    `planoViagemId` VARCHAR(191) NOT NULL,
    `gastronomiaId` VARCHAR(191) NULL,
    `hospedagemId` VARCHAR(191) NULL,
    `eventoId` VARCHAR(191) NULL,
    `atividadeId` VARCHAR(191) NULL,
    `servicoTuristaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visitas` ADD CONSTRAINT `visitas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas` ADD CONSTRAINT `visitas_gastronomiaId_fkey` FOREIGN KEY (`gastronomiaId`) REFERENCES `gastronomias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas` ADD CONSTRAINT `visitas_atividadeId_fkey` FOREIGN KEY (`atividadeId`) REFERENCES `atividades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastronomias` ADD CONSTRAINT `gastronomias_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hospedagens` ADD CONSTRAINT `hospedagens_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicos_turista` ADD CONSTRAINT `servicos_turista_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `secretaria_turismo_turistando` ADD CONSTRAINT `secretaria_turismo_turistando_secretariaTurismoId_fkey` FOREIGN KEY (`secretariaTurismoId`) REFERENCES `secretaria_turismo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `secretaria_turismo_projeto` ADD CONSTRAINT `secretaria_turismo_projeto_secretariaTurismoId_fkey` FOREIGN KEY (`secretariaTurismoId`) REFERENCES `secretaria_turismo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planos_viagem` ADD CONSTRAINT `planos_viagem_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_plano_viagem` ADD CONSTRAINT `itens_plano_viagem_planoViagemId_fkey` FOREIGN KEY (`planoViagemId`) REFERENCES `planos_viagem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_plano_viagem` ADD CONSTRAINT `itens_plano_viagem_gastronomiaId_fkey` FOREIGN KEY (`gastronomiaId`) REFERENCES `gastronomias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_plano_viagem` ADD CONSTRAINT `itens_plano_viagem_hospedagemId_fkey` FOREIGN KEY (`hospedagemId`) REFERENCES `hospedagens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_plano_viagem` ADD CONSTRAINT `itens_plano_viagem_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `eventos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_plano_viagem` ADD CONSTRAINT `itens_plano_viagem_atividadeId_fkey` FOREIGN KEY (`atividadeId`) REFERENCES `atividades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_plano_viagem` ADD CONSTRAINT `itens_plano_viagem_servicoTuristaId_fkey` FOREIGN KEY (`servicoTuristaId`) REFERENCES `servicos_turista`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
