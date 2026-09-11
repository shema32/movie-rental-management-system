import { Router, Request, Response } from 'express';
import { authenticate } from '@middleware/auth';
import { SalesService } from '@services/SalesService';
import logger from '@config/logger';

const router = Router();
const salesService = new SalesService();

/**
 * @route POST /api/v1/sales
 * @desc Record a new sale
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { movie_id, quantity, customer_id, payment_method, is_translated_copy } = req.body;

    if (!movie_id || !quantity || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const saleData = {
      movie_id,
      customer_id,
      employee_id: (req as any).user.userId,
      quantity,
      unit_price: 0, // Should be fetched from movie pricing
      total_amount: 0,
      payment_method,
      is_translated_copy: is_translated_copy || false,
    };

    const sale = await salesService.recordSale(saleData);
    res.status(201).json(sale);
  } catch (error: any) {
    logger.error('Error recording sale', { error: error.message });
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

/**
 * @route GET /api/v1/sales
 * @desc Get sales with date range filter
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const sales = await salesService.getSalesByDate(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.json({ data: sales });
  } catch (error: any) {
    logger.error('Error fetching sales', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * @route GET /api/v1/sales/top-selling
 * @desc Get top selling movies
 */
router.get('/analytics/top-selling', authenticate, async (req: Request, res: Response) => {
  try {
    const { period = 'MONTH' } = req.query;
    const topSelling = await salesService.getTopSellingMovies(period as any);
    
    res.json({ data: topSelling, period });
  } catch (error: any) {
    logger.error('Error fetching top selling movies', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch top selling movies' });
  }
});

export default router;
