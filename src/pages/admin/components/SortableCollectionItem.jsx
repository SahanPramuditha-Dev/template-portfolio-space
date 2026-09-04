import React from 'react';
import clsx from 'clsx';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableCollectionItem = ({ id, index, item, selectedIndex, editItem, removeItem, sectionTitle, isSelected, toggleSelection }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrent = selectedIndex === index;
  const itemTitle = item.title || item.name || item.url || `Item ${index + 1}`;
  const itemSubtitle = item.category || item.issuer || item.type || item.organization || sectionTitle;
  const isDraft = item.status === 'Draft' || item.published === false;
  const itemImage = item.thumbnail || item.image || item.eventPhoto || (Array.isArray(item.eventGallery) ? item.eventGallery.find((entry) => entry?.url)?.url : '') || (Array.isArray(item.screenshots) ? item.screenshots.find((entry) => entry?.url)?.url : '');

  return (
    <li ref={setNodeRef} style={style} className={clsx("relative group", isDragging && "z-20 opacity-80")}>
      <div
        className={clsx(
          'flex w-full items-center gap-3 rounded-xl border p-3 sm:p-3.5 text-left transition-all outline-none',
          isCurrent
            ? 'border-sky-500/60 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]'
            : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
        )}
      >
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-1 text-slate-500 hover:text-slate-300 touch-none shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={15} />
        </div>
        
        {toggleSelection && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); toggleSelection(index); }}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-400 accent-sky-500 shrink-0"
          />
        )}

        {itemImage ? (
          <img src={itemImage} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-slate-700/80 bg-slate-900 object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-[10px] font-mono font-bold text-slate-500">
            {String(itemTitle).slice(0, 1).toUpperCase()}
          </div>
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
          className="flex-1 min-w-0 cursor-pointer outline-none select-none"
        >
          <div className="flex items-center gap-2">
            <p className={clsx("truncate text-xs sm:text-sm font-semibold", isCurrent ? "text-sky-300" : "text-slate-200")}>
              {itemTitle}
            </p>
            {item.status && (
              <span className={clsx(
                "shrink-0 rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wider uppercase",
                isDraft ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              )}>
                {item.status}
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-slate-400 mt-0.5">
            {itemSubtitle}
          </p>
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeItem(index);
          }}
          className="shrink-0 rounded-lg border border-red-500/20 p-1.5 text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          title={`Delete ${itemTitle}`}
          aria-label={`Delete ${itemTitle}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
};

export default SortableCollectionItem;
