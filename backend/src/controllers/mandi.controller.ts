import { Request, Response } from 'express';
import { fetchLiveMandiPrices } from '../services/mandi.service';

/**
 * GET /api/mandi/prices
 * Query params: commodity, state, district, limit, offset
 */
export const getMandiPrices = async (req: Request, res: Response) => {
  const commodity = req.query.commodity ? String(req.query.commodity) : undefined;
  const state = req.query.state ? String(req.query.state) : undefined;
  const district = req.query.district ? String(req.query.district) : undefined;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
  const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : 0;

  try {
    const result = await fetchLiveMandiPrices({
      commodity,
      state,
      district,
      limit,
      offset
    });

    if (!result.available) {
      // 200 with available: false and explicit error message so frontend shows the exact required notice
      return res.status(200).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[MandiController] Error getting prices:', error);
    return res.status(200).json({
      success: false,
      available: false,
      error: 'Government mandi feed unavailable',
      message: 'Government mandi feed unavailable: internal service error',
      resourceId: '9ef84268-d588-465a-a308-a864a43d0070',
      records: []
    });
  }
};
