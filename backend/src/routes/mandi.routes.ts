import { Router } from 'express';
import { getMandiPrices } from '../controllers/mandi.controller';

const router = Router();

// GET /api/mandi/prices and GET /api/mandi
router.get('/prices', getMandiPrices);
router.get('/', getMandiPrices);

export default router;
