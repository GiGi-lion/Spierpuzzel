import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ItemType } from '../types';
import { GripVertical } from 'lucide-react';

interface PuzzlePieceProps {
  id: string;
  text: string;
  type: ItemType;
  isOverlay?: boolean;
  disabled?: boolean;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ id, text, type, isOverlay, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { type, text },
    disabled: disabled
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Theme: Vibrant colors
  // Joints = Sky Blue
  // Functions = Amber/Orange
  const typeColor = type === ItemType.JOINT 
    ? 'bg-sky-100 border-sky-300 text-sky-900 shadow-sm ring-sky-200' 
    : 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm ring-amber-200';
    
  const hoverClasses = !disabled ? (type === ItemType.JOINT ? 'hover:bg-sky-200' : 'hover:bg-amber-200') : '';
  const cursorClass = disabled ? 'cursor-not-allowed opacity-90' : 'cursor-grab active:cursor-grabbing';

  // Added 'touch-none' to prevent browser scrolling while dragging on mobile
  const baseClasses = `
    relative flex items-center gap-2 p-3 rounded-md border
    ${cursorClass} text-sm font-medium
    transition-all duration-200 select-none touch-none w-full min-h-[50px]
    ${typeColor} ${hoverClasses}
    ${isDragging ? 'opacity-50 z-50' : 'opacity-100'}
    ${isOverlay ? 'shadow-2xl scale-105 z-50 cursor-grabbing ring-2' : ''}
  `;

  // Parse text to separate main text from parentheses
  // Matches "Main Text (Secondary Text)"
  const parts = text.match(/^(.*?)\s*(\(.*\))?$/);
  const mainText = parts ? parts[1] : text;
  const subText = parts && parts[2] ? parts[2] : null;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={baseClasses}>
       {!disabled && <GripVertical size={16} className="opacity-40 flex-shrink-0" />}
       <div className="flex-1 leading-tight">
         <span className="block">{mainText}</span>
         {subText && (
           <span className="block text-xs font-normal opacity-70 mt-0.5">{subText}</span>
         )}
       </div>
    </div>
  );
};