import { Router } from 'express';
import { processVoice, simulateCall } from '../controllers/voice.controller';

const router = Router();
router.post('/process', processVoice);
// The old route was app.post("/api/calls/simulate"), so I'll mount this router at /api
// But wait, it's better to put simulate call under /api/calls in the main router, 
// or I can just map it properly.
// Let's just create a calls.routes.ts for clarity.
export default router;
