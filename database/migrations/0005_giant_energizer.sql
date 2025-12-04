-- Add columns as nullable first
ALTER TABLE `users` ADD `first_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_name` text;--> statement-breakpoint

-- Split existing names on first space
UPDATE `users`
SET
  `first_name` = CASE
    WHEN instr(`name`, ' ') > 0 THEN substr(`name`, 1, instr(`name`, ' ') - 1)
    ELSE `name`
  END,
  `last_name` = CASE
    WHEN instr(`name`, ' ') > 0 THEN substr(`name`, instr(`name`, ' ') + 1)
    ELSE ''
  END
WHERE `first_name` IS NULL OR `last_name` IS NULL;