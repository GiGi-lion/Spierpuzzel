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
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: { acceptType },
    disabled: isLocked
  });

  // Dynamic border color based on type when hovering
  let borderColor = 'border-stone-300 bg-white/40 hover:bg-white/60';
  
  if (isLocked) {
     borderColor = 'border-emerald-400 bg-emerald-100 shadow-inner';
  } else if (isOver) {
    if (acceptType === ItemType.JOINT) {
      borderColor = 'border-sky-500 bg-sky-50/90';
    } else {
      borderColor = 'border-amber-500 bg-amber-50/90';
    }
  }
  
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