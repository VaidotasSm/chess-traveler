import { CurrentMoveCoordinates, ChessMove, INITIAL_COORDINATES } from './chess-traveler.types';
import { incrementLast } from './chess.traveler.utils';
import { getMove } from './move-finder';

export function moveForward(
  mainLine: ChessMove[],
  coords: CurrentMoveCoordinates = INITIAL_COORDINATES,
  newMove: ChessMove | null = null,
): CurrentMoveCoordinates {
  const { current: coordinates, history } = coords;
  const { move } = getMove(mainLine, coordinates);
  if (!move) {
    throw new Error('Incorrect coordinates - could not find current move');
  }

  if (!newMove || move.raw === newMove.raw) {
    return {
      current: incrementLast([...coordinates]),
      history: [...(history || []), coordinates],
    };
  }

  let variationIndex: number;
  const matchingVariation: ChessMove[] | undefined = move.variations.find((variation, i) => {
    variationIndex = i;
    return variation[0]?.raw === newMove.raw;
  });
  if (!matchingVariation) {
    throw new Error('Incorrect coordinates - new move is not present on move tree');
  }

  const cords = [...coordinates];
  cords.push(variationIndex!);
  cords.push(1); // adjust for first of variation - 0 is previous move
  return {
    current: cords,
    history: [...(history || []), coordinates],
  };
}

export function moveBack(c: CurrentMoveCoordinates): CurrentMoveCoordinates {
  const { history } = c;

  const newHistory = [...history];
  const newCurrent = newHistory.pop();
  if (!newCurrent) {
    throw new Error('Incorrect coordinate history');
  }
  return {
    current: newCurrent,
    history: newHistory,
  };
}
