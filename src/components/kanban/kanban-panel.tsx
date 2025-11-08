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
import { ArrowLeftRight, ArrowRight, Flame, GripVertical, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  };

  return (
    <Panel tone="cool" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-700/70 dark:text-slate-200/60">
            Pulse board
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Kanban runway
          </h2>
        </div>
        <Badge tone="info">{cards.length} cards in motion</Badge>
      </header>

      <div className="grid gap-4 rounded-2xl bg-white/40 p-4 backdrop-blur-xl dark:bg-slate-950/40">
        <div className="flex flex-wrap gap-3">
          <Input
            value={draft.title}
            onChange={(event) => setDraft((state) => ({ ...state, title: event.target.value }))}
            placeholder="Title"
            className="flex-1 min-w-[200px]"
          />
          <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Column
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft((state) => ({ ...state, status: event.target.value as KanbanStatus }))
              }
              className="mt-1 rounded-xl border border-white/20 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-200"
            >
              {kanbanColumns.map((column) => (
                <option key={column.key} value={column.key}>
                  {column.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Priority
            <select
              value={draft.priority}
              onChange={(event) =>
                setDraft((state) => ({ ...state, priority: event.target.value as KanbanCard["priority"] }))
              }
              className="mt-1 rounded-xl border border-white/20 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Due
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) =>
                setDraft((state) => ({ ...state, dueDate: event.target.value }))
              }
              className="mt-1 rounded-xl border border-white/20 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-200"
            />
          </label>
        </div>
        <Textarea
          value={draft.description}
          onChange={(event) =>
            setDraft((state) => ({ ...state, description: event.target.value }))
          }
          placeholder="Give this card a heartbeat..."
          className="min-h-[80px]"
        />
        <Input
          value={draft.tags}
          onChange={(event) => setDraft((state) => ({ ...state, tags: event.target.value }))}
          placeholder="Tags (comma separated)"
        />
        <Button icon={<Plus size={16} />} onClick={onCreate} className="self-end">
          Add card
        </Button>
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
        <Badge tone="neutral">{cards.length}</Badge>
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
        <Badge tone={card.priority === "high" ? "warning" : card.priority === "medium" ? "info" : "neutral"}>
          {card.priority}
        </Badge>
      </div>
      {card.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
      )}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {card.tags.map((tag) => (
            <Badge key={tag} tone="neutral" className="bg-white/70 capitalize">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
      {dueLabel && (
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-300">
          <Flame size={14} /> Due {dueLabel}
        </div>
      )}
      <footer className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          variant="ghost"
          icon={<ArrowLeftRight size={15} />}
          onClick={moveForward}
          disabled={currentColumn === "done"}
          className="px-3 py-1 text-xs uppercase tracking-wider"
        >
          Advance
        </Button>
        <Button
          variant="ghost"
          icon={<ArrowRight size={15} className="rotate-180" />}
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
