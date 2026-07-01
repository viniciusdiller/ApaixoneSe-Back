SET @old_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'usuarios'
    AND COLUMN_NAME = 'isEmailVerified'
);

SET @drop_old_sql := IF(
  @old_exists = 1,
  'ALTER TABLE `usuarios` DROP COLUMN `isEmailVerified`',
  'SELECT 1'
);

PREPARE drop_old_stmt FROM @drop_old_sql;
EXECUTE drop_old_stmt;
DEALLOCATE PREPARE drop_old_stmt;
