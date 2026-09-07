CREATE TABLE `contractor_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contractor_id` integer NOT NULL,
	`key` text NOT NULL,
	`content_type` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contractor_id`) REFERENCES `contractors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `contractor_photos_contractor_idx` ON `contractor_photos` (`contractor_id`);--> statement-breakpoint
CREATE TABLE `contractor_service_links` (
	`contractor_id` integer NOT NULL,
	`service_id` integer NOT NULL,
	PRIMARY KEY(`contractor_id`, `service_id`),
	FOREIGN KEY (`contractor_id`) REFERENCES `contractors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `contractor_services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `contractor_service_links_service_idx` ON `contractor_service_links` (`service_id`);--> statement-breakpoint
CREATE TABLE `contractor_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contractor_services_slug_unique` ON `contractor_services` (`slug`);--> statement-breakpoint
CREATE TABLE `contractors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`business_name` text NOT NULL,
	`contact_name` text,
	`address` text,
	`latitude` real,
	`longitude` real,
	`phone` text,
	`email` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
