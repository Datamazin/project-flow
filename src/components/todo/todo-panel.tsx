"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { Todo, useWorkspaceStore } from "@/store/workspace-store";

type DraftTodo = {
  title: string;
};

const defaultDraft: DraftTodo = {
  title: "",
};

export function TodoPanel() {
  const [draft, setDraft] = useState<DraftTodo>(defaultDraft);
  const [composerOpen, setComposerOpen] = useState(false);

  const todos = useWorkspaceStore((state) => state.todos);
  const addTodo = useWorkspaceStore((state) => state.addTodo);
  const toggleTodo = useWorkspaceStore((state) => state.toggleTodo);
  const removeTodo = useWorkspaceStore((state) => state.removeTodo);
  const toggleTodoPin = useWorkspaceStore((state) => state.toggleTodoPin);

  const ordered = useMemo(
    () => [...todos].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [todos],
  );

  const onSubmit = () => {
    if (!draft.title.trim()) {
      return;
    }

    addTodo({
      title: draft.title.trim(),
    });
    setDraft(defaultDraft);
    setComposerOpen(false);
  };

  return (
    <Panel
      tone="cool"
      className="relative flex h-full flex-col gap-8 border-none bg-transparent p-6 text-white shadow-2xl"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#7a85ff_0%,#6672f7_100%),repeating-linear-gradient(180deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_60px)] [background-blend-mode:overlay]" />

      <header className="flex items-center justify-between text-sm font-medium text-white/85">
        <button className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/15">
          <ChevronLeft size={18} />
          Lists
        </button>
        <button className="rounded-full p-2 transition hover:bg-white/15" aria-label="More actions">
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div>
        <h2 className="text-4xl font-semibold leading-tight">Tasks</h2>
      </div>

      <section className="flex flex-1 flex-col gap-3">
        {ordered.length === 0 && (
          <div className="rounded-3xl bg-white/15 p-4 text-sm text-white/80">
            Nothing on deck. Tap “Add a Task” below to capture a new intention.
          </div>
        )}

        {ordered.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onRemove={() => removeTodo(todo.id)}
            onTogglePin={() => toggleTodoPin(todo.id)}
          />
        ))}
      </section>

      {composerOpen ? (
        <div className="grid gap-3 rounded-3xl bg-white/20 p-4 text-sm text-white/85">
          <Input
            value={draft.title}
            onChange={(event) => setDraft({ title: event.target.value })}
            placeholder="Name your next win"
            className="rounded-2xl border-none bg-white text-slate-900 placeholder:text-slate-400"
          />
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setComposerOpen(false);
                setDraft(defaultDraft);
              }}
              variant="ghost"
              className="rounded-2xl bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={onSubmit}
              className="rounded-2xl bg-white px-5 py-2 text-indigo-600 hover:bg-indigo-50"
            >
              Save task
            </Button>
          </div>
        </div>
      ) : (
        <Button
          icon={<Plus size={18} />}
          onClick={() => setComposerOpen(true)}
          className="mt-auto w-full justify-center rounded-3xl bg-white/20 py-4 text-base font-semibold text-white shadow-md transition hover:bg-white/25"
        >
          Add a Task
        </Button>
      )}
    </Panel>
  );
}

type TodoCardProps = {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
  onTogglePin: () => void;
};

function TodoCard({ todo, onToggle, onRemove, onTogglePin }: TodoCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-3xl bg-white px-5 py-4 text-slate-900 shadow-sm shadow-slate-900/10">
      <button
        onClick={onToggle}
        aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
          todo.completed
            ? "border-indigo-500 bg-indigo-500 text-white shadow"
            : "border-slate-300 bg-white text-slate-400 hover:border-indigo-400",
        )}
      >
        {todo.completed && <Check size={18} />}
      </button>

      <div className="flex-1">
        <h3 className={cn("text-base font-semibold", todo.completed && "line-through text-slate-400")}>{todo.title}</h3>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePin}
          className={cn(
            "rounded-full p-2 transition",
            todo.pinned ? "text-indigo-500 hover:bg-indigo-50" : "text-slate-400 hover:bg-slate-100",
          )}
          aria-label={todo.pinned ? "Remove favorite" : "Mark as favorite"}
        >
          <Star size={18} className={cn(todo.pinned && "fill-current")} strokeWidth={1.5} />
        </button>
        <button
          onClick={onRemove}
          className="rounded-full p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
          aria-label="Delete todo"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
}
