import { Router } from 'express';

const router = Router();

// Basic user routes - we'll implement these later
router.get('/', (req, res) => {
  res.json({ message: 'Get users endpoint - coming soon', data: [] });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create user endpoint - coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get user ${req.params.id} endpoint - coming soon` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update user ${req.params.id} endpoint - coming soon` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete user ${req.params.id} endpoint - coming soon` });
});

router.get('/me/profile', (req, res) => {
  res.json({ message: 'Get current user profile endpoint - coming soon' });
});

export default router;