import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private model: string;

  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  async chat(messages: AIMessage[]): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async analyze(data: any, prompt: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analyst providing insights and recommendations.',
          },
          {
            role: 'user',
            content: `${prompt}\n\nData: ${JSON.stringify(data)}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      return completion.choices[0]?.message?.content || 'No analysis generated';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to analyze data');
    }
  }

  async generateInsights(context: string, dataType: string): Promise<any> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in ${dataType} analysis for executives.`,
          },
          {
            role: 'user',
            content: `Provide key insights and actionable recommendations based on: ${context}`,
          },
        ],
        temperature: 0.6,
        max_tokens: 1200,
      });

      return {
        insights: completion.choices[0]?.message?.content,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate insights');
    }
  }
}

export default new AIService();
