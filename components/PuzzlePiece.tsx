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
  style?: React.CSSProperties; // Added style prop
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ id, text, type, isOverlay, disabled, style: propStyle }) => {
  // We disable the draggable hook if this component is being rendered 
  // inside the DragOverlay (isOverlay). 
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { type, text },
    disabled: disabled || isOverlay
  });

  // Theme: Vibrant colors
  const typeColor = type === ItemType.JOINT 
    ? 'bg-sky-100 border-sky-300 text-sky-900 shadow-sm ring-sky-200' 
    : 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm ring-amber-200';
    
  // Removed hover classes to reduce visual noise
  const hoverClasses = !disabled && !isOverlay ? (type === ItemType.JOINT ? '' : '') : '';
  const cursorClass = disabled ? 'cursor-not-allowed opacity-90' : 'cursor-grab active:cursor-grabbing';

  const baseClasses = `
    relative flex items-center gap-2 p-3 rounded-md border
    ${cursorClass} text-sm font-medium
    transition-all duration-200 select-none touch-none w-full min-h-[50px]
    ${typeColor} ${hoverClasses}
    ${isDragging ? 'opacity-30' : 'opacity-100'} 
    ${isOverlay ? 'z-[999] cursor-grabbing !opacity-100' : ''}
  `;

  // Parse text
  const parts = text.match(/^(.*?)\s*(\(.*\))?$/);
  const mainText = parts ? parts[1] : text;
  const subText = parts && parts[2] ? parts[2] : null;

  return (
    <div 
      // Only attach ID if it's the source item to avoid duplicate IDs with the overlay clone
      id={!isOverlay ? id : undefined} 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className={baseClasses}
      style={propStyle}
    >
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