import aiService, { AIMessage } from './ai.service';

export class ExecutiveAssistant {
  private systemPrompt = `You are an AI Executive Assistant for a business leader. 
    Your role is to help with scheduling, task management, email drafting, meeting preparation, 
    and providing executive summaries. Be professional, concise, and actionable.`;

  async chat(userMessage: string, conversationHistory: AIMessage[] = []): Promise<string> {
    const messages: AIMessage[] = [
      { role: 'system', content: this.systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    return aiService.chat(messages);
  }

  async summarizeEmails(emails: any[]): Promise<string> {
    const emailsText = emails.map(e => `From: ${e.from}, Subject: ${e.subject}`).join('\n');
    return this.chat(`Provide a concise summary of these emails and highlight any urgent items:\n${emailsText}`);
  }

  async prioritizeTasks(tasks: any[]): Promise<any> {
    const tasksText = tasks.map(t => `- ${t.title}: ${t.description}`).join('\n');
    const response = await this.chat(
      `Analyze these tasks and suggest a priority order with reasoning:\n${tasksText}`
    );
    return { prioritization: response, timestamp: new Date() };
  }

  async draftEmail(context: string, tone: string = 'professional'): Promise<string> {
    return this.chat(`Draft an email with a ${tone} tone based on: ${context}`);
  }
}

export default new ExecutiveAssistant();
