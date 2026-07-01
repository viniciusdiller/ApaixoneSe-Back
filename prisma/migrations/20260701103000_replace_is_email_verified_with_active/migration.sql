-- AddColumn
ALTER TABLE `usuarios`
ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT false;

-- MigrateData
UPDATE `usuarios`
SET `active` = `isEmailVerified`;

-- DropColumn
ALTER TABLE `usuarios`
DROP COLUMN `isEmailVerified`;
