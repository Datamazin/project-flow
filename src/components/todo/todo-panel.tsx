'use client';

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Todo, useWorkspaceStore } from "@/store/workspace-store";

type DraftTodo = {
  title: string;
  description: string;
  dueDate: string;
};

const defaultDraft: DraftTodo = {
  title: "",
  description: "",
  dueDate: "",
};

export function TodoPanel() {
  const [draft, setDraft] = useState<DraftTodo>(defaultDraft);
  const todos = useWorkspaceStore((state) => state.todos);
  const addTodo = useWorkspaceStore((state) => state.addTodo);
  const toggleTodo = useWorkspaceStore((state) => state.toggleTodo);
  const removeTodo = useWorkspaceStore((state) => state.removeTodo);

  const { completed, upcoming } = useMemo(() => {
    const completedCount = todos.filter((todo) => todo.completed).length;
    const upcomingItems = todos.filter((todo) => !todo.completed);
    return {
      completed: completedCount,
      upcoming: upcomingItems,
    };
  }, [todos]);

  const onSubmit = () => {
    if (!draft.title.trim()) {
      return;
    }

    addTodo({
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : undefined,
    });
    setDraft(defaultDraft);
  };

  return (
    <Panel tone="warm" className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-700/70 dark:text-slate-200/60">
            Today&apos;s flow
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Todo studio
          </h2>
        </div>
        <Badge tone="info" className="shadow-sm">
          {completed} done · {todos.length} total
        </Badge>
      </header>

      <div className="grid gap-3 rounded-2xl bg-white/50 p-4 backdrop-blur-xl dark:bg-slate-950/40">
        <Input
          value={draft.title}
          onChange={(event) => setDraft((state) => ({ ...state, title: event.target.value }))}
          placeholder="Sketch the next brilliant idea..."
          className="bg-white/80"
        />
        <Textarea
          value={draft.description}
          onChange={(event) =>
            setDraft((state) => ({ ...state, description: event.target.value }))
          }
          placeholder="Add the color, texture, or context. Optional but delightful."
          className="min-h-[80px] bg-white/80"
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            Due
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) =>
                setDraft((state) => ({ ...state, dueDate: event.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-inner transition focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-200 md:w-auto"
            />
          </label>
          <Button icon={<Plus size={16} />} onClick={onSubmit} className="md:ml-auto">
            Add to journey
          </Button>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        {todos.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Everything is clear — add a new spark above.
          </p>
        )}

        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onRemove={() => removeTodo(todo.id)}
          />
        ))}
      </section>

      {upcoming.length > 0 && (
        <footer className="rounded-2xl bg-white/40 p-4 text-xs text-slate-600 backdrop-blur-xl dark:bg-slate-950/40 dark:text-slate-300">
          {upcoming.length} idea{upcoming.length > 1 ? "s" : ""} waiting for your magic.
        </footer>
      )}
    </Panel>
  );
}

type TodoCardProps = {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
};

function TodoCard({ todo, onToggle, onRemove }: TodoCardProps) {
  const Icon = todo.completed ? CheckCircle2 : Circle;
  const dueLabel = todo.dueDate ? formatRelativeDate(todo.dueDate) : null;

  return (
    <article
      className="flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-950/50"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="text-slate-500 transition hover:text-indigo-500"
          aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        >
          <Icon size={22} />
        </button>
        <div className="flex-1">
          <h3
            className={cn(
              "text-base font-semibold text-slate-900 transition dark:text-slate-100",
              todo.completed && "line-through text-slate-400 dark:text-slate-500",
            )}
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{todo.description}</p>
          )}
          {dueLabel && (
            <Badge tone="warning" className="mt-2">
              Due {dueLabel}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          icon={<Trash2 size={16} />}
          onClick={onRemove}
          className="h-fit px-2 py-1 text-slate-500 hover:text-rose-500"
          aria-label="Delete todo"
        />
      </div>
    </article>
  );
}
