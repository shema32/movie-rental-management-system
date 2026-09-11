import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '@middleware/auth';
import { MovieService } from '@services/MovieService';
import logger from '@config/logger';

const router = Router();
const movieService = new MovieService();

/**
 * @route GET /api/v1/movies
 * @desc Get all movies with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, language, page = 1, limit = 20 } = req.query;
    
    const filters = {
      category: category ? parseInt(category as string) : undefined,
      language: language ? parseInt(language as string) : undefined,
    };

    const movies = await movieService.searchMovies(search as string || '', filters);
    
    res.json({
      data: movies,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: movies.length,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching movies', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

/**
 * @route GET /api/v1/movies/:id
 * @desc Get movie by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await movieService.getMovieDetails(parseInt(id));
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error: any) {
    logger.error('Error fetching movie', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

/**
 * @route POST /api/v1/movies
 * @desc Add new movie (Admin only)
 */
router.post('/', authenticate, authorize('ADMIN', 'OWNER'), async (req: Request, res: Response) => {
  try {
    const movieData = req.body;
    const newMovie = await movieService.addMovie(movieData);
    
    res.status(201).json(newMovie);
  } catch (error: any) {
    logger.error('Error creating movie', { error: error.message });
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

/**
 * @route PUT /api/v1/movies/:id
 * @desc Update movie (Admin only)
 */
router.put('/:id', authenticate, authorize('ADMIN', 'OWNER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movieData = req.body;
    const updatedMovie = await movieService.updateMovie(parseInt(id), movieData);
    
    res.json(updatedMovie);
  } catch (error: any) {
    logger.error('Error updating movie', { error: error.message });
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

/**
 * @route GET /api/v1/movies/category/:categoryId
 * @desc Get movies by category
 */
router.get('/category/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const movies = await movieService.getMoviesByCategory(parseInt(categoryId));
    
    res.json({ data: movies });
  } catch (error: any) {
    logger.error('Error fetching movies by category', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

export default router;
