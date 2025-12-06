import { Request, Response, NextFunction } from 'express';
import { Department } from '../models/User';
import User from '../models/User';

/**
 * Middleware to check if user has access to a specific department
 */
export const requireDepartmentAccess = (department: Department) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    try {
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Check if user has access to the department
      if (!user.hasDepartmentAccess(department)) {
        res.status(403).json({ 
          message: 'Access denied to this department',
          department,
          userDepartments: user.departments,
          userRoles: user.roles
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ message: 'Error checking department access', error: error.message });
    }
  };
};

/**
 * Middleware to check if user has access to ANY of the specified departments
 */
export const requireAnyDepartmentAccess = (departments: Department[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    try {
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Check if user has access to any of the departments
      const hasAccess = departments.some(dept => user.hasDepartmentAccess(dept));
      
      if (!hasAccess) {
        res.status(403).json({ 
          message: 'Access denied - no access to any of the required departments',
          requiredDepartments: departments,
          userDepartments: user.departments,
          userRoles: user.roles
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ message: 'Error checking department access', error: error.message });
    }
  };
};

/**
 * Middleware to filter results based on user's department access
 * Adds department filter to query for non-admin/executive users
 */
export const applyDepartmentFilter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Admins and executives can see everything
    if (user.isGlobalAdmin() || user.hasRole('executive' as any)) {
      next();
      return;
    }

    // Add department filter for other users
    req.query.departments = { $in: user.departments } as any;
    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Error applying department filter', error: error.message });
  }
};
