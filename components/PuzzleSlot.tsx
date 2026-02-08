import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ItemType } from '../types';

interface PuzzleSlotProps {
  id: string;
  acceptType: ItemType;
  children?: React.ReactNode;
  isLocked?: boolean;
}

export const PuzzleSlot: React.FC<PuzzleSlotProps> = ({ id, acceptType, children, isLocked }) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { acceptType },
    disabled: isLocked
  });

  // Default border styling
  let borderColor = 'border-stone-300 bg-white/40';
  
  if (isLocked) {
     borderColor = 'border-red-400 bg-red-100 shadow-inner';
  } 
  // Visual feedback for isOver has been removed as requested
  
  return (
    <div
      id={id}
      ref={setNodeRef}
      className={`
        relative w-full min-h-[60px] rounded-lg border-2 border-dashed
        flex items-center justify-center p-1 transition-colors duration-200
        ${borderColor}
      `}
    >
      {!children && !isLocked && (
        <span className={`text-xs uppercase font-bold tracking-wider pointer-events-none opacity-50 ${acceptType === ItemType.JOINT ? 'text-sky-700' : 'text-amber-700'}`}>
          {acceptType === ItemType.JOINT ? 'Gewricht' : 'Functie'}
        </span>
      )}
      {children}
    </div>
  );
};