import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

// Mock user for demo (in real app, this would come from database)
const demoUser = {
  id: '1',
  email: 'demo@example.com',
  password: 'password', // In real app, this would be hashed
  firstName: 'Demo',
  lastName: 'User',
  role: 'contractor',
  company: 'Demo Company',
  phone: '+1-555-0123',
  avatar: null,
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if user exists (demo logic)
    if (email !== demoUser.email) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password (demo logic - in real app, use bcrypt.compare)
    if (password !== demoUser.password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: demoUser.id, 
        email: demoUser.email,
        role: demoUser.role 
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: demoUser.id },
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    // Update last login (in real app, update database)
    demoUser.lastLoginAt = new Date();

    // Prepare user data (remove password)
    const userData = {
      id: demoUser.id,
      email: demoUser.email,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      role: demoUser.role,
      company: demoUser.company,
      phone: demoUser.phone,
      avatar: demoUser.avatar,
      createdAt: demoUser.createdAt,
      updatedAt: demoUser.updatedAt
    };

    console.log('Login successful for:', email);

    res.json({
      success: true,
      data: {
        user: userData,
        token,
        refreshToken
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Register endpoint (placeholder)
router.post('/register', (req: Request, res: Response) => {
  res.status(501).json({ 
    success: false,
    error: 'Registration not implemented yet' 
  });
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  // In a real app, you might invalidate the token
  res.json({ 
    success: true,
    message: 'Logout successful' 
  });
});

// Refresh token endpoint (placeholder)
router.post('/refresh', (req: Request, res: Response) => {
  res.status(501).json({ 
    success: false,
    error: 'Token refresh not implemented yet' 
  });
});

export default router;