import { Router } from 'express';

const router = Router();

// Basic report routes - we'll implement these later
router.get('/', (req, res) => {
  res.json({ message: 'Get reports endpoint - coming soon', data: [] });
});

router.post('/', (req, res) => {
  res.json({ message: 'Generate report endpoint - coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get report ${req.params.id} endpoint - coming soon` });
});

router.get('/project/:projectId', (req, res) => {
  res.json({ message: `Get reports for project ${req.params.projectId} endpoint - coming soon` });
});

router.get('/export/:id', (req, res) => {
  res.json({ message: `Export report ${req.params.id} endpoint - coming soon` });
});

export default router;