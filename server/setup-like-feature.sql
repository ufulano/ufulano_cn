-- 点赞功能数据库初始化脚本
-- 用于创建和优化点赞相关的数据库结构

-- 创建点赞表（如果不存在）
CREATE TABLE IF NOT EXISTS `Likes` (
  `like_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '点赞记录ID',
  `user_id` BIGINT NOT NULL COMMENT '点赞用户ID',
  `post_id` BIGINT NOT NULL COMMENT '被点赞帖子ID',
  `like_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`like_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_like_time` (`like_time`),
  UNIQUE INDEX `unique_user_post_like` (`user_id`, `post_id`),
  CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_post` FOREIGN KEY (`post_id`) REFERENCES `Posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='点赞记录表';

-- 为Posts表添加点赞相关字段（如果不存在）
ALTER TABLE `Posts` 
ADD COLUMN IF NOT EXISTS `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数' AFTER `comment_count`;

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS `idx_posts_like_count` ON `Posts` (`like_count`);

-- 初始化现有帖子的点赞数（如果like_count为NULL或0）
UPDATE `Posts` 
SET `like_count` = (
  SELECT COUNT(*) 
  FROM `Likes` 
  WHERE `Likes`.`post_id` = `Posts`.`post_id`
)
WHERE `like_count` IS NULL OR `like_count` = 0;

-- 显示表结构信息
SHOW CREATE TABLE `Likes`;

-- 显示Posts表的点赞相关字段
SHOW COLUMNS FROM `Posts` LIKE '%like%';

-- 显示索引信息
SHOW INDEX FROM `Likes`;
SHOW INDEX FROM `Posts` WHERE Key_name LIKE '%like%';
