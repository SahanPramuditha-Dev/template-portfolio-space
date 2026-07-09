import React from 'react';
import clsx from 'clsx';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableCollectionItem = ({ id, index, item, selectedIndex, editItem, removeItem, sectionTitle, isSelected, toggleSelection }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className="relative group">
      <div
        className={clsx(
          'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          selectedIndex === index
            ? 'border-accent/50 bg-accent/10 shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.2)]'
            : 'border-white/10 bg-primary/30 hover:border-accent/25 hover:bg-primary/45'
        )}
      >
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-1 -ml-2 text-text-muted hover:text-text touch-none"
        >
          <GripVertical size={16} />
        </div>
        
        {toggleSelection && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); toggleSelection(index); }}
            className="h-4 w-4 rounded border-white/10 bg-primary/50 text-accent focus:ring-accent accent-accent shrink-0 mr-1"
          />
        )}

        <div
          role="button"
          tabIndex={0}
          onClick={() => editItem(index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              editItem(index);
            }
          }}
          className="flex-1 min-w-0 cursor-pointer outline-none"
        >
          <p className="truncate font-semibold text-text">
            {item.title || item.name || item.url || `Item ${index + 1}`}
          </p>
          <p className="truncate text-xs text-text-muted">
            {item.category || item.issuer || item.type || item.organization || sectionTitle}
          </p>
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeItem(index);
          }}
          className="shrink-0 rounded-xl border border-red-400/25 p-2 text-red-300 transition-colors hover:bg-red-400/15 relative z-10"
          aria-label={`Delete ${item.title || `item ${index + 1}`}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
};

export default SortableCollectionItem;
