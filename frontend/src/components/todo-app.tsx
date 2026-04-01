"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createTask,
  deleteTask,
  fetchTasks,
  generateTasks,
  updateTaskStatus,
} from "@/lib/api";
import type { Task } from "@/types/task";
import styles from "./todo-app.module.css";

type Notice = {
  tone: "success" | "error";
  text: string;
};

export function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [manualTitle, setManualTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmittingTask, startSubmittingTask] = useTransition();
  const [isGeneratingTasks, startGeneratingTasks] = useTransition();
  const [busyTaskIds, setBusyTaskIds] = useState<number[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    void loadTasks();
  }, []);

  async function loadTasks() {
    setInitialLoading(true);

    try {
      const nextTasks = await fetchTasks();
      setTasks(nextTasks);
    } catch (error) {
      setNotice({
        tone: "error",
        text: getErrorMessage(error, "Nao foi possivel carregar as tarefas."),
      });
    } finally {
      setInitialLoading(false);
    }
  }

  function withBusyTask(id: number, action: () => Promise<void>) {
    setBusyTaskIds((current) => [...current, id]);

    void action().finally(() => {
      setBusyTaskIds((current) => current.filter((item) => item !== id));
    });
  }

  function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = manualTitle.trim();

    if (!nextTitle) {
      setNotice({ tone: "error", text: "Informe um titulo para a tarefa." });
      return;
    }

    startSubmittingTask(async () => {
      try {
        const createdTask = await createTask(nextTitle);
        setTasks((current) => [createdTask, ...current]);
        setManualTitle("");
        setNotice({ tone: "success", text: "Tarefa criada com sucesso." });
      } catch (error) {
        setNotice({
          tone: "error",
          text: getErrorMessage(error, "Nao foi possivel criar a tarefa."),
        });
      }
    });
  }

  function handleToggleTask(task: Task) {
    withBusyTask(task.id, async () => {
      try {
        const updatedTask = await updateTaskStatus(task.id, !task.isCompleted);
        setTasks((current) =>
          current.map((item) => (item.id === task.id ? updatedTask : item)),
        );
      } catch (error) {
        setNotice({
          tone: "error",
          text: getErrorMessage(error, "Nao foi possivel atualizar a tarefa."),
        });
      }
    });
  }

  function handleDeleteTask(taskId: number) {
    withBusyTask(taskId, async () => {
      try {
        await deleteTask(taskId);
        setTasks((current) => current.filter((task) => task.id !== taskId));
        setNotice({ tone: "success", text: "Tarefa removida." });
      } catch (error) {
        setNotice({
          tone: "error",
          text: getErrorMessage(error, "Nao foi possivel remover a tarefa."),
        });
      }
    });
  }

  function handleGenerateTasks(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextGoal = goal.trim();
    const nextApiKey = apiKey.trim();

    if (!nextGoal) {
      setNotice({ tone: "error", text: "Informe um objetivo para gerar tarefas." });
      return;
    }

    if (!nextApiKey) {
      setNotice({ tone: "error", text: "Informe sua OpenAI API key." });
      return;
    }

    startGeneratingTasks(async () => {
      try {
        const generatedTasks = await generateTasks(nextGoal, nextApiKey);
        setTasks((current) => [...generatedTasks, ...current]);
        setGoal("");
        setNotice({
          tone: "success",
          text: `${generatedTasks.length} tarefas geradas com IA.`,
        });
      } catch (error) {
        setNotice({
          tone: "error",
          text: getErrorMessage(error, "Nao foi possivel gerar tarefas com IA."),
        });
      }
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Smart To-Do List</p>
        <h1>Planeje rapido. Execute melhor.</h1>
        <p className={styles.description}>
          Crie tarefas manualmente ou transforme um objetivo amplo em um plano
          acionavel com OpenAI, sem recarregar a pagina.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Nova tarefa</h2>
              <p>Adicione itens manuais ao seu fluxo.</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleCreateTask}>
            <label className={styles.label}>
              Titulo
              <input
                className={styles.input}
                placeholder="Ex.: Revisar roteiro da viagem"
                value={manualTitle}
                onChange={(event) => setManualTitle(event.target.value)}
                disabled={isSubmittingTask}
              />
            </label>
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isSubmittingTask}
            >
              {isSubmittingTask ? "Salvando..." : "Criar tarefa"}
            </button>
          </form>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Geracao com IA</h2>
              <p>Quebre um objetivo em subtarefas claras.</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleGenerateTasks}>
            <label className={styles.label}>
              Objetivo
              <textarea
                className={styles.textarea}
                placeholder="Ex.: Planejar uma viagem para o Chile"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                disabled={isGeneratingTasks}
                rows={4}
              />
            </label>

            <label className={styles.label}>
              OpenAI API key
              <input
                className={styles.input}
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                disabled={isGeneratingTasks}
              />
            </label>

            <button
              className={styles.secondaryButton}
              type="submit"
              disabled={isGeneratingTasks}
            >
              {isGeneratingTasks ? "Gerando..." : "Gerar tarefas"}
            </button>
          </form>
        </article>
      </section>

      {notice ? (
        <section
          className={`${styles.notice} ${
            notice.tone === "success" ? styles.noticeSuccess : styles.noticeError
          }`}
        >
          {notice.text}
        </section>
      ) : null}

      <section className={`${styles.panel} ${styles.listPanel}`}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Lista de tarefas</h2>
            <p>{tasks.length} item(ns) no momento.</p>
          </div>
        </div>

        {initialLoading ? (
          <div className={styles.emptyState}>Carregando tarefas...</div>
        ) : tasks.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhuma tarefa ainda. Crie uma manualmente ou use a IA.
          </div>
        ) : (
          <ul className={styles.taskList}>
            {tasks.map((task) => {
              const isBusy = busyTaskIds.includes(task.id);

              return (
                <li key={task.id} className={styles.taskItem}>
                  <button
                    className={`${styles.toggleButton} ${
                      task.isCompleted ? styles.toggleCompleted : ""
                    }`}
                    onClick={() => handleToggleTask(task)}
                    disabled={isBusy}
                    type="button"
                  >
                    {task.isCompleted ? "Concluida" : "Pendente"}
                  </button>

                  <div className={styles.taskContent}>
                    <p
                      className={`${styles.taskTitle} ${
                        task.isCompleted ? styles.taskTitleDone : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className={styles.taskMeta}>
                      <span>{formatDate(task.createdAt)}</span>
                      <span>{task.isAiGenerated ? "IA" : "Manual"}</span>
                    </div>
                  </div>

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isBusy}
                    type="button"
                  >
                    {isBusy ? "..." : "Excluir"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
