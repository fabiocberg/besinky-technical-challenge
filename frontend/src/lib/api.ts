import type { Task } from "@/types/task";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011";

type ApiErrorPayload = {
  message?: string | string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "A solicitação falhou.";

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = Array.isArray(payload.message)
        ? payload.message.join(", ")
        : payload.message || message;
    } catch {}

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    cache: "no-store",
  });

  return parseResponse<Task[]>(response);
}

export async function createTask(title: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return parseResponse<Task>(response);
}

export async function updateTaskStatus(
  id: number,
  isCompleted: boolean,
): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isCompleted }),
  });

  return parseResponse<Task>(response);
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  return parseResponse<void>(response);
}

export async function generateTasks(
  goal: string,
  apiKey: string,
): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/ai/generate-tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ goal, apiKey }),
  });

  return parseResponse<Task[]>(response);
}
