'use client';

import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Todo = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
};

export type KanbanStatus = "backlog" | "in-progress" | "review" | "done";

export type KanbanCard = {
  id: string;
  title: string;
  description?: string;
  status: KanbanStatus;
  priority: "low" | "medium" | "high";
  tags: string[];
  createdAt: string;
  dueDate?: string;
  updatedAt?: string;
};

export type Doc = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sentiment: "positive" | "neutral" | "encouraging";
};

type WorkspaceState = {
  todos: Todo[];
  kanban: KanbanCard[];
  documents: Doc[];
  activeDocumentId: string | null;
  chat: ChatMessage[];
  addTodo: (payload: Omit<Todo, "id" | "createdAt" | "completed">) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Omit<Todo, "id" | "createdAt">>) => void;
  removeTodo: (id: string) => void;
  reorderTodos: (orderedIds: string[]) => void;
  addKanbanCard: (status: KanbanStatus, card: Omit<KanbanCard, "id" | "status" | "createdAt">) => void;
  updateKanbanCard: (id: string, updates: Partial<Omit<KanbanCard, "id">>) => void;
  moveKanbanCard: (id: string, status: KanbanStatus) => void;
  reorderKanbanColumn: (status: KanbanStatus, orderedIds: string[]) => void;
  removeKanbanCard: (id: string) => void;
  createDocument: (title?: string) => string;
  renameDocument: (id: string, title: string) => void;
  updateDocumentContent: (id: string, content: string) => void;
  deleteDocument: (id: string) => void;
  setActiveDocument: (id: string) => void;
  appendChatMessage: (role: ChatMessage["role"], content: string, sentiment?: ChatMessage["sentiment"]) => void;
  resetWorkspace: () => void;
};

const initialState = (): Omit<WorkspaceState,
  | "addTodo"
  | "toggleTodo"
  | "updateTodo"
  | "removeTodo"
  | "reorderTodos"
  | "addKanbanCard"
  | "updateKanbanCard"
  | "moveKanbanCard"
  | "reorderKanbanColumn"
  | "removeKanbanCard"
  | "createDocument"
  | "renameDocument"
  | "updateDocumentContent"
  | "deleteDocument"
  | "setActiveDocument"
  | "appendChatMessage"
  | "resetWorkspace"
> => ({
  todos: [
    {
      id: nanoid(),
      title: "Plan Q1 goals",
      description: "Draft key outcomes for the product foundations milestone.",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      title: "Review design moodboards",
      description: "Leave feedback on the sensory UI direction.",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ],
  kanban: [
    {
      id: nanoid(),
      title: "Research playful microinteractions",
      description: "Collect inspiring motion patterns for the workspace.",
      status: "backlog",
      priority: "medium",
      tags: ["research"],
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      title: "Wireframe focus mode",
      description: "Sketch how the doc editor can fade distractions.",
      status: "in-progress",
      priority: "high",
      tags: ["design"],
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: nanoid(),
      title: "Prototype adaptive shortcut bar",
      description: "Implement the command palette hints for power users.",
      status: "review",
      priority: "medium",
      tags: ["frontend"],
      createdAt: new Date().toISOString(),
    },
  ],
  documents: [
    {
      id: nanoid(),
      title: "Launch narrative",
      content: "## Story for the project\n\nOutline the feelings and promises this app should deliver.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  activeDocumentId: null,
  chat: [
    {
      id: nanoid(),
      role: "assistant",
      content: "Hey! I'm here to help you craft a flow that feels delightful. What's the next thing you want to tackle?",
      createdAt: new Date().toISOString(),
      sentiment: "encouraging",
    },
  ],
});

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      ...initialState(),
      addTodo: ({ title, description, dueDate }) => {
        set((state) => ({
          todos: [
            {
              id: nanoid(),
              title,
              description,
              dueDate,
              completed: false,
              createdAt: new Date().toISOString(),
            },
            ...state.todos,
          ],
        }));
      },
      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        }));
      },
      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo,
          ),
        }));
      },
      removeTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },
      reorderTodos: (orderedIds) => {
        set((state) => ({
          todos: orderedIds
            .map((id) => state.todos.find((todo) => todo.id === id))
            .filter((value): value is Todo => Boolean(value)),
        }));
      },
      addKanbanCard: (status, card) => {
        set((state) => ({
          kanban: [
            ...state.kanban,
            {
              id: nanoid(),
              status,
              createdAt: new Date().toISOString(),
              ...card,
            },
          ],
        }));
      },
      updateKanbanCard: (id, updates) => {
        set((state) => ({
          kanban: state.kanban.map((card) =>
            card.id === id ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card,
          ),
        }));
      },
      moveKanbanCard: (id, status) => {
        set((state) => ({
          kanban: state.kanban.map((card) =>
            card.id === id ? { ...card, status } : card,
          ),
        }));
      },
      reorderKanbanColumn: (status, orderedIds) => {
        set((state) => {
          const columnCards = orderedIds
            .map((id) => state.kanban.find((card) => card.id === id))
            .filter((value): value is KanbanCard => Boolean(value));

          const otherCards = state.kanban.filter(
            (card) => card.status !== status,
          );

          return {
            kanban: [...otherCards, ...columnCards],
          };
        });
      },
      removeKanbanCard: (id) => {
        set((state) => ({
          kanban: state.kanban.filter((card) => card.id !== id),
        }));
      },
      createDocument: (title = "Untitled") => {
        const id = nanoid();
        const timestamp = new Date().toISOString();
        set((state) => ({
          documents: [
            ...state.documents,
            {
              id,
              title,
              content: "",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
          activeDocumentId: id,
        }));
        return id;
      },
      renameDocument: (id, title) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, title, updatedAt: new Date().toISOString() } : doc,
          ),
        }));
      },
      updateDocumentContent: (id, content) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? { ...doc, content, updatedAt: new Date().toISOString() }
              : doc,
          ),
        }));
      },
      deleteDocument: (id) => {
        set((state) => {
          const filtered = state.documents.filter((doc) => doc.id !== id);
          const activeDocumentId =
            state.activeDocumentId === id
              ? filtered.at(-1)?.id ?? null
              : state.activeDocumentId;
          return {
            documents: filtered,
            activeDocumentId,
          };
        });
      },
      setActiveDocument: (id) => {
        set(() => ({ activeDocumentId: id }));
      },
      appendChatMessage: (role, content, sentiment = "neutral") => {
        set((state) => ({
          chat: [
            ...state.chat,
            {
              id: nanoid(),
              role,
              content,
              createdAt: new Date().toISOString(),
              sentiment,
            },
          ],
        }));
      },
      resetWorkspace: () => {
        set(() => initialState());
      },
    }),
    {
      name: "atelier-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        todos: state.todos,
        kanban: state.kanban,
        documents: state.documents,
        activeDocumentId: state.activeDocumentId,
        chat: state.chat,
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (!state?.activeDocumentId && state?.documents?.length) {
          state.activeDocumentId = state.documents[0].id;
        }
      },
    },
  ),
);

export const kanbanColumns: { key: KanbanStatus; title: string; accent: string }[] = [
  { key: "backlog", title: "Backlog", accent: "from-violet-500/40 via-indigo-500/40 to-sky-500/40" },
  { key: "in-progress", title: "In Progress", accent: "from-amber-500/40 via-orange-500/40 to-rose-500/40" },
  { key: "review", title: "Review", accent: "from-sky-500/40 via-blue-500/40 to-indigo-500/40" },
  { key: "done", title: "Complete", accent: "from-emerald-500/40 via-teal-500/40 to-cyan-500/40" },
];
