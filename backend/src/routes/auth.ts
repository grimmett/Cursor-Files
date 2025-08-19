import { Router } from 'express';

const router = Router();

// Basic auth routes - we'll implement these later
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - coming soon' });
});

router.post('/refresh', (req, res) => {
  res.json({ message: 'Refresh token endpoint - coming soon' });
});

export default router;