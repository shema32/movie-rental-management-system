import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '@middleware/auth';
import { InventoryService } from '@services/InventoryService';
import logger from '@config/logger';

const router = Router();
const inventoryService = new InventoryService();

/**
 * @route GET /api/v1/inventory/:movieId
 * @desc Check inventory for a movie
 */
router.get('/:movieId', async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const available = await inventoryService.checkAvailability(parseInt(movieId));
    
    res.json({ movieId: parseInt(movieId), available_copies: available });
  } catch (error: any) {
    logger.error('Error checking inventory', { error: error.message });
    res.status(500).json({ error: 'Failed to check inventory' });
  }
});

/**
 * @route GET /api/v1/inventory/slow-moving
 * @desc Get slow-moving movies
 */
router.get('/analytics/slow-moving', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const slowMoving = await inventoryService.getSlowMovingMovies(parseInt(days as string));
    
    res.json({ data: slowMoving, period_days: parseInt(days as string) });
  } catch (error: any) {
    logger.error('Error fetching slow-moving movies', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch slow-moving movies' });
  }
});

/**
 * @route GET /api/v1/inventory/most-popular
 * @desc Get most popular movies
 */
router.get('/analytics/most-popular', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const popular = await inventoryService.getMostPopularMovies(parseInt(days as string));
    
    res.json({ data: popular, period_days: parseInt(days as string) });
  } catch (error: any) {
    logger.error('Error fetching popular movies', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

/**
 * @route PUT /api/v1/inventory/:movieId
 * @desc Update inventory (Admin only)
 */
router.put('/:movieId', authenticate, authorize('ADMIN', 'OWNER'), async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const { action, quantity } = req.body;

    if (!action || !quantity) {
      return res.status(400).json({ error: 'Action and quantity required' });
    }

    const updated = await inventoryService.updateInventory(
      parseInt(movieId),
      action,
      quantity
    );
    
    res.json(updated);
  } catch (error: any) {
    logger.error('Error updating inventory', { error: error.message });
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

export default router;
