import logger from '@config/logger';
import { AppError } from '@middleware/errorHandler';
import { InventoryService } from './InventoryService';

interface RentalData {
  rental_id?: number;
  movie_id: number;
  customer_id?: number;
  employee_id: number;
  rental_start_date: Date;
  rental_due_date: Date;
  rental_duration_days: number;
  rental_price: number;
  payment_method: 'CASH' | 'MOBILE_MONEY';
}

export class RentalService {
  private inventoryService = new InventoryService();

  async createRental(rentalData: RentalData): Promise<RentalData> {
    try {
      logger.info('Creating rental', { movieId: rentalData.movie_id });

      // Check availability
      const available = await this.inventoryService.checkAvailability(rentalData.movie_id);
      if (available <= 0) {
        throw new AppError(400, 'Movie not available for rental');
      }

      // Create rental record
      // const rental = await RentalRepository.create(rentalData);

      // Update inventory
      await this.inventoryService.updateInventory(rentalData.movie_id, 'RENT', 1);

      // return rental; // Placeholder
      return rentalData;
    } catch (error) {
      logger.error('Error creating rental', { error });
      throw error;
    }
  }

  async processReturn(rentalId: number, returnDate: Date): Promise<any> {
    try {
      logger.info('Processing rental return', { rentalId });
      // Fetch rental record
      // const rental = await RentalRepository.findById(rentalId);
      // Calculate late fee if applicable
      // const lateFee = this.calculateLateFee(rental, returnDate);
      // Update rental status
      // const updated = await RentalRepository.update(rentalId, { actual_return_date: returnDate, late_fee: lateFee });
      // return updated;
      return {}; // Placeholder
    } catch (error) {
      logger.error('Error processing return', { error });
      throw new AppError(500, 'Failed to process return');
    }
  }

  calculateLateFee(dueDate: Date, returnDate: Date, dailyRate: number): number {
    const daysLate = Math.max(0, Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    return daysLate * dailyRate;
  }

  async getOverdueRentals(): Promise<any[]> {
    try {
      logger.info('Fetching overdue rentals');
      // const overdue = await RentalRepository.findOverdue();
      // return overdue;
      return []; // Placeholder
    } catch (error) {
      logger.error('Error fetching overdue rentals', { error });
      throw new AppError(500, 'Failed to fetch overdue rentals');
    }
  }
}
