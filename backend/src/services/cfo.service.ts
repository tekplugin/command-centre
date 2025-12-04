import aiService from './ai.service';

export class CFOService {
  async analyzeFinancials(data: {
    revenue: number;
    expenses: number;
    profit: number;
    cashFlow: number;
    period: string;
  }): Promise<any> {
    const analysis = await aiService.analyze(
      data,
      `Analyze these financial metrics and provide CFO-level insights, risks, and recommendations.`
    );

    return {
      analysis,
      metrics: this.calculateMetrics(data),
      recommendations: await this.generateRecommendations(data),
      timestamp: new Date(),
    };
  }

  private calculateMetrics(data: any) {
    const profitMargin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    const burnRate = data.expenses / 30; // Daily burn rate

    return {
      profitMargin: profitMargin.toFixed(2) + '%',
      burnRate: burnRate.toFixed(2),
      runway: data.cashFlow > 0 ? (data.cashFlow / burnRate).toFixed(0) + ' days' : 'N/A',
    };
  }

  async generateRecommendations(data: any): Promise<string[]> {
    const prompt = `Based on these financial metrics: ${JSON.stringify(data)}, 
      provide 3-5 specific, actionable recommendations for improving financial health.`;
    
    const response = await aiService.chat([
      { role: 'system', content: 'You are a CFO providing financial recommendations.' },
      { role: 'user', content: prompt },
    ]);

    // Parse recommendations from response
    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async forecastRevenue(historicalData: any[], periods: number): Promise<any> {
    const forecast = await aiService.analyze(
      historicalData,
      `Forecast revenue for the next ${periods} periods based on this historical data. 
       Provide specific numbers and confidence levels.`
    );

    return {
      forecast,
      dataPoints: historicalData.length,
      periods,
      timestamp: new Date(),
    };
  }

  async identifyAnomalies(transactions: any[]): Promise<any> {
    const analysis = await aiService.analyze(
      transactions,
      'Identify any unusual patterns, anomalies, or potential issues in these transactions.'
    );

    return {
      anomalies: analysis,
      reviewRequired: transactions.length,
      timestamp: new Date(),
    };
  }
}

export default new CFOService();
