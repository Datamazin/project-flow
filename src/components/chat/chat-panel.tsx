'use client';

import { FormEvent, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, SendHorizonal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import {
  ChatMessage,
  Todo,
  useWorkspaceStore,
} from "@/store/workspace-store";

const sentimentStyles: Record<ChatMessage["sentiment"], string> = {
  positive: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  neutral: "bg-slate-900/10 text-slate-800 dark:text-slate-200",
  encouraging: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200",
};

export function ChatPanel() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");

  const todos = useWorkspaceStore((state) => state.todos);
  const kanban = useWorkspaceStore((state) => state.kanban);
  const documents = useWorkspaceStore((state) => state.documents);
  const chatMessages = useWorkspaceStore((state) => state.chat);
  const appendMessage = useWorkspaceStore((state) => state.appendChatMessage);

  const totalWins = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );

  const summary = useMemo(() => {
    const inProgress = kanban.filter((card) => card.status === "in-progress").length;
    const review = kanban.filter((card) => card.status === "review").length;
    return { inProgress, review };
  }, [kanban]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt) {
      return;
    }

    appendMessage("user", prompt, "neutral");
    const reply = buildReply(prompt, {
      todos,
      documentsCount: documents.length,
      wins: totalWins,
      summary,
    });
    appendMessage("assistant", reply.text, reply.sentiment);
    setMessage("");
    formRef.current?.reset();
  };

  return (
    <Panel tone="neutral" className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
            Companion
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Flow guide
          </h2>
        </div>
        <Badge tone="info">{chatMessages.length} exchanges</Badge>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {chatMessages.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={
                entry.role === "assistant"
                  ? "flex justify-start"
                  : "flex justify-end"
              }
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                  entry.role === "assistant"
                    ? sentimentStyles[entry.sentiment]
                    : "bg-slate-900 text-slate-50 shadow-slate-900/20"
                }`}
              >
                <p>{entry.content}</p>
                <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.3em] text-white/60 dark:text-white/50">
                  {formatTime(entry.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
          Share a thought
          <textarea
            rows={3}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Sketch what you need, and I will nudge it forward..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-100"
          />
        </label>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            <span>Your data stays on this device until Supabase joins the party.</span>
          </div>
          <Button
            type="submit"
            icon={<SendHorizonal size={16} />}
            className="px-4"
          >
            Send
          </Button>
        </div>
      </form>
    </Panel>
  );
}

type ReplyContext = {
  todos: Todo[];
  documentsCount: number;
  wins: number;
  summary: { inProgress: number; review: number };
};

type ReplyResult = {
  text: string;
  sentiment: ChatMessage["sentiment"];
};

const POSITIVE_TONES = ["positive", "encouraging"] as const;

function buildReply(message: string, context: ReplyContext): ReplyResult {
  const normalized = message.toLowerCase();

  if (normalized.includes("thank")) {
    return {
      text: "Always! Let me know when you want to ideate on the next bright corner.",
      sentiment: "positive",
    };
  }

  const upcoming = context.todos.find((todo) => !todo.completed && todo.dueDate);

  if (normalized.includes("todo") || normalized.includes("task")) {
    const parts = [
      upcoming
        ? `You have "${upcoming.title}" due ${formatRelativeDate(upcoming.dueDate!)}.`
        : "Your checklist is calm right now.",
      `Wins logged: ${context.wins}. Let's add another?`,
    ];
    return {
      text: parts.join(" "),
      sentiment: "encouraging",
    };
  }

  if (normalized.includes("doc")) {
    return {
      text: `There are ${context.documentsCount} narratives in the library. Want to weave another thread or polish one?`,
      sentiment: "neutral",
    };
  }

  if (normalized.includes("stuck")) {
    return {
      text: "Try narrating the outcome you want in the document editor, then capture three smallest steps inside the todo studio. Momentum loves clarity.",
      sentiment: "encouraging",
    };
  }

  if (context.summary.inProgress > 0) {
    return {
      text: `I see ${context.summary.inProgress} cards in progress and ${context.summary.review} waiting for a spotlight. Nudge one forward and celebrate the motion!`,
      sentiment: "positive",
    };
  }

  return {
    text: "I'm here. Share what's next, and we'll light up the path together.",
    sentiment: POSITIVE_TONES[Math.floor(Math.random() * POSITIVE_TONES.length)],
  };
}
