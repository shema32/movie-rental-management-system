import { Router, Request, Response } from 'express';
import { authenticate } from '@middleware/auth';
import { RentalService } from '@services/RentalService';
import logger from '@config/logger';

const router = Router();
const rentalService = new RentalService();

/**
 * @route POST /api/v1/rentals
 * @desc Create a new rental
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { movie_id, customer_id, rental_duration_days, payment_method } = req.body;

    if (!movie_id || !rental_duration_days || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const rentalData = {
      movie_id,
      customer_id,
      employee_id: (req as any).user.userId,
      rental_start_date: new Date(),
      rental_due_date: new Date(Date.now() + rental_duration_days * 24 * 60 * 60 * 1000),
      rental_duration_days,
      rental_price: 0, // Should be fetched from movie pricing
      payment_method,
    };

    const rental = await rentalService.createRental(rentalData);
    res.status(201).json(rental);
  } catch (error: any) {
    logger.error('Error creating rental', { error: error.message });
    res.status(500).json({ error: error.message || 'Failed to create rental' });
  }
});

/**
 * @route PUT /api/v1/rentals/:id/return
 * @desc Process rental return
 */
router.put('/:id/return', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { return_date } = req.body;

    const returnDate = return_date ? new Date(return_date) : new Date();
    const updated = await rentalService.processReturn(parseInt(id), returnDate);
    
    res.json(updated);
  } catch (error: any) {
    logger.error('Error processing return', { error: error.message });
    res.status(500).json({ error: 'Failed to process return' });
  }
});

/**
 * @route GET /api/v1/rentals/overdue
 * @desc Get overdue rentals (Admin/Employee only)
 */
router.get('/overdue', authenticate, async (req: Request, res: Response) => {
  try {
    const overdue = await rentalService.getOverdueRentals();
    res.json({ data: overdue });
  } catch (error: any) {
    logger.error('Error fetching overdue rentals', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch overdue rentals' });
  }
});

export default router;
