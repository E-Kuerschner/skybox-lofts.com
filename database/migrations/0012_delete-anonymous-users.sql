-- Custom SQL migration file, put your code below! --
-- Anonymous (site password) sign-in has been removed. Delete the temporary
-- users it created before 0013 drops the is_anonymous column. Their sessions,
-- accounts and board positions are removed by ON DELETE CASCADE, and any
-- activity log entries keep their history with user_id set to null.
DELETE FROM `users` WHERE `is_anonymous` = 1;
