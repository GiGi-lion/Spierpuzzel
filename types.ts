export enum ItemType {
  JOINT = 'JOINT',
  FUNCTION = 'FUNCTION',
}

export interface PuzzleItem {
  id: string;
  text: string;
  type: ItemType;
  originalGroup: string; // Used to check correctness
}

export interface PuzzleRowData {
  id: string;
  muscleName: string;
  correctJoint: string;
  correctFunction: string;
}

export interface DragItem {
  id: string;
  type: ItemType;
  text: string;
}

export interface GameHistory {
  attemptNumber: number;
  percentage: number;
  timestamp: Date;
}