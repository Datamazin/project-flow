'use client';

import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { FileText, Layout, PenSquare, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Doc, useWorkspaceStore } from "@/store/workspace-store";

export type EditorMode = "edit" | "preview" | "focus";

export function DocumentPanel() {
  const documents = useWorkspaceStore((state) => state.documents);
  const activeDocumentId = useWorkspaceStore((state) => state.activeDocumentId);
  const createDocument = useWorkspaceStore((state) => state.createDocument);
  const deleteDocument = useWorkspaceStore((state) => state.deleteDocument);
  const setActiveDocument = useWorkspaceStore((state) => state.setActiveDocument);

  const [mode, setMode] = useState<EditorMode>("edit");

  const activeDocument = useMemo(() => {
    if (activeDocumentId) {
      return documents.find((doc) => doc.id === activeDocumentId) ?? documents[0];
    }
    return documents[0];
  }, [activeDocumentId, documents]);

  const documentCount = documents.length;

  const handleCreate = () => {
    const id = createDocument("New narrative");
    setActiveDocument(id);
  };

  const handleDelete = (id: string) => {
    if (documentCount <= 1) {
      return;
    }
    deleteDocument(id);
  };

  return (
    <Panel tone="emerald" className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Library
          </h2>
          <Badge tone="success">{documentCount} docs</Badge>
        </div>
        <Button icon={<Plus size={16} />} onClick={handleCreate} variant="accent">
          New document
        </Button>
        <nav className="flex flex-col gap-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveDocument(doc.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveDocument(doc.id);
                }
              }}
              className={cn(
                "group flex cursor-pointer items-start justify-between gap-2 rounded-2xl border border-transparent bg-white/40 px-3 py-3 text-left text-sm shadow-sm transition hover:border-emerald-500/40 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:bg-slate-950/40 dark:hover:border-emerald-400/30",
                activeDocument?.id === doc.id && "border-emerald-500/50 bg-white/80 shadow-lg",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-600 dark:text-emerald-300">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Updated {formatRelativeDate(doc.updatedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                icon={<Trash2 size={14} />}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(doc.id);
                }}
                disabled={documentCount <= 1}
                className="h-fit px-2 py-1 text-rose-500 opacity-0 transition group-hover:opacity-100"
                aria-label="Delete document"
              />
            </div>
          ))}
        </nav>
      </aside>

      {activeDocument ? (
        <DocumentEditor
          key={activeDocument.id}
          doc={activeDocument}
          mode={mode}
          setMode={setMode}
        />
      ) : (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-white/20 bg-white/50 text-sm text-slate-500 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/40">
          Create your first document to start writing.
        </div>
      )}
    </Panel>
  );
}

type DocumentEditorProps = {
  doc: Doc;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
};

function DocumentEditor({ doc, mode, setMode }: DocumentEditorProps) {
  const renameDocument = useWorkspaceStore((state) => state.renameDocument);
  const updateDocumentContent = useWorkspaceStore((state) => state.updateDocumentContent);

  const [titleDraft, setTitleDraft] = useState(doc.title);
  const [contentDraft, setContentDraft] = useState(doc.content);

  const sanitizedHtml = useMemo(() => {
    const raw = marked.parse(contentDraft || "") as string;
    if (typeof window === "undefined") {
      return raw;
    }
    const purifier = DOMPurify(window);
    return purifier.sanitize(raw);
  }, [contentDraft]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
            Title
            <Input
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={() => renameDocument(doc.id, titleDraft || "Untitled")}
              className="mt-2 text-lg font-semibold"
            />
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last touched {formatRelativeDate(doc.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle
            icon={<PenSquare size={15} />}
            active={mode === "edit"}
            label="Edit"
            onClick={() => setMode("edit")}
          />
          <ModeToggle
            icon={<Layout size={15} />}
            active={mode === "preview"}
            label="Preview"
            onClick={() => setMode("preview")}
          />
          <ModeToggle
            icon={<FileText size={15} />}
            active={mode === "focus"}
            label="Focus"
            onClick={() => setMode("focus")}
          />
        </div>
      </header>

      {(mode === "edit" || mode === "focus") && (
        <Textarea
          value={contentDraft}
          onChange={(event) => {
            setContentDraft(event.target.value);
            updateDocumentContent(doc.id, event.target.value);
          }}
          className={cn(
            "min-h-[280px] rounded-3xl border border-white/20 bg-white/70 text-base leading-relaxed shadow-inner dark:border-slate-800/60 dark:bg-slate-950/60",
            mode === "focus" && "text-lg leading-loose",
          )}
          placeholder="Write a narrative that hums with emotion..."
        />
      )}

      {(mode === "preview" || mode === "focus") && (
        <div
          className={cn(
            "prose prose-slate max-w-none rounded-3xl border border-white/20 bg-white/80 p-6 text-slate-800 shadow-sm backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/60 dark:prose-invert",
            mode === "focus" && "border-none bg-transparent p-0 shadow-none",
          )}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      )}
    </div>
  );
}

type ModeToggleProps = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
};

function ModeToggle({ icon, label, active, onClick }: ModeToggleProps) {
  return (
    <Button
      variant={active ? "accent" : "ghost"}
      icon={icon}
      onClick={onClick}
      className="px-3 py-1 text-xs uppercase tracking-[0.2em]"
    >
      {label}
    </Button>
  );
}
