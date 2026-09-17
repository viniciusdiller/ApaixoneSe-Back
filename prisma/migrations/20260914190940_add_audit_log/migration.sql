-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `acao` ENUM('APROVAR', 'REJEITAR', 'EDITAR', 'EXCLUIR') NOT NULL,
    `recurso` VARCHAR(191) NOT NULL,
    `recursoId` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `detalhes` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `adminNome` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_adminId_idx`(`adminId`),
    INDEX `audit_logs_recurso_recursoId_idx`(`recurso`, `recursoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
