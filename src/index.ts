import { moveBack, moveForward } from './chess-traveler';
import { findMatchingMove, getMove, getPreviousMadeMove, toMoveHistoryLine } from './move-finder';
import { addVariation, promoteVariation, removeVariation } from './variations';
import { CurrentMoveCoordinates, INITIAL_COORDINATES, ChessMove, IChessTraveler } from './chess-traveler.types';

export * from './chess-traveler.types';
export {
  moveForward,
  moveBack,
  getMove,
  getPreviousMadeMove,
  findMatchingMove,
  toMoveHistoryLine,
  addVariation,
  removeVariation,
  promoteVariation,
};

export function Traveler(coords: CurrentMoveCoordinates = INITIAL_COORDINATES): IChessTraveler {
  return new ChessTraveler(coords);
}

class ChessTraveler implements IChessTraveler {
  public readonly coordinates: CurrentMoveCoordinates;
  constructor(coords: CurrentMoveCoordinates = INITIAL_COORDINATES) {
    this.coordinates = coords;
  }

  moveForward(mainLine: ChessMove[], newMove: ChessMove | null = null) {
    return new ChessTraveler(moveForward(mainLine, this.coordinates, newMove));
  }
  moveBack() {
    return new ChessTraveler(moveBack(this.coordinates));
  }

  getMove(mainLine: ChessMove[]) {
    return getMove(mainLine, this.coordinates.current);
  }
  getPreviousMadeMove(mainLine: ChessMove[]) {
    return getPreviousMadeMove(mainLine, this.coordinates);
  }
  findMatchingMove(mainLine: ChessMove[], newMove?: string) {
    return findMatchingMove(mainLine, this.coordinates, newMove);
  }
  toMoveHistoryLine(mainLine: ChessMove[]): ChessMove[] {
    return toMoveHistoryLine(mainLine, this.coordinates.history);
  }

  addVariation(mainLine: ChessMove[], newMove: string, options: { immutable: boolean } = { immutable: true }) {
    return addVariation(mainLine, this.coordinates, newMove, options);
  }
  removeVariation(
    mainLine: ChessMove[],
    moveToRemove: ChessMove,
    options: { immutable: boolean } = { immutable: true },
  ) {
    return removeVariation(mainLine, this.coordinates, moveToRemove, options);
  }
  promoteVariation(
    mainLine: ChessMove[],
    moveToPromote: ChessMove,
    options: { immutable: boolean } = { immutable: true },
  ) {
    return promoteVariation(mainLine, this.coordinates.current, moveToPromote, options);
  }
}
