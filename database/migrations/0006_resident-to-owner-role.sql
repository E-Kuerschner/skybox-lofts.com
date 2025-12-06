-- Custom SQL migration file, put your code below! --

-- Update all users with role 'resident' to 'owner'
UPDATE users SET role = 'owner' WHERE role = 'resident';