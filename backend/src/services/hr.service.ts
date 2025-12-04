import aiService from './ai.service';

export class HRService {
  async analyzeTeamPerformance(employeeData: any[]): Promise<any> {
    const analysis = await aiService.analyze(
      employeeData,
      'Analyze team performance metrics and provide insights on productivity, engagement, and areas for improvement.'
    );

    return {
      analysis,
      teamSize: employeeData.length,
      insights: await this.generateInsights(employeeData),
      timestamp: new Date(),
    };
  }

  async generateInsights(data: any[]): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are an HR expert providing people management insights.' },
      { role: 'user', content: `Provide key HR insights from this data: ${JSON.stringify(data)}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async suggestTraining(employeeSkills: any): Promise<any> {
    const suggestions = await aiService.analyze(
      employeeSkills,
      'Suggest relevant training programs and skill development opportunities.'
    );

    return {
      suggestions,
      timestamp: new Date(),
    };
  }

  async analyzeAttritionRisk(employeeMetrics: any[]): Promise<any> {
    const analysis = await aiService.analyze(
      employeeMetrics,
      'Analyze attrition risk factors and identify employees who may be at risk of leaving.'
    );

    return {
      riskAnalysis: analysis,
      employeesAnalyzed: employeeMetrics.length,
      timestamp: new Date(),
    };
  }

  async generateJobDescription(role: string, requirements: any): Promise<string> {
    return aiService.chat([
      { role: 'system', content: 'You are an HR professional creating job descriptions.' },
      {
        role: 'user',
        content: `Create a compelling job description for: ${role}\nRequirements: ${JSON.stringify(requirements)}`,
      },
    ]);
  }
}

export default new HRService();
