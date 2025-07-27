-- 修改Posts表的image_url字段为LONGTEXT类型
ALTER TABLE Posts MODIFY COLUMN image_url LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 验证修改
DESCRIBE Posts; 