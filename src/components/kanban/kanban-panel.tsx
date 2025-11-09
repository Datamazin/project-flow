"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronLeft,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRelativeDate } from "@/lib/utils";
import {
  KanbanCard,
  KanbanStatus,
  kanbanColumns,
  useWorkspaceStore,
} from "@/store/workspace-store";

type DraftCard = {
  title: string;
  description: string;
  status: KanbanStatus;
  priority: KanbanCard["priority"];
  tags: string;
  dueDate: string;
};

const defaultCard: DraftCard = {
  title: "",
  description: "",
  status: "backlog",
  priority: "medium",
  tags: "",
  dueDate: "",
};

export function KanbanPanel() {
  const cards = useWorkspaceStore((state) => state.kanban);
  const addKanbanCard = useWorkspaceStore((state) => state.addKanbanCard);
  const moveKanbanCard = useWorkspaceStore((state) => state.moveKanbanCard);
  const removeKanbanCard = useWorkspaceStore((state) => state.removeKanbanCard);
  const reorderKanbanColumn = useWorkspaceStore((state) => state.reorderKanbanColumn);

  const [draft, setDraft] = useState<DraftCard>(defaultCard);
  const [composerOpen, setComposerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const grouped = useMemo(() => {
    return kanbanColumns.map((column) => ({
      ...column,
      items: cards.filter((card) => card.status === column.key),
    }));
  }, [cards]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnKey = (active.data.current?.columnKey ?? grouped.find((column) =>
      column.items.some((card) => card.id === activeId),
    )?.key) as KanbanStatus | undefined;

    const overColumnKey = (over.data.current?.columnKey ?? (() => {
      if (overId.startsWith("column:")) {
        return overId.replace("column:", "") as KanbanStatus;
      }
      return grouped.find((column) => column.items.some((card) => card.id === overId))?.key;
    })()) as KanbanStatus | undefined;

    if (!activeColumnKey || !overColumnKey) {
      return;
    }

    if (activeId === overId && activeColumnKey === overColumnKey) {
      return;
    }

    if (activeColumnKey === overColumnKey) {
      const columnItems = grouped.find((column) => column.key === activeColumnKey)?.items ?? [];
      const activeIndex = columnItems.findIndex((card) => card.id === activeId);
      const overIndex = columnItems.findIndex((card) => card.id === overId);

      if (activeIndex === -1 || overIndex === -1) {
        return;
      }

      const nextOrder = arrayMove(
        columnItems.map((card) => card.id),
        activeIndex,
        overIndex,
      );
      reorderKanbanColumn(activeColumnKey, nextOrder);
      return;
    }

    const sourceColumn = grouped.find((column) => column.key === activeColumnKey);
    const targetColumn = grouped.find((column) => column.key === overColumnKey);

    if (!sourceColumn || !targetColumn) {
      return;
    }

    const targetIds = targetColumn.items.map((card) => card.id);
    const overSortableId = over.data.current?.sortable?.id as string | undefined;
    let insertAt = targetIds.length;

    if (overSortableId && targetIds.includes(overSortableId)) {
      insertAt = targetIds.indexOf(overSortableId);
    } else if (overId.startsWith("column:")) {
      insertAt = targetIds.length;
    }

    moveKanbanCard(activeId, overColumnKey);

    const updatedTargetIds = [...targetIds];
    updatedTargetIds.splice(insertAt, 0, activeId);
    reorderKanbanColumn(overColumnKey, updatedTargetIds);

    const remainingSourceIds = sourceColumn.items
      .filter((card) => card.id !== activeId)
      .map((card) => card.id);
    reorderKanbanColumn(activeColumnKey, remainingSourceIds);
  };

  const onCreate = () => {
    if (!draft.title.trim()) {
      return;
    }

    addKanbanCard(draft.status, {
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      priority: draft.priority,
      tags: draft.tags
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean),
      dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : undefined,
    });

    setDraft(defaultCard);
    setComposerOpen(false);
  };

  return (
    <Panel
      tone="cool"
      className="relative flex h-full flex-col gap-8 border-none bg-transparent p-6 text-white shadow-2xl"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(170deg,#7a85ff_0%,#6672f7_100%),repeating-linear-gradient(180deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_64px)] [background-blend-mode:overlay]" />

      <header className="flex items-center justify-between text-sm font-medium text-white/85">
        <button className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/15">
          <ChevronLeft size={18} /> Boards
        </button>
        <button className="rounded-full p-2 transition hover:bg-white/15" aria-label="Board options">
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div className="space-y-1">
        <h2 className="text-4xl font-semibold leading-tight">Projects</h2>
        <p className="text-sm text-white/75">{cards.length} cards in this flow</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {grouped.map((column) => (
            <ColumnView
              key={column.key}
              columnKey={column.key}
              title={column.title}
              accent={column.accent}
              cards={column.items}
              onMove={moveKanbanCard}
              onRemove={removeKanbanCard}
            />
          ))}
        </section>
      </DndContext>

      {composerOpen ? (
        <div className="grid gap-3 rounded-3xl bg-white/15 p-4 text-sm text-white/85">
          <Input
            value={draft.title}
            onChange={(event) => setDraft((state) => ({ ...state, title: event.target.value }))}
            placeholder="Give the card a name"
            className="rounded-2xl border-none bg-white text-slate-900 placeholder:text-slate-400"
          />
          <Textarea
            value={draft.description}
            onChange={(event) =>
              setDraft((state) => ({ ...state, description: event.target.value }))
            }
            placeholder="Add a quick note (optional)"
            className="min-h-[80px] rounded-2xl border-none bg-white/80 text-slate-900 placeholder:text-slate-400"
          />
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col text-[0.65rem] uppercase tracking-[0.3em] text-white/65">
              Column
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((state) => ({ ...state, status: event.target.value as KanbanStatus }))
                }
                className="mt-1 rounded-2xl border border-white/30 bg-white/20 px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                {kanbanColumns.map((column) => (
                  <option key={column.key} value={column.key} className="text-slate-900">
                    {column.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-[0.65rem] uppercase tracking-[0.3em] text-white/65">
              Priority
              <select
                value={draft.priority}
                onChange={(event) =>
                  setDraft((state) => ({ ...state, priority: event.target.value as KanbanCard["priority"] }))
                }
                className="mt-1 rounded-2xl border border-white/30 bg-white/20 px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <option value="low" className="text-slate-900">
                  Low
                </option>
                <option value="medium" className="text-slate-900">
                  Medium
                </option>
                <option value="high" className="text-slate-900">
                  High
                </option>
              </select>
            </label>
            <label className="flex flex-col text-[0.65rem] uppercase tracking-[0.3em] text-white/65">
              Due
              <input
                type="date"
                value={draft.dueDate}
                onChange={(event) =>
                  setDraft((state) => ({ ...state, dueDate: event.target.value }))
                }
                className="mt-1 rounded-2xl border border-white/30 bg-white/20 px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            </label>
            <Input
              value={draft.tags}
              onChange={(event) => setDraft((state) => ({ ...state, tags: event.target.value }))}
              placeholder="Tags (comma separated)"
              className="flex-1 rounded-2xl border-none bg-white/15 px-4 py-2 text-sm text-white placeholder:text-white/60"
            />
            <div className="ml-auto flex gap-3">
              <Button
                onClick={() => {
                  setComposerOpen(false);
                  setDraft(defaultCard);
                }}
                variant="ghost"
                className="rounded-2xl bg-white/10 px-4 py-2 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                icon={<Plus size={16} />}
                onClick={onCreate}
                className="rounded-2xl bg-white px-5 py-2 text-indigo-600 hover:bg-indigo-50"
              >
                Save card
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          icon={<Plus size={18} />}
          onClick={() => setComposerOpen(true)}
          className="mt-auto w-full justify-center rounded-3xl bg-white/20 py-4 text-base font-semibold text-white shadow-md transition hover:bg-white/25"
        >
          Add a Card
        </Button>
      )}
    </Panel>
  );
}

type ColumnViewProps = {
  columnKey: KanbanStatus;
  title: string;
  accent: string;
  cards: KanbanCard[];
  onMove: (id: string, status: KanbanStatus) => void;
  onRemove: (id: string) => void;
};

function ColumnView({
  columnKey,
  title,
  accent,
  cards,
  onMove,
  onRemove,
}: ColumnViewProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${columnKey}`,
    data: { columnKey },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[260px] flex-col gap-3 rounded-3xl border border-white/10 p-4",
        "bg-white/55 backdrop-blur-xl dark:bg-slate-950/40",
        `bg-gradient-to-br ${accent}`,
        isOver && "ring-2 ring-indigo-300/50",
      )}
    >
      <header className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100">
        <span>{title}</span>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
          {cards.length}
        </span>
      </header>
      <SortableContext
        id={columnKey}
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3">
          {cards.length === 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Empty. Drop a card here and give it a purpose.
            </p>
          )}
          {cards.map((card) => (
            <KanbanCardView
              key={card.id}
              card={card}
              onMove={onMove}
              onRemove={onRemove}
              currentColumn={columnKey}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

type KanbanCardViewProps = {
  card: KanbanCard;
  onMove: (id: string, status: KanbanStatus) => void;
  onRemove: (id: string) => void;
  currentColumn: KanbanStatus;
};

function KanbanCardView({ card, onMove, onRemove, currentColumn }: KanbanCardViewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { columnKey: currentColumn },
  });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (element: HTMLDivElement | null) => {
    setNodeRef(element);
    cardRef.current = element;
  };

  useEffect(() => {
    const node = cardRef.current;
    if (!node) {
      return;
    }

    const nextTransform = transform ? CSS.Transform.toString(transform) : undefined;
    node.style.transform = nextTransform ?? "";
    node.style.transition = transition ?? "";
  }, [transform, transition]);

  const dueLabel = card.dueDate ? formatRelativeDate(card.dueDate) : null;

  const moveForward = () => {
    const order: KanbanStatus[] = ["backlog", "in-progress", "review", "done"];
    const currentIndex = order.indexOf(card.status);
    if (currentIndex >= 0 && currentIndex < order.length - 1) {
      onMove(card.id, order[currentIndex + 1]);
    }
  };

  const moveBack = () => {
    const order: KanbanStatus[] = ["backlog", "in-progress", "review", "done"];
    const currentIndex = order.indexOf(card.status);
    if (currentIndex > 0) {
      onMove(card.id, order[currentIndex - 1]);
    }
  };

  return (
    <article
      ref={setRefs}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/70 p-4 shadow transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-950/60",
        isDragging && "ring-2 ring-indigo-300/60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 shadow-sm transition group-hover:bg-indigo-200/70 group-hover:text-indigo-700 dark:bg-slate-800/80 dark:text-slate-200 dark:group-hover:bg-indigo-500/40 dark:group-hover:text-indigo-100 cursor-grab"
            aria-label="Drag card"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {card.title}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold capitalize",
            card.priority === "high" && "bg-rose-500/15 text-rose-600",
            card.priority === "medium" && "bg-amber-500/15 text-amber-600",
            card.priority === "low" && "bg-emerald-500/15 text-emerald-600",
          )}
        >
          {card.priority}
        </span>
      </div>
      {card.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
      )}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/70 px-2 py-1 font-medium text-slate-600 shadow-sm dark:bg-slate-900/60 dark:text-slate-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {dueLabel && (
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-300">
          <Calendar size={14} /> Due {dueLabel}
        </div>
      )}
      <footer className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          variant="ghost"
          icon={<ArrowRight size={16} />}
          onClick={moveForward}
          disabled={currentColumn === "done"}
          className="px-3 py-1 text-xs uppercase tracking-wider"
        >
          Advance
        </Button>
        <Button
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          onClick={moveBack}
          disabled={currentColumn === "backlog"}
          className="px-3 py-1 text-xs uppercase tracking-wider"
        >
          Return
        </Button>
        <Button
          variant="ghost"
          icon={<Trash2 size={15} />}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(card.id);
          }}
          className="ml-auto px-3 py-1 text-xs text-rose-500"
        >
          Remove
        </Button>
      </footer>
    </article>
  );
}
