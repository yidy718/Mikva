-- Find user by email and make them admin
UPDATE user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id
  FROM auth.users
  WHERE email = 'yidy@pm.me'
  LIMIT 1
);

-- Verify the change
SELECT u.email, ur.role
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'yidy@pm.me';
