-- 创建转发表
-- 用于记录用户转发帖子的关系

CREATE TABLE IF NOT EXISTS `Reposts` (
  `repost_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '转发记录ID',
  `user_id` BIGINT NOT NULL COMMENT '转发用户ID',
  `original_post_id` BIGINT NOT NULL COMMENT '原帖ID',
  `repost_content` TEXT NULL COMMENT '转发时添加的内容',
  `repost_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '转发时间',
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0:未删除 1:已删除',
  PRIMARY KEY (`repost_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_original_post_id` (`original_post_id`),
  INDEX `idx_repost_time` (`repost_time`),
  INDEX `idx_user_original` (`user_id`, `original_post_id`),
  CONSTRAINT `fk_repost_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_repost_original_post` FOREIGN KEY (`original_post_id`) REFERENCES `Posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='转发记录表';

-- 为Posts表添加转发相关字段（如果不存在）
ALTER TABLE `Posts` 
ADD COLUMN IF NOT EXISTS `repost_id` BIGINT NULL COMMENT '转发的原推文ID' AFTER `is_deleted`,
ADD COLUMN IF NOT EXISTS `repost_count` INT NOT NULL DEFAULT 0 COMMENT '转发数' AFTER `repost_id`;

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS `idx_posts_repost_id` ON `Posts` (`repost_id`);
CREATE INDEX IF NOT EXISTS `idx_posts_repost_count` ON `Posts` (`repost_count`);

