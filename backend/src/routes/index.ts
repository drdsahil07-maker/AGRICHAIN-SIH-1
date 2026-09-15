import { Router } from 'express';

import healthRoutes from './health.routes';
import harvestRoutes from './harvest.routes';
import chainRoutes from './chain.routes';
import poolRoutes from './pool.routes';
import transportRoutes from './transport.routes';
import buyerRoutes from './buyer.routes';
import qualityRoutes from './quality.routes';
import voiceRoutes from './voice.routes';
import callsRoutes from './calls.routes';
import adminRoutes from './admin.routes';
import offerRoutes from "./offer.routes";
import serviceProviderRoutes from './serviceProvider.routes';
import priceRoutes from './price.routes';
import governmentRoutes from './government.routes';
import orderRoutes from './order.routes';
import mandiRoutes from './mandi.routes';
import { getMandiPrices } from '../controllers/mandi.controller';

const router = Router();

router.use('/health', healthRoutes);
router.use('/harvests', harvestRoutes);
router.use('/chain', chainRoutes);
router.use('/pools', poolRoutes);
router.use('/transporters', transportRoutes);
router.use('/buyers', buyerRoutes);
router.use('/quality', qualityRoutes);
router.use("/offers", offerRoutes);
router.use('/voice', voiceRoutes);
router.use('/calls', callsRoutes);
router.use('/dashboard/admin', adminRoutes);
router.use('/service-providers', serviceProviderRoutes);
router.use('/prices', priceRoutes);
router.use('/government', governmentRoutes);
router.use('/orders', orderRoutes);
router.use('/mandi', mandiRoutes);
router.get('/mandi-prices', getMandiPrices);

export default router;
