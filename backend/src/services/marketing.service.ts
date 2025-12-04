import aiService from './ai.service';

export class MarketingService {
  async analyzeCampaign(campaignData: any): Promise<any> {
    const analysis = await aiService.analyze(
      campaignData,
      'Analyze this marketing campaign performance and provide insights on ROI, engagement, and optimization opportunities.'
    );

    return {
      analysis,
      metrics: this.calculateMetrics(campaignData),
      recommendations: await this.generateRecommendations(campaignData),
      timestamp: new Date(),
    };
  }

  private calculateMetrics(data: any) {
    const roi = data.revenue && data.cost ? ((data.revenue - data.cost) / data.cost) * 100 : 0;
    const ctr = data.clicks && data.impressions ? (data.clicks / data.impressions) * 100 : 0;
    const conversionRate = data.conversions && data.clicks ? (data.conversions / data.clicks) * 100 : 0;

    return {
      roi: roi.toFixed(2) + '%',
      ctr: ctr.toFixed(2) + '%',
      conversionRate: conversionRate.toFixed(2) + '%',
      cpa: data.conversions > 0 ? (data.cost / data.conversions).toFixed(2) : 'N/A',
    };
  }

  async generateRecommendations(data: any): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are a marketing expert providing campaign optimization advice.' },
      { role: 'user', content: `Suggest improvements for: ${JSON.stringify(data)}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async generateContent(contentType: string, brief: string): Promise<string> {
    return aiService.chat([
      { role: 'system', content: 'You are a creative marketing content writer.' },
      {
        role: 'user',
        content: `Create ${contentType} content based on: ${brief}`,
      },
    ]);
  }

  async analyzeSocialMedia(socialData: any[]): Promise<any> {
    const analysis = await aiService.analyze(
      socialData,
      'Analyze social media performance and provide insights on engagement, reach, and content strategy.'
    );

    return {
      analysis,
      platforms: socialData.length,
      insights: await this.generateInsights(socialData),
      timestamp: new Date(),
    };
  }

  async generateInsights(data: any[]): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are a social media expert analyzing performance data.' },
      { role: 'user', content: `Provide social media insights: ${JSON.stringify(data)}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async suggestAudience(productInfo: any): Promise<any> {
    const suggestions = await aiService.analyze(
      productInfo,
      'Suggest target audience segments and marketing strategies for this product.'
    );

    return {
      audienceSuggestions: suggestions,
      timestamp: new Date(),
    };
  }

  async generateCampaignIdeas(businessGoals: string): Promise<string[]> {
    const response = await aiService.chat([
      { role: 'system', content: 'You are a marketing strategist generating campaign ideas.' },
      { role: 'user', content: `Generate creative campaign ideas for: ${businessGoals}` },
    ]);

    return response.split('\n').filter(line => line.trim().length > 0);
  }
}

export default new MarketingService();
