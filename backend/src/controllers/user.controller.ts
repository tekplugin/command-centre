import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';

/**
 * Get all users in the company
 */
export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await User.find({ companyId: req.user?.companyId })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId
    }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

/**
 * Create new user
 */
export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, firstName, lastName, roles, departments, phoneNumber, basicSalary, housingAllowance, transportAllowance, otherAllowances } = req.body;
    // Validate roles
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: 'At least one role is required' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      roles: roles || [UserRole.STAFF],
      departments: departments || [],
      companyId: req.user?.companyId,
      phoneNumber,
      isActive: true
    });
    // Auto-add to master payroll and current month payroll
    const Payroll = require('../models/Payroll').default;
    const companyId = req.user?.companyId;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const employeeData = {
      employeeId: user._id,
      name: `${firstName} ${lastName}`,
      department: departments?.[0] || '',
      position: roles?.[0] || '',
      basicSalary: basicSalary || 0,
      housingAllowance: housingAllowance || 0,
      transportAllowance: transportAllowance || 0,
      otherAllowances: otherAllowances || 0,
      startDate: now
    };
    // Add to master payroll
    const masterPayroll = await Payroll.findOne({ companyId, status: 'master' });
    if (masterPayroll) {
      masterPayroll.employees.push(employeeData);
      await masterPayroll.save();
    }
    // Add to current month payroll
    const currentPayroll = await Payroll.findOne({ companyId, month, year });
    if (currentPayroll) {
      currentPayroll.employees.push(employeeData);
      await currentPayroll.save();
    }
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { firstName, lastName, phoneNumber, roles, departments, isActive } = req.body;
    
    const user = await User.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (roles && Array.isArray(roles)) user.roles = roles;
    if (departments && Array.isArray(departments)) user.departments = departments;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

/**
 * Delete user (soft delete by setting isActive to false)
 */
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting yourself
    if (user._id.toString() === req.user?.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

/**
 * Change user role
 */
export const changeUserRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { roles, departments } = req.body;
    
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: 'At least one role is required' });
    }
    
    const user = await User.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent changing your own role
    if (user._id.toString() === req.user?.userId) {
      return res.status(400).json({ message: 'You cannot change your own roles' });
    }
    
    user.roles = roles;
    if (departments && Array.isArray(departments)) {
      user.departments = departments;
    }
    await user.save();
    
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    
    res.json({
      success: true,
      message: 'User roles and departments updated successfully',
      user: userResponse
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error changing user roles', error: error.message });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const totalUsers = await User.countDocuments({ companyId });
    const activeUsers = await User.countDocuments({ companyId, isActive: true });
    const inactiveUsers = totalUsers - activeUsers;
    
    const roleStats = await User.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: roleStats
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};
