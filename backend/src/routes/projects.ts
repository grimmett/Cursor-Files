import { Router } from 'express';

const router = Router();

// Basic project routes - we'll implement these later
router.get('/', (req, res) => {
  res.json({ message: 'Get projects endpoint - coming soon', data: [] });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create project endpoint - coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get project ${req.params.id} endpoint - coming soon` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update project ${req.params.id} endpoint - coming soon` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete project ${req.params.id} endpoint - coming soon` });
});

export default router;