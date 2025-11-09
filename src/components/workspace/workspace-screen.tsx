'use client';

import { useMemo } from "react";
import { Sparkles } from "lucide-react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { DocumentPanel } from "@/components/documents/document-panel";
import { KanbanPanel } from "@/components/kanban/kanban-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { TodoPanel } from "@/components/todo/todo-panel";
import { useWorkspaceStore } from "@/store/workspace-store";

export function WorkspaceScreen() {
  const todos = useWorkspaceStore((state) => state.todos);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);

  const metrics = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const upcoming = todos.filter((todo) => !todo.completed).length;
    return { completed, upcoming };
  }, [todos]);

  return (
    <div className="relative overflow-hidden pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-[360px] w-[360px] rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-4 pt-16 sm:px-8">
        <section className="flex flex-col gap-6">
          <Badge tone="info" className="w-fit bg-indigo-500/20 text-indigo-200">
            Local-first creative cockpit
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
            Project management that feels like a studio, not a spreadsheet.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Atelier Flow keeps todos, kanban, documents, and a thoughtful companion together—everything saved on your device until Supabase joins the story.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Sparkles size={16} className="text-indigo-200" /> {metrics.completed} wins celebrated
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              {metrics.upcoming} ideas in motion
            </span>
            <Button variant="ghost" onClick={resetWorkspace} className="border border-white/10">
              Reset workspace
            </Button>
          </div>
        </section>

        <section className="grid gap-8">
          <TodoPanel />
          <KanbanPanel />
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <DocumentPanel />
            <ChatPanel />
          </div>
          <Panel className="text-center text-sm text-slate-400">
            This atelier is entirely local-first. When you are ready to sync with Supabase, the scaffolding is here waiting.
          </Panel>
        </section>
      </main>
    </div>
  );
}

export default WorkspaceScreen;
