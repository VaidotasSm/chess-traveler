import { ChessMove, CurrentMove, CurrentMoveCoordinates, MatchingMoveResult } from './chess-traveler.types';
import { getLast, replaceLast } from './chess.traveler.utils';

export function getMove(mainLine: ChessMove[], coordinates: number[] = []): CurrentMove {
  if (coordinates.length === 1) {
    const move = mainLine[coordinates[0]];
    return {
      move,
      line: mainLine,
      indexOnLine: move && coordinates[0],
    };
  }
  if (coordinates.length === 0) {
    return {
      move: mainLine[0],
      line: mainLine,
      indexOnLine: 0,
    };
  }
  if ((coordinates.length - 1) % 2 !== 0) {
    return {};
  }

  // eslint-disable-next-line prefer-const
  let [index, ...cords] = coordinates;
  let move: ChessMove | undefined = mainLine[index];
  let line: ChessMove[] | undefined;
  let indexOnLine = index;
  while (cords.length > 0) {
    const [i1, i2, ...remainder] = cords;
    line = move?.variations[i1];
    move = line && line[i2];
    indexOnLine = move && i2;

    cords = remainder;
  }

  return { line, move, indexOnLine };
}

export function getPreviousMadeMove(mainLine: ChessMove[], cords: CurrentMoveCoordinates): CurrentMove {
  if (!cords?.current?.length || !cords.history?.length) {
    return {};
  }

  if (cords.current.length > 1 && getLast(cords.current) === 1) {
    // first variation move is actual one made, instead of pointer move for navigation
    return getMove(mainLine, replaceLast([...cords.current], 0));
  }

  return getMove(mainLine, getLast(cords.history));
}

export function findMatchingMove(
  mainLine: ChessMove[],
  c: CurrentMoveCoordinates,
  newMove?: string,
): MatchingMoveResult {
  if (!mainLine) {
    throw new Error('mainLine cannot be empty');
  }
  if (mainLine.length === 0) {
    return { isMain: false };
  }

  const { move } = getMove(mainLine, c.current);
  if (!move) {
    return { isMain: false };
  }

  if (move.raw === newMove) {
    return { matchingMove: move, isMain: true };
  }
  const variation = move.variations.find((v) => v[0].raw === newMove);
  if (variation) {
    return { matchingMove: variation[0], isMain: false };
  }

  return { isMain: false };
}

/**
 * Check if last move from move tree was made
 */
export function isEndOfVariationReached(
  mainLine: ChessMove[],
  cords: CurrentMoveCoordinates,
): { isEndReached: boolean; line: ChessMove[] } {
  if (!cords.history.length) {
    return {
      isEndReached: mainLine.length === 0,
      line: mainLine,
    };
  }

  const { move: currentMove, line: currentLine } = getMove(mainLine, cords.current);
  if (!currentLine) {
    throw new Error('line cannot be empty');
  }

  if (currentMove) {
    // Next move exists - end of line is not reached yet
    return {
      isEndReached: false,
      line: currentLine,
    };
  }

  if (getLast(cords.current) === 1 && currentLine.length === 1) {
    // adjust for first of variation - [0, 0, 0] won't exist in history
    return {
      isEndReached: true,
      line: currentLine,
    };
  }

  const { move: previousMove } = getMove(mainLine, getLast(cords.history));

  const isAfterLast = getLast(currentLine)?.raw === previousMove?.raw;
  return {
    isEndReached: isAfterLast,
    line: currentLine,
  };
}

export function toMoveHistoryLine(mainLine: ChessMove[], history: number[][]): ChessMove[] {
  return history.map((cords, i) => {
    const cordsNext = history[i + 1];
    if (cordsNext && cordsNext.length > cords.length) {
      const cordsNextClone = [...cordsNext];
      cordsNextClone.pop();
      cordsNextClone.push(0);
      const { move } = getMove(mainLine, cordsNextClone);
      return move!;
    }

    const { move } = getMove(mainLine, cords);
    return move!;
  });
}
