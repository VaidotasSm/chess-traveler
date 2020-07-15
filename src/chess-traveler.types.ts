export interface ChessGame {
  moves: ChessMove[];
}

export interface ChessMove {
  raw: string;
  comments: string[];
  variations: ChessMove[][];
}

export function Move(raw: string, variations: ChessMove[][] = [], comments: string[] = []): ChessMove {
  return { raw, variations, comments };
}

export interface CurrentMoveCoordinates {
  current: number[];
  history: number[][];
}

export const INITIAL_COORDINATES: CurrentMoveCoordinates = Object.freeze({ current: [0], history: [] });

export interface CurrentMove {
  line?: ChessMove[];
  move?: ChessMove;
  indexOnLine?: number;
}

export type MatchingMoveResult = { matchingMove?: ChessMove | null; isMain: boolean };

export interface IChessTraveler {
  coordinates: CurrentMoveCoordinates;

  moveForward: (mainLine: ChessMove[], newMove: ChessMove | null) => IChessTraveler;
  moveBack: () => IChessTraveler;

  getMove(mainLine: ChessMove[]): CurrentMove;
  getPreviousMadeMove(mainLine: ChessMove[]): CurrentMove;
  findMatchingMove(mainLine: ChessMove[], newMove?: string): MatchingMoveResult;
  toMoveHistoryLine(mainLine: ChessMove[]): ChessMove[];

  addVariation(
    mainLine: ChessMove[],
    newMove: string,
    options?: { immutable: boolean }
  ): { move: ChessMove; modifiedMainLine?: ChessMove[] };
  removeVariation(mainLine: ChessMove[], moveToRemove: ChessMove, options?: { immutable: boolean }): ChessMove[] | null;
  promoteVariation(
    mainLine: ChessMove[],
    moveToPromote: ChessMove,
    options?: { immutable: boolean }
  ): ChessMove[] | null;
}
