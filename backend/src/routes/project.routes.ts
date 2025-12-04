import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  analyzeProject,
  getProjectTimeline,
  addTask,
  updateTask
} from '../controllers/project.controller';

const router = Router();
router.use(authenticate);

// Project CRUD
router.get('/', getAllProjects);
router.post('/', createProject);
router.get('/stats', getProjectStats);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project Analysis & Timeline
router.post('/:id/analyze', analyzeProject);
router.get('/:id/timeline', getProjectTimeline);

// Task Management
router.post('/:id/tasks', addTask);
router.put('/:id/tasks/:taskId', updateTask);

export default router;
