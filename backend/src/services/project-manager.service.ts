import aiService from './ai.service';

export class ProjectManagerService {
  async analyzeProject(projectData: any): Promise<any> {
    const analysis = await aiService.analyze(
      projectData,
      'Analyze this project status, identify risks, blockers, and provide recommendations.'
    );

    return {
      analysis,
      health: this.assessProjectHealth(projectData),
      risks: await this.identifyRisks(projectData),
      recommendations: await this.generateRecommendations(projectData),
      timestamp: new Date(),
    };
  }

  private assessProjectHealth(data: any): string {
    const completionRate = data.completedTasks / data.totalTasks;
    const isOnTime = new Date(data.deadline) > new Date();

    if (completionRate > 0.8 && isOnTime) return 'Healthy';
    if (completionRate > 0.5 && isOnTime) return 'On Track';
    if (completionRate > 0.3) return 'At Risk';
    return 'Critical';
  }

  async identifyRisks(projectData: any): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are a project manager identifying project risks.' },
      { role: 'user', content: `Identify risks in this project: ${JSON.stringify(projectData)}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async generateRecommendations(data: any): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are a project manager providing actionable recommendations.' },
      { role: 'user', content: `Suggest improvements for: ${JSON.stringify(data)}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async optimizeSchedule(tasks: any[], resources: any[]): Promise<any> {
    const optimization = await aiService.analyze(
      { tasks, resources },
      'Optimize task scheduling and resource allocation for maximum efficiency.'
    );

    return {
      optimizedSchedule: optimization,
      tasksAnalyzed: tasks.length,
      resourcesAvailable: resources.length,
      timestamp: new Date(),
    };
  }

  async generateProjectPlan(requirements: any): Promise<string> {
    return aiService.chat([
      { role: 'system', content: 'You are a project manager creating detailed project plans.' },
      {
        role: 'user',
        content: `Create a project plan for: ${JSON.stringify(requirements)}`,
      },
    ]);
  }

  async estimateDuration(tasks: any[]): Promise<any> {
    const estimation = await aiService.analyze(
      tasks,
      'Estimate realistic duration for these tasks considering dependencies and complexity.'
    );

    return {
      estimation,
      tasksCount: tasks.length,
      timestamp: new Date(),
    };
  }

  async suggestMilestones(projectGoals: string): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are a project manager defining project milestones.' },
      { role: 'user', content: `Suggest key milestones for: ${projectGoals}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }
}

export default new ProjectManagerService();
