import { Router } from 'express';

const router = Router();

// Basic punchlist routes - we'll implement these later
router.get('/', (req, res) => {
  res.json({ message: 'Get punchlist items endpoint - coming soon', data: [] });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create punchlist item endpoint - coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get punchlist item ${req.params.id} endpoint - coming soon` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update punchlist item ${req.params.id} endpoint - coming soon` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete punchlist item ${req.params.id} endpoint - coming soon` });
});

router.post('/:id/photos', (req, res) => {
  res.json({ message: `Add photo to punchlist item ${req.params.id} endpoint - coming soon` });
});

router.post('/:id/notes', (req, res) => {
  res.json({ message: `Add note to punchlist item ${req.params.id} endpoint - coming soon` });
});

export default router;