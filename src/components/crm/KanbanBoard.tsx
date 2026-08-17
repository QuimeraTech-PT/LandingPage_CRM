import React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface KanbanItemProps {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  status: string;
  data: any;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  items: KanbanItemProps[];
  renderItem: (item: KanbanItemProps) => React.ReactNode;
}

export function KanbanBoard({
  columns,
  onDragEnd,
}: {
  columns: KanbanColumnProps[];
  onDragEnd: (itemId: string, newStatus: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const itemId = active.id;
    const overId = over.id;

    // Find the column the item was dropped into
    const overColumn = columns.find((col) => col.id === overId || col.items.some((item) => item.id === overId));
    
    if (overColumn) {
      onDragEnd(itemId as string, overColumn.id);
    }
  };

  const activeItem = activeId 
    ? columns.flatMap(c => c.items).find(i => i.id === activeId) 
    : null;

  const currentColumn = activeId 
    ? columns.find(c => c.items.some(i => i.id === activeId))
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeItem && currentColumn ? (
          <div className="w-80 rotate-3 scale-105 shadow-2xl">
            {currentColumn.renderItem(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ column }: { column: KanbanColumnProps }) {
  const { setNodeRef } = useSortable({
    id: column.id,
  });

  return (
    <div ref={setNodeRef} className="flex flex-col w-80 shrink-0 bg-muted/20 rounded-xl border border-white/5 h-full min-h-[500px]">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {column.title}
          <Badge variant="secondary" className="text-[10px] py-0">{column.items.length}</Badge>
        </h3>
      </div>
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        <SortableContext
          items={column.items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {column.renderItem(item)}
            </SortableItem>
          ))}
        </SortableContext>
        {column.items.length === 0 && (
          <div className="h-24 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-xs text-muted-foreground italic">
            Sem itens
          </div>
        )}
      </div>
    </div>
  );
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
