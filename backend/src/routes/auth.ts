import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '@config/logger';
import { validateUsername, validatePassword, validateEmail, userRegistrationSchema } from '@utils/validators';
import { AppError } from '@middleware/errorHandler';

dotenv.config();
const router = Router();

// User storage (placeholder - replace with database)
const users: any[] = [];

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error, value } = userRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user exists
    const existingUser = users.find(u => u.username === value.username || u.email === value.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(value.password, 10);

    // Create user
    const newUser = {
      user_id: users.length + 1,
      ...value,
      password_hash: hashedPassword,
      is_active: true,
      created_at: new Date(),
    };

    users.push(newUser);
    logger.info('User registered successfully', { username: value.username });

    // Remove password from response
    const { password, password_hash, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  } catch (error: any) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and return JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    logger.info('User logged in', { username });

    res.json({
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token
 */
router.post('/refresh-token', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret') as any;
    const user = users.find(u => u.user_id === decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = jwt.sign(
      { userId: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );

    res.json({ accessToken });
  } catch (error: any) {
    logger.error('Token refresh error', { error: error.message });
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
