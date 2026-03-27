import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  GenerateTasksInput,
  GeneratedTasksResult,
  TaskGenerationProvider,
} from '../contracts/task-generation.provider';

type OpenAiChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

@Injectable()
export class OpenAiTaskGenerationProvider implements TaskGenerationProvider {
  private readonly endpoint = 'https://api.openai.com/v1/chat/completions';
  private readonly timeoutInMs = 20000;
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  async generateTasks({
    goal,
    apiKey,
  }: GenerateTasksInput): Promise<GeneratedTasksResult> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.timeoutInMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'task_breakdown',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  tasks: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        title: {
                          type: 'string',
                          minLength: 1,
                          maxLength: 255,
                        },
                      },
                      required: ['title'],
                    },
                  },
                },
                required: ['tasks'],
              },
            },
          },
          messages: [
            {
              role: 'system',
              content:
                'You break a high-level goal into concise actionable tasks. Respond only with JSON matching the schema.',
            },
            {
              role: 'user',
              content: `Generate a practical to-do list for this goal: ${goal}`,
            },
          ],
        }),
        signal: abortController.signal,
      });

      if (response.status === 401) {
        throw new UnauthorizedException('Invalid OpenAI API key.');
      }

      if (!response.ok) {
        throw new BadGatewayException('OpenAI request failed.');
      }

      const payload = (await response.json()) as OpenAiChatCompletionResponse;
      const rawContent = payload.choices?.[0]?.message?.content;

      if (!rawContent) {
        throw new BadGatewayException('OpenAI returned an empty response.');
      }

      try {
        return JSON.parse(rawContent) as GeneratedTasksResult;
      } catch {
        throw new BadGatewayException('OpenAI returned invalid JSON.');
      }
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadGatewayException
      ) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new GatewayTimeoutException('OpenAI request timed out.');
      }

      throw new BadGatewayException('Failed to communicate with OpenAI.');
    } finally {
      clearTimeout(timeout);
    }
  }
}
