SET @active_exists := (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'usuarios'
		AND COLUMN_NAME = 'active'
);

SET @add_active_sql := IF(
	@active_exists = 0,
	'ALTER TABLE `usuarios` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT false',
	'SELECT 1'
);

PREPARE add_active_stmt FROM @add_active_sql;
EXECUTE add_active_stmt;
DEALLOCATE PREPARE add_active_stmt;

SET @old_exists := (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'usuarios'
		AND COLUMN_NAME = 'isEmailVerified'
);

SET @sync_sql := IF(
	@old_exists = 1,
	'UPDATE `usuarios` SET `active` = `isEmailVerified` WHERE `active` = false',
	'SELECT 1'
);

PREPARE sync_stmt FROM @sync_sql;
EXECUTE sync_stmt;
DEALLOCATE PREPARE sync_stmt;
