import { Request, Response } from 'express';
import Project from '../models/Project';
import projectManagerService from '../services/project-manager.service';
import { logger } from '../utils/logger';
import { UserRole } from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * @route GET /api/v1/projects
 * @desc Get all projects for the company
 */
export const getAllProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;
    const { status, sortBy = 'deadline', order = 'asc' } = req.query;

    const query: any = { companyId };
    if (status) query.status = status;

    const sortOrder = order === 'desc' ? -1 : 1;
    const projects = await Project.find(query)
      .sort({ [sortBy as string]: sortOrder })
      .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
};

/**
 * @route GET /api/v1/projects/:id
 * @desc Get single project by ID
 */
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const project = await Project.findOne({ _id: id, companyId })
      .populate('createdBy', 'firstName lastName email');

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
};

/**
 * @route POST /api/v1/projects
 * @desc Create new project
 */
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, companyId } = req.user!;
    const projectData = {
      ...req.body,
      createdBy: userId,
      companyId,
      startDate: req.body.startDate || new Date()
    };

    const project = await Project.create(projectData);

    logger.info('Project created:', {
      projectId: project._id,
      name: project.name,
      userId
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('Error creating project:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create project'
    });
  }
};

/**
 * @route PUT /api/v1/projects/:id
 * @desc Update project
 */
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const project = await Project.findOne({ _id: id, companyId });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    // Update fields
    Object.assign(project, req.body);
    
    // Recalculate progress if tasks updated
    if (req.body.tasksCompleted !== undefined || req.body.totalTasks !== undefined) {
      if (project.totalTasks > 0) {
        project.progress = Math.round((project.tasksCompleted / project.totalTasks) * 100);
      }
    }

    await project.save();

    logger.info('Project updated:', {
      projectId: project._id,
      name: project.name
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('Error updating project:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update project'
    });
  }
};

/**
 * @route DELETE /api/v1/projects/:id
 * @desc Delete project
 */
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const project = await Project.findOneAndDelete({ _id: id, companyId });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    logger.info('Project deleted:', {
      projectId: project._id,
      name: project.name
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
};

/**
 * @route GET /api/v1/projects/stats
 * @desc Get project statistics
 */
export const getProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;

    const stats = await Project.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const totalProjects = await Project.countDocuments({ companyId });
    const activeProjects = await Project.countDocuments({ 
      companyId, 
      status: { $ne: 'completed' } 
    });

    res.json({
      success: true,
      data: {
        total: totalProjects,
        active: activeProjects,
        byStatus: stats,
        completed: totalProjects - activeProjects
      }
    });
  } catch (error) {
    logger.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project statistics'
    });
  }
};

/**
 * @route POST /api/v1/projects/:id/analyze
 * @desc Analyze project with AI
 */
export const analyzeProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const project = await Project.findOne({ _id: id, companyId });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    const analysis = await projectManagerService.analyzeProject({
      name: project.name,
      deadline: project.deadline,
      completedTasks: project.tasksCompleted,
      totalTasks: project.totalTasks,
      progress: project.progress,
      status: project.status
    });

    // Update project with AI insights
    project.risks = analysis.risks;
    project.recommendations = analysis.recommendations;
    await project.save();

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Error analyzing project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze project'
    });
  }
};

/**
 * @route GET /api/v1/projects/:id/timeline
 * @desc Get project timeline
 */
export const getProjectTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const project = await Project.findOne({ _id: id, companyId });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    const timeline = {
      projectId: project._id,
      name: project.name,
      startDate: project.startDate,
      deadline: project.deadline,
      progress: project.progress,
      milestones: project.milestones,
      daysRemaining: Math.ceil((project.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    logger.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project timeline'
    });
  }
};

/**
 * @route POST /api/v1/projects/:id/tasks
 * @desc Add task to project
 */
export const addTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const project = await Project.findOne({ _id: id, companyId });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    const task = {
      id: `task_${Date.now()}`,
      ...req.body
    };

    project.tasks.push(task);
    project.totalTasks = project.tasks.length;
    if (project.totalTasks > 0) {
      project.progress = Math.round((project.tasksCompleted / project.totalTasks) * 100);
    }
    await project.save();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Error adding task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add task'
    });
  }
};

/**
 * @route PUT /api/v1/projects/:id/tasks/:taskId
 * @desc Update task in project
 */
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const { companyId } = req.user!;

    const project = await Project.findOne({ _id: id, companyId });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    const task = project.tasks.find(t => t.id === taskId);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    // Update task properties
    Object.assign(task, req.body);
    
    // If isCompleted is toggled, update status
    if (req.body.isCompleted !== undefined) {
      task.status = req.body.isCompleted ? 'completed' : 'pending';
    }
    
    // Update completed tasks count based on isCompleted checkbox
    project.tasksCompleted = project.tasks.filter(t => t.isCompleted === true).length;
    
    // Recalculate progress
    if (project.totalTasks > 0) {
      project.progress = Math.round((project.tasksCompleted / project.totalTasks) * 100);
    }
    
    await project.save();

    res.json({
      success: true,
      data: {
        task,
        progress: project.progress,
        tasksCompleted: project.tasksCompleted
      }
    });
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
};
