import _ from 'lodash';
import { ChessMove, CurrentMoveCoordinates, Move } from './chess-traveler.types';
import { replaceArrayItems } from './chess.traveler.utils';
import { findMatchingMove, getMove, isEndOfVariationReached } from './move-finder';

export function addVariation(
  mainLine: ChessMove[],
  c: CurrentMoveCoordinates,
  newMove: string,
  options: { immutable: boolean } = { immutable: true }
): { move: ChessMove; modifiedMainLine?: ChessMove[] } {
  const { matchingMove } = findMatchingMove(mainLine, c, newMove);
  if (matchingMove) {
    return { move: matchingMove };
  }

  const modifiedMainLine = options.immutable ? _.cloneDeep(mainLine) : mainLine;
  const { isEndReached, line } = isEndOfVariationReached(modifiedMainLine, c);
  if (isEndReached) {
    const moveNew = Move(newMove);
    line.push(moveNew);
    return { move: moveNew, modifiedMainLine };
  }

  const { move } = getMove(modifiedMainLine, c.current);
  if (!move) {
    throw new Error('Move at coordinates does not exist at all');
  }
  const moveNew = Move(newMove);
  move.variations = [...move.variations, [moveNew]];
  return { move: moveNew, modifiedMainLine };
}

export function removeVariation(
  mainLine: ChessMove[],
  c: CurrentMoveCoordinates,
  moveToRemove: ChessMove,
  options: { immutable: boolean } = { immutable: true }
): ChessMove[] | null {
  const modifiedMainLine = options.immutable ? _.cloneDeep(mainLine) : mainLine;

  const { move, line, indexOnLine } = getMove(modifiedMainLine, c.current);
  if (!move || _.isNil(indexOnLine) || !line) {
    return null;
  }

  const { matchingMove, isMain } = findMatchingMove(modifiedMainLine, c, moveToRemove.raw);

  if (!isMain) {
    // remove variation
    move.variations = move.variations.filter((variation) => variation[0] !== matchingMove);
    return modifiedMainLine;
  }

  // remove main line
  const { firstPart } = splitLineFromIndex(line, indexOnLine);
  replaceArrayItems(line, firstPart);
  line.push(...getPromotedFirstVariation(move));

  return modifiedMainLine;
}

function splitLineFromIndex(
  lineOriginal: ChessMove[],
  startIndexSecondPart: number
): { firstPart: ChessMove[]; secondPart: ChessMove[] } {
  if (!lineOriginal) {
    throw new Error('line cannot be nil');
  }
  if (_.isNil(startIndexSecondPart)) {
    throw new Error('indexOnLine cannot be nil');
  }
  if (!lineOriginal.length) {
    return { firstPart: [], secondPart: [] };
  }

  const firstPart = [...lineOriginal];
  const secondPart = [];
  for (let i = firstPart.length - 1; i >= startIndexSecondPart!; i--) {
    const m = firstPart!.pop();
    if (m) {
      secondPart.unshift(m);
    }
  }

  return { firstPart, secondPart };
}

function getPromotedFirstVariation(move: ChessMove): ChessMove[] {
  const [firstVariation, ...otherVariations] = move.variations;
  if (!firstVariation) {
    return [];
  }

  firstVariation[0].variations = otherVariations;
  return firstVariation;
}

export function promoteVariation(
  mainLine: ChessMove[],
  cords: number[],
  moveToPromote: ChessMove,
  options: { immutable: boolean } = { immutable: true }
): ChessMove[] | null {
  const modifiedMainLine = options.immutable ? _.cloneDeep(mainLine) : mainLine;

  const { move: mainMove, line, indexOnLine } = getMove(modifiedMainLine, cords);
  if (!mainMove || _.isNil(indexOnLine) || !line) {
    return null;
  }

  const variationToPromote = mainMove.variations
    .map((variation, i) => ({ variation, index: i }))
    .find(({ variation }) => variation[0].raw === moveToPromote.raw);
  if (!variationToPromote) {
    return null;
  }

  // swap with MainMove
  if (variationToPromote.index === 0) {
    // replace main with first variation
    const { firstPart, secondPart } = splitLineFromIndex(line, indexOnLine);
    const firstVariation = getPromotedFirstVariation(mainMove);
    firstVariation[0].variations = [secondPart, ...firstVariation[0].variations];
    firstPart.push(...firstVariation);

    mainMove.variations = [];
    replaceArrayItems(line, firstPart);
    return modifiedMainLine;
  }

  // replace two variations
  const firstVariationIndex = variationToPromote.index - 1;
  const firstVariation: ChessMove[] = mainMove.variations[firstVariationIndex];

  mainMove.variations = mainMove.variations.map((variation) => {
    if (variation === firstVariation) {
      return variationToPromote.variation;
    }
    if (variation === variationToPromote.variation) {
      return firstVariation!;
    }
    return variation;
  });

  return modifiedMainLine;
}
