import { Request, Response, NextFunction } from 'express';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../types/permissions';

// User type is already defined in auth.ts middleware
// No need to redeclare it here

/**
 * Middleware to check if user has a specific permission
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!hasPermission([req.user.role], permission)) {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!hasAnyPermission([req.user.role], permissions)) {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: 'any of: ' + permissions.join(', '),
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has ALL of the specified permissions
 */
export const requireAllPermissions = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!hasAllPermissions([req.user.role], permissions)) {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: 'all of: ' + permissions.join(', '),
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      message: 'Admin access required',
      userRole: req.user.role
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user is admin or executive
 */
export const requireExecutiveOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'executive') {
    res.status(403).json({ 
      message: 'Executive or Admin access required',
      userRole: req.user.role
    });
    return;
  }

  next();
};
