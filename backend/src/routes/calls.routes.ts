import { Router, Response } from 'express';
import { simulateCall } from '../controllers/voice.controller';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { SEED_CALL_RECORDS } from '../../../shared/data/callRecords';

const router = Router();

// Simulation endpoint (used by voice assistant tester)
router.post('/simulate', simulateCall);

// Secure endpoints: ONLY government_admin can inspect call records & complaints
router.get('/', requireAuth, requireRole('government_admin'), (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: SEED_CALL_RECORDS
  });
});

router.get('/records', requireAuth, requireRole('government_admin'), (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: SEED_CALL_RECORDS
  });
});

router.get('/:id', requireAuth, requireRole('government_admin'), (req: AuthRequest, res: Response) => {
  const record = SEED_CALL_RECORDS.find(r => r.id === req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Call record not found' });
  }
  res.json({
    success: true,
    data: record
  });
});

export default router;
