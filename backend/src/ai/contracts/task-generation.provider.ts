export interface GeneratedTaskPayload {
  title: string;
}

export interface GeneratedTasksResult {
  tasks: GeneratedTaskPayload[];
}

export interface GenerateTasksInput {
  goal: string;
  apiKey: string;
}

export interface TaskGenerationProvider {
  generateTasks(input: GenerateTasksInput): Promise<GeneratedTasksResult>;
}

export const TASK_GENERATION_PROVIDER = 'TASK_GENERATION_PROVIDER';
