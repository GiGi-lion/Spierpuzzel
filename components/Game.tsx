import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import confetti from 'canvas-confetti';
import { PUZZLE_DATA, generateGameItems } from '../constants';
import { PuzzleItem, ItemType, GameHistory, PuzzleRowData } from '../types';
import { PuzzlePiece } from './PuzzlePiece';
import { PuzzleSlot } from './PuzzleSlot';
import { History, RotateCcw, CheckCircle, TriangleAlert, Puzzle } from 'lucide-react';

const STORAGE_KEY = 'han-alo-puzzle-state-v1';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export const Game: React.FC = () => {
  // State for items in the "bank" (not placed)
  const [bankItems, setBankItems] = useState<PuzzleItem[]>([]);
  
  // State for items placed in slots: Key = SlotID, Value = ItemID
  const [placements, setPlacements] = useState<Record<string, string>>({});
  
  // State for tracking correct slots after checking
  const [correctSlots, setCorrectSlots] = useState<Set<string>>(new Set());
  
  // UI State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItemDimensions, setActiveItemDimensions] = useState<{ width: number; height: number } | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Map of all items for easy lookup
  const allItemsMap = useMemo(() => {
    const { joints, functions } = generateGameItems();
    const map = new Map<string, PuzzleItem>();
    [...joints, ...functions].forEach(i => map.set(i.id, i));
    return map;
  }, []);

  // Group muscles to remove duplicates in the list view
  const groupedMuscles = useMemo(() => {
    const groups: Record<string, PuzzleRowData[]> = {};
    PUZZLE_DATA.forEach(row => {
       if (!groups[row.muscleName]) groups[row.muscleName] = [];
       groups[row.muscleName].push(row);
    });
    // Sort groups alphabetically by muscle name
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBankItems(parsed.bankItems);
        setPlacements(parsed.placements);
        setHistory(parsed.history);
        setCurrentAttempt(parsed.currentAttempt);
        setIsLoaded(true);
      } catch (e) {
        console.error("Failed to load save, resetting...", e);
        resetGame(false);
      }
    } else {
      resetGame(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (!isLoaded && bankItems.length === 0) return; // Don't save empty state before load

    const state = {
      bankItems,
      placements,
      history,
      currentAttempt
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [bankItems, placements, history, currentAttempt, isLoaded]);

  const resetGame = (clearHistory: boolean) => {
    const { joints, functions } = generateGameItems();
    // Shuffle items for the internal state
    const shuffled = [...joints, ...functions].sort(() => Math.random() - 0.5);
    setBankItems(shuffled);
    setPlacements({});
    setCorrectSlots(new Set());
    setLastScore(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (clearHistory) {
      setHistory([]);
      setCurrentAttempt(1);
    }
    setIsLoaded(true);
  };

  const handleResetClick = () => {
    if (Object.keys(placements).length > 0 || history.length > 0) {
      if (window.confirm("Weet je zeker dat je opnieuw wilt beginnen? Je huidige voortgang en scoregeschiedenis gaan verloren.")) {
        resetGame(true);
      }
    } else {
      resetGame(true);
    }
  };

  // Configure sensors - Removed TouchSensor and Mouse Constraints for direct PC feel
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const currentId = active.id as string;
    setActiveId(currentId);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCorrectSlots(new Set());

    // Prioritize direct DOM measurement for exact visual match
    const node = document.getElementById(currentId);
    if (node) {
      const rect = node.getBoundingClientRect();
      setActiveItemDimensions({
        width: rect.width,
        height: rect.height
      });
    } else if (active.rect.current.initial) {
      // Fallback to dnd-kit internal measurement
      setActiveItemDimensions({
        width: active.rect.current.initial.width,
        height: active.rect.current.initial.height
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    setActiveId(null);
    setActiveItemDimensions(null);

    if (!over) return;

    const overId = over.id as string;
    const isOverSlot = overId.startsWith('slot-');
    const isOverBank = overId === 'bank-droppable' || overId === 'bank-joints' || overId === 'bank-funcs';

    const currentSlotId = Object.keys(placements).find(key => placements[key] === activeId);
    
    if (isOverSlot) {
       const itemType = allItemsMap.get(activeId)?.type;
       if (!overId.includes(itemType === ItemType.JOINT ? 'joint' : 'func')) {
         return;
       }

       const existingItemInTarget = placements[overId];
       const newPlacements = { ...placements };
       
       if (currentSlotId) {
         delete newPlacements[currentSlotId];
       } else {
         setBankItems(items => items.filter(i => i.id !== activeId));
       }

       if (existingItemInTarget) {
         if (currentSlotId) {
           newPlacements[currentSlotId] = existingItemInTarget;
         } else {
           const item = allItemsMap.get(existingItemInTarget);
           if (item) setBankItems(prev => [...prev, item]);
         }
       }

       newPlacements[overId] = activeId;
       setPlacements(newPlacements);
    } else if (isOverBank) {
      if (currentSlotId) {
        const newPlacements = { ...placements };
        delete newPlacements[currentSlotId];
        setPlacements(newPlacements);
        
        const item = allItemsMap.get(activeId);
        if (item) setBankItems(prev => [...prev, item]);
      }
    }
  };

  const checkAnswers = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const totalSlots = PUZZLE_DATA.length * 2;
    const filledSlots = Object.keys(placements).length;

    if (filledSlots < totalSlots) {
      setErrorMessage("Je hebt nog niet alles ingevuld");
      return;
    }

    let correctUserPlacements = 0;
    const newCorrectSlots = new Set<string>();

    // Iterate through each muscle group to validate
    groupedMuscles.forEach(([_, rows]) => {
        // Get valid options for this muscle (Texts)
        const validJoints = rows.map(r => r.correctJoint);
        const validFunctions = rows.map(r => r.correctFunction);
        
        // Get user placed items for this muscle
        rows.forEach(row => {
            const jointSlotId = `slot-joint-${row.id}`;
            const funcSlotId = `slot-func-${row.id}`;
            
            const placedJointId = placements[jointSlotId];
            const placedFuncId = placements[funcSlotId];
            
            // Check Joint
            if (placedJointId) {
                const item = allItemsMap.get(placedJointId);
                const matchIndex = validJoints.indexOf(item?.text || '');
                if (matchIndex !== -1) {
                    validJoints.splice(matchIndex, 1); 
                    correctUserPlacements++;
                    newCorrectSlots.add(jointSlotId);
                }
            }
            
            // Check Function
            if (placedFuncId) {
                const item = allItemsMap.get(placedFuncId);
                const matchIndex = validFunctions.indexOf(item?.text || '');
                if (matchIndex !== -1) {
                    validFunctions.splice(matchIndex, 1);
                    correctUserPlacements++;
                    newCorrectSlots.add(funcSlotId);
                }
            }
        });
    });

    setCorrectSlots(newCorrectSlots);

    const percentage = Math.round((correctUserPlacements / totalSlots) * 100);
    setLastScore(percentage);
    
    const newEntry: GameHistory = {
      attemptNumber: currentAttempt,
      percentage: percentage,
      timestamp: new Date()
    };
    
    setHistory(prev => [newEntry, ...prev]);
    setCurrentAttempt(prev => prev + 1);

    if (percentage === 100) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      setSuccessMessage("Gefeliciteerd! Alles is correct.");
    }
  };

  const jointsInBank = bankItems
    .filter(i => i.type === ItemType.JOINT)
    .sort((a, b) => a.text.localeCompare(b.text));

  const functionsInBank = bankItems
    .filter(i => i.type === ItemType.FUNCTION)
    .sort((a, b) => a.text.localeCompare(b.text));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 
        GLOBAL HEADER - OUTSIDE DndContext 
        This guarantees buttons are interactive because DndKit is not listening here.
      */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-indigo-100 p-4 shadow-md z-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Puzzle className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-indigo-950 leading-none">Spierpuzzel</h1>
                <p className="text-indigo-900/70 text-sm font-medium font-serif italic">HAN-ALO (c)</p>
              </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handleResetClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-white hover:text-indigo-700 transition-colors shadow-sm active:scale-95 transform cursor-pointer"
              >
                <RotateCcw size={16} />
                Opnieuw
              </button>
              
              <button 
                onClick={checkAnswers}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-900/20 active:scale-95 transform cursor-pointer"
              >
                <CheckCircle size={18} />
                Nakijken
              </button>
          </div>
      </header>

      {/* MAIN GAME AREA - WRAPPED IN DNDCONTEXT */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: BANK (Scrollable) - Removed hidden on mobile */}
          <div 
            id="bank-droppable"
            className="w-[30%] md:w-[25%] bg-white/90 backdrop-blur-md border-r border-white/50 p-4 overflow-y-auto shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 border-b border-indigo-100 pb-2">
              <h2 className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Puzzelstukken</h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">{bankItems.length}</span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xs text-sky-700 uppercase tracking-widest mb-2 sticky top-0 bg-white/95 py-1 z-10">Gewrichten</h3>
                <div className="space-y-2 min-h-[20px]">
                  {jointsInBank.length === 0 && functionsInBank.length > 0 && <div className="text-xs text-gray-400 italic">Op</div>}
                  {jointsInBank.map(item => (
                    <PuzzlePiece key={item.id} id={item.id} text={item.text} type={item.type} />
                  ))}
                </div>
              </div>

              <div>
                 <h3 className="font-bold text-xs text-amber-700 uppercase tracking-widest mb-2 sticky top-0 bg-white/95 py-1 z-10">Functies</h3>
                 <div className="space-y-2 min-h-[20px]">
                  {functionsInBank.map(item => (
                    <PuzzlePiece key={item.id} id={item.id} text={item.text} type={item.type} />
                  ))}
                 </div>
              </div>
            </div>
          </div>

          {/* CENTER: BOARD (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
             {/* Messages */}
            {successMessage && (
               <div className="mb-6 p-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 text-emerald-800 flex items-center gap-3 shadow-md max-w-3xl mx-auto">
                 <CheckCircle size={20} className="text-emerald-500" />
                 <span className="font-bold">{successMessage}</span>
               </div>
            )}
            {errorMessage && (
               <div className="mb-6 p-4 rounded-xl border-l-4 border-red-500 bg-white/95 text-red-800 flex items-center gap-3 shadow-md max-w-3xl mx-auto">
                 <TriangleAlert size={20} className="text-red-500" />
                 <span className="font-bold">{errorMessage}</span>
               </div>
            )}
            {lastScore !== null && !errorMessage && !successMessage && (
              <div className={`mb-6 p-6 rounded-xl border-l-4 shadow-xl backdrop-blur-md flex items-center justify-between max-w-3xl mx-auto ${lastScore === 100 ? 'bg-emerald-50/95 border-emerald-500 text-emerald-900' : 'bg-orange-50/95 border-orange-500 text-orange-900'}`}>
                <div>
                  <span className="font-serif font-bold text-2xl block mb-1">{lastScore}% Correct</span>
                  <span className="font-medium opacity-80">{lastScore === 100 ? 'Uitstekend!' : `Poging ${currentAttempt - 1}`}</span>
                </div>
                <div className="text-4xl font-serif font-black opacity-20">{lastScore}%</div>
              </div>
            )}

            {/* Removed Mobile Bank component here */}

            <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto pb-20">
              {/* Header Row */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 text-xs font-bold text-white uppercase tracking-widest px-6 py-3 bg-gradient-to-r from-indigo-900 via-sky-800 to-indigo-900 rounded-t-lg backdrop-blur-sm mx-1 shadow-md">
                <div className="col-span-4">Spier</div>
                <div className="col-span-3">Gewricht</div>
                <div className="col-span-5">Hoofdfunctie</div>
              </div>

              {groupedMuscles.map(([muscleName, rows]) => (
                <div key={muscleName} className="bg-white/85 backdrop-blur rounded-xl shadow-lg border border-white/50 overflow-hidden md:grid md:grid-cols-12 md:gap-0">
                  <div className="col-span-12 md:col-span-4 p-4 md:p-6 bg-indigo-50/60 flex flex-col justify-center border-b md:border-b-0 md:border-r border-indigo-100">
                    <h3 className="text-lg font-bold text-indigo-950 leading-tight">{muscleName}</h3>
                  </div>
                  <div className="col-span-12 md:col-span-8 grid grid-cols-1">
                    {rows.map((row, index) => (
                      <div key={row.id} className={`grid grid-cols-1 md:grid-cols-8 gap-4 p-4 items-center ${index !== rows.length - 1 ? 'border-b border-indigo-100/50' : ''}`}>
                        <div className="md:col-span-3">
                          <PuzzleSlot 
                              id={`slot-joint-${row.id}`} 
                              acceptType={ItemType.JOINT}
                          >
                            {placements[`slot-joint-${row.id}`] && (
                              <PuzzlePiece 
                                id={placements[`slot-joint-${row.id}`]} 
                                text={allItemsMap.get(placements[`slot-joint-${row.id}`])?.text || ''} 
                                type={ItemType.JOINT} 
                                isCorrect={correctSlots.has(`slot-joint-${row.id}`)}
                              />
                            )}
                          </PuzzleSlot>
                        </div>
                        <div className="md:col-span-5">
                          <PuzzleSlot 
                              id={`slot-func-${row.id}`} 
                              acceptType={ItemType.FUNCTION}
                          >
                            {placements[`slot-func-${row.id}`] && (
                              <PuzzlePiece 
                                id={placements[`slot-func-${row.id}`]} 
                                text={allItemsMap.get(placements[`slot-func-${row.id}`])?.text || ''} 
                                type={ItemType.FUNCTION} 
                                isCorrect={correctSlots.has(`slot-func-${row.id}`)}
                              />
                            )}
                          </PuzzleSlot>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: HISTORY (Scrollable) - Removed hidden on mobile/tablet */}
          <div className="w-[250px] bg-white/80 backdrop-blur-md border-l border-white/50 p-4 overflow-y-auto hidden xl:block">
             <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold text-lg border-b border-indigo-200/50 pb-2">
               <History size={20} />
               <h3>Scoreverloop</h3>
             </div>
             <div className="space-y-3">
               {history.length === 0 && (
                 <p className="text-sm text-indigo-400 italic text-center py-4">Nog geen pogingen.</p>
               )}
               {history.map((h, i) => (
                 <div key={i} className="bg-white/80 p-3 rounded-lg shadow-sm border border-white flex flex-col gap-1 text-sm">
                   <div className="flex justify-between items-center">
                      <span className="text-indigo-800 font-medium">Poging {h.attemptNumber}</span>
                      <span className={`font-bold ${h.percentage === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {h.percentage}%
                      </span>
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId ? (
              <PuzzlePiece 
                id={activeId} 
                text={allItemsMap.get(activeId)?.text || ''} 
                type={allItemsMap.get(activeId)?.type || ItemType.JOINT}
                isOverlay 
                style={activeItemDimensions ? { 
                  width: activeItemDimensions.width, 
                  // Only constraining width to allow height to adapt to potential layout differences in overlay
                } : undefined}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};