import aiService from './ai.service';

export class SalesService {
  async analyzePipeline(deals: any[]): Promise<any> {
    const analysis = await aiService.analyze(
      deals,
      'Analyze the sales pipeline and provide insights on deal health, conversion probabilities, and recommendations.'
    );

    return {
      analysis,
      totalDeals: deals.length,
      pipelineValue: this.calculatePipelineValue(deals),
      insights: await this.generateInsights(deals),
      timestamp: new Date(),
    };
  }

  private calculatePipelineValue(deals: any[]): number {
    return deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  }

  async generateInsights(deals: any[]): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are a sales expert analyzing pipeline data.' },
      { role: 'user', content: `Provide actionable sales insights: ${JSON.stringify(deals)}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async scoreLeads(leads: any[]): Promise<any> {
    const scoring = await aiService.analyze(
      leads,
      'Score these leads based on conversion potential and provide reasoning for each score.'
    );

    return {
      scoring,
      leadsAnalyzed: leads.length,
      timestamp: new Date(),
    };
  }

  async generateSalesStrategy(marketData: any): Promise<string> {
    return aiService.chat([
      { role: 'system', content: 'You are a sales strategist providing data-driven recommendations.' },
      {
        role: 'user',
        content: `Create a sales strategy based on: ${JSON.stringify(marketData)}`,
      },
    ]);
  }

  async predictChurn(customerData: any[]): Promise<any> {
    const prediction = await aiService.analyze(
      customerData,
      'Predict customer churn risk and suggest retention strategies.'
    );

    return {
      prediction,
      customersAnalyzed: customerData.length,
      timestamp: new Date(),
    };
  }

  async draftSalesEmail(context: string, customerInfo: any): Promise<string> {
    return aiService.chat([
      { role: 'system', content: 'You are a sales professional writing persuasive emails.' },
      {
        role: 'user',
        content: `Draft a sales email for: ${context}\nCustomer: ${JSON.stringify(customerInfo)}`,
      },
    ]);
  }
}

export default new SalesService();
