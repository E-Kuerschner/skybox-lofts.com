-- Custom SQL migration file, put your code below! --

-- Delete all existing board members
DELETE FROM board_members;

-- Seed 3 fixed board positions (vacant by default)
INSERT INTO board_members (role, name, user_id) VALUES
  ('President', NULL, NULL),
  ('Treasurer', NULL, NULL),
  ('Secretary', NULL, NULL);