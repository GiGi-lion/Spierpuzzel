import { PuzzleRowData, PuzzleItem, ItemType } from './types';

// Raw data structure representing the rows in the puzzle
export const PUZZLE_DATA: PuzzleRowData[] = [
  {
    id: 'deltoideus',
    muscleName: 'M. Deltoïdeus',
    correctJoint: 'Schouder',
    correctFunction: 'Abductie (ante-/retroflexie + endo-/exorotatie)'
  },
  {
    id: 'triceps-1',
    muscleName: 'M. Triceps brachii',
    correctJoint: 'Elleboog',
    correctFunction: 'Extensie'
  },
  {
    id: 'triceps-2',
    muscleName: 'M. Triceps brachii',
    correctJoint: 'Schouder',
    correctFunction: 'Retroflexie (adductie)'
  },
  {
    id: 'biceps-1',
    muscleName: 'M. Biceps brachii',
    correctJoint: 'Elleboog',
    correctFunction: 'Flexie (supinatie)'
  },
  {
    id: 'biceps-2',
    muscleName: 'M. Biceps brachii',
    correctJoint: 'Schouder',
    correctFunction: 'Anteflexie (ad-/abductie +endorotatie)'
  },
  {
    id: 'pectoralis',
    muscleName: 'M. Pectoralis major',
    correctJoint: 'Schouder',
    correctFunction: 'Adductie Anteflexie (endorotatie)'
  },
  {
    id: 'latissimus',
    muscleName: 'M. Latissimus dorsi',
    correctJoint: 'Schouder',
    correctFunction: 'Adductie Retroflexie (endorotatie)'
  },
  {
    id: 'erector',
    muscleName: 'M. Erector spinae',
    correctJoint: 'Wervelkolom',
    correctFunction: 'Lateroflexie Extensie (rotatie)'
  },
  {
    id: 'abdominis-1',
    muscleName: 'M. Abdominis',
    correctJoint: 'Wervelkolom',
    correctFunction: 'Ventraal-/ anteflexie (rotatie)'
  },
  {
    id: 'abdominis-2',
    muscleName: 'M. Abdominis',
    correctJoint: 'Bekken',
    correctFunction: 'Achterover kantelen'
  },
  {
    id: 'gluteus',
    muscleName: 'M. Gluteus maximus',
    correctJoint: 'Heup',
    correctFunction: 'Retroflexie Exorotatie (ab-/adductie)'
  },
  {
    id: 'hamstrings-1',
    muscleName: 'Hamstrings',
    correctJoint: 'Knie',
    correctFunction: 'Flexie (endo-/exorotatie)'
  },
  {
    id: 'hamstrings-2',
    muscleName: 'Hamstrings',
    correctJoint: 'Heup',
    correctFunction: 'Retroflexie (adductie + exorotatie)'
  },
  {
    id: 'quadriceps-1',
    muscleName: 'M. Quadriceps femoris',
    correctJoint: 'Knie',
    correctFunction: 'Extensie'
  },
  {
    id: 'quadriceps-2',
    muscleName: 'M. Quadriceps femoris',
    correctJoint: 'Heup',
    correctFunction: 'Anteflexie'
  },
  {
    id: 'gastrocnemius-1',
    muscleName: 'M. Gastrocnemius',
    correctJoint: 'Knie',
    correctFunction: 'Flexie'
  },
  {
    id: 'gastrocnemius-2',
    muscleName: 'M. Gastrocnemius',
    correctJoint: 'Enkel',
    correctFunction: 'Plantairflexie'
  },
  {
    id: 'soleus',
    muscleName: 'M. Soleus',
    correctJoint: 'Enkel',
    correctFunction: 'Plantairflexie (inversie)'
  },
  {
    id: 'tibialis',
    muscleName: 'M. Tibialis Anterior',
    correctJoint: 'Enkel',
    correctFunction: 'Dorsaalflexie'
  }
];

// Helper to generate unique game items from the data
export const generateGameItems = (): { joints: PuzzleItem[], functions: PuzzleItem[] } => {
  const joints: PuzzleItem[] = [];
  const functions: PuzzleItem[] = [];

  PUZZLE_DATA.forEach((row) => {
    // Create a unique Joint card for this row
    joints.push({
      id: `item-joint-${row.id}`,
      text: row.correctJoint,
      type: ItemType.JOINT,
      originalGroup: row.id, // We verify correctness by checking if the item's originalGroup matches the row ID
    });

    // Create a unique Function card for this row
    functions.push({
      id: `item-func-${row.id}`,
      text: row.correctFunction,
      type: ItemType.FUNCTION,
      originalGroup: row.id,
    });
  });

  // Shuffle logic should happen in the component state, this just returns the set
  return { joints, functions };
};