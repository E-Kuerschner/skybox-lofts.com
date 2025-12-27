-- Recreate board_members table with proper foreign key constraint
-- Data will be seeded in the next migration

DROP TABLE IF EXISTS `board_members`;--> statement-breakpoint
CREATE TABLE `board_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`role` text NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
