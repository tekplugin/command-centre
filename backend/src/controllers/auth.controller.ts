import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import Company from '../models/Company';
import { AppError } from '../middleware/errorHandler';

const generateToken = (userId: string, email: string, role: UserRole, companyId: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign({ userId, email, role, companyId }, secret, { expiresIn } as jwt.SignOptions);
};

const generateRefreshToken = (userId: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET not configured');
  }

  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, companyName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create company first
    const company = await Company.create({
      name: companyName,
      isActive: true,
    });

    // Create user as executive
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: UserRole.EXECUTIVE,
      companyId: company._id,
      isActive: true,
    });

    const token = generateToken(user._id.toString(), user.email, user.role, user.companyId.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString(), user.email, user.role, user.companyId.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new AppError('Refresh token secret not configured', 500);
    }

    const decoded = jwt.verify(refreshToken, secret) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const newToken = generateToken(user._id.toString(), user.email, user.role, user.companyId.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401));
    } else {
      next(error);
    }
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // In a production app, you'd want to blacklist the token
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};
