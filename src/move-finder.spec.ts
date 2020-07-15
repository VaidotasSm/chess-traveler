import { ChessMove, Move as M, INITIAL_COORDINATES } from './chess-traveler.types';
import {
  findMatchingMove,
  getMove,
  getPreviousMadeMove,
  isEndOfVariationReached,
  toMoveHistoryLine,
} from './move-finder';

describe('chess-traveler#move-finder', () => {
  describe('getMove - coordinate/move mapping', () => {
    const defaultMainLine: ChessMove[] = [
      M('d4', [
        [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
        [M('c4'), M('e5')],
      ]),
      M('d5'),
      M('c4'),
      M('e6'),
    ];

    describe('correct move retrieval', () => {
      it('should handle invalid cases', () => {
        expect(getMove(defaultMainLine, [3, 1, 2]).move).toBeUndefined();
        expect(getMove(defaultMainLine, [99]).move).toBeUndefined();
        expect(getMove(defaultMainLine, [-1]).move).toBeUndefined();
      });

      it('should handle problematic cases', () => {
        expect(getMove(defaultMainLine, []).move?.raw).toBe('d4');
        expect(getMove(defaultMainLine, [0]).move?.raw).toBe('d4');
        expect(getMove(defaultMainLine, [2]).move?.raw).toBe('c4');
      });

      it('should get correct move', () => {
        expect(getMove(defaultMainLine, [0, 0, 0]).move?.raw).toBe('e4');
        expect(getMove(defaultMainLine, [0, 0, 1]).move?.raw).toBe('e5');
        expect(getMove(defaultMainLine, [0, 0, 1, 0, 2]).move?.raw).toBe('d5');
        expect(getMove(defaultMainLine, [0, 1, 0]).move?.raw).toBe('c4');
      });

      it('should get correct move along the way', () => {
        expect(getMove(defaultMainLine, [0, 0, 1]).move?.raw).toBe('e5');
        expect(getMove(defaultMainLine, [0, 0, 1, 0, 1]).move?.raw).toBe('d4');
        expect(getMove(defaultMainLine, [0, 0, 1, 0, 2]).move?.raw).toBe('d5');
        expect(getMove(defaultMainLine, [0, 0, 1, 0, 3]).move).toBeUndefined();
      });
    });

    describe('correct line retrieval', () => {
      it('should non existing moves on main line', () => {
        expect(getMove(defaultMainLine, [99]).line).toEqual(defaultMainLine);
        expect(getMove(defaultMainLine, [-1]).line).toEqual(defaultMainLine);
      });

      it('should get correct line when main line', () => {
        expect(getMove(defaultMainLine, []).line).toEqual(defaultMainLine);
        expect(getMove(defaultMainLine, [0]).line).toEqual(defaultMainLine);
        expect(getMove(defaultMainLine, [2]).line).toEqual(defaultMainLine);
        expect(getMove(defaultMainLine, [2]).line).toEqual(defaultMainLine);
        expect(getMove(defaultMainLine, [3]).line).toEqual(defaultMainLine);
        expect(getMove(defaultMainLine, [4]).line).toEqual(defaultMainLine);
      });

      it('should return correct variation on non-existing moves in variation', () => {
        expect(getMove(defaultMainLine, [3, 1, 2]).line).toBeUndefined();
        expect(getMove(defaultMainLine, [0, 0, 99]).line).toEqual(defaultMainLine[0].variations[0]);
      });

      it('should get correct line when variation', () => {
        expect(getMove(defaultMainLine, [0, 0, 0]).line).toEqual(defaultMainLine[0].variations[0]);
        expect(getMove(defaultMainLine, [0, 0, 1]).line).toEqual(defaultMainLine[0].variations[0]);
        expect(getMove(defaultMainLine, [0, 0, 1, 0, 2]).line).toEqual(
          defaultMainLine[0].variations[0][1].variations[0]
        );
        expect(getMove(defaultMainLine, [0, 1, 0]).line).toEqual(defaultMainLine[0].variations[1]);
      });
    });

    describe('correct indexOnLine retrieval', () => {
      it('should non existing moves on main line', () => {
        expect(getMove(defaultMainLine, [99]).indexOnLine).toBeUndefined();
        expect(getMove(defaultMainLine, [-1]).indexOnLine).toBeUndefined();
      });

      it('should get correct line when main line', () => {
        expect(getMove(defaultMainLine, []).indexOnLine).toBe(0);
        expect(getMove(defaultMainLine, [0]).indexOnLine).toBe(0);
        expect(getMove(defaultMainLine, [2]).indexOnLine).toBe(2);
        expect(getMove(defaultMainLine, [2]).indexOnLine).toBe(2);
        expect(getMove(defaultMainLine, [3]).indexOnLine).toBe(3);
        expect(getMove(defaultMainLine, [4]).indexOnLine).toBeUndefined();
      });

      it('should return correct variation on non-existing moves in variation', () => {
        expect(getMove(defaultMainLine, [3, 1, 2]).indexOnLine).toBeUndefined();
        expect(getMove(defaultMainLine, [0, 0, 99]).indexOnLine).toBeUndefined();
      });

      it('should get correct line when variation', () => {
        expect(getMove(defaultMainLine, [0, 0, 0]).indexOnLine).toBe(0);
        expect(getMove(defaultMainLine, [0, 0, 1]).indexOnLine).toBe(1);
        expect(getMove(defaultMainLine, [0, 0, 1, 0, 2]).indexOnLine).toBe(2);
        expect(getMove(defaultMainLine, [0, 1, 0]).indexOnLine).toBe(0);
      });
    });
  });

  describe('getPreviousMadeMove', () => {
    it('should handle navigation of second move', () => {
      const mainLine: ChessMove[] = [M('d4'), M('d5', [[M('Nf6')]])];
      const cords = {
        current: [1, 0, 1],
        history: [[0], [1]],
      };

      expect(getPreviousMadeMove(mainLine, cords)?.move?.raw).toBe('Nf6');
    });
  });

  describe('findMatchingMove - find move among current move or its variations', () => {
    const mainLine: ChessMove[] = [
      M('d4', [
        [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
        [M('c4'), M('e5')],
      ]),
      M('d5'),
      M('c4'),
      M('e6'),
    ];

    it('should find main line move when no variations exist', () => {
      const { matchingMove } = findMatchingMove(mainLine, { current: [1], history: [[0]] }, 'd5');
      expect(matchingMove?.raw).toBe('d5');
    });

    it('should find main line move when variations exist', () => {
      const { matchingMove } = findMatchingMove(mainLine, { current: [0], history: [] }, 'd4');
      expect(matchingMove?.raw).toBe('d4');
    });

    it('should find variation move', () => {
      let res = findMatchingMove(mainLine, { current: [0], history: [] }, 'e4');
      expect(res.matchingMove?.raw).toBe('e4');

      res = findMatchingMove(mainLine, { current: [0], history: [] }, 'c4');
      expect(res.matchingMove?.raw).toBe('c4');
    });
  });

  describe('isEndOfVariationReached - check if last move from move tree was made', () => {
    const mainLine: ChessMove[] = [
      M('d4', [
        [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
        [M('c4'), M('e5')],
      ]),
      M('d5'),
    ];

    it('should be true when empty main line (no moves present at all)', () => {
      let res = isEndOfVariationReached([], INITIAL_COORDINATES);
      expect(res).toEqual({ isEndReached: true, line: [] });

      res = isEndOfVariationReached([], { current: [0], history: [] });
      expect(res).toEqual({ isEndReached: true, line: [] });
    });

    it('should be true when reached end of main line', () => {
      const res = isEndOfVariationReached(mainLine, { current: [2], history: [[0], [1]] });
      expect(res).toEqual({ isEndReached: true, line: mainLine });
    });

    it('should be false when in main line', () => {
      let res = isEndOfVariationReached(mainLine, { current: [0], history: [] });
      expect(res).toEqual({ isEndReached: false, line: mainLine });

      res = isEndOfVariationReached(mainLine, { current: [1], history: [[0]] });
      expect(res).toEqual({ isEndReached: false, line: mainLine });
    });

    it('should be true when reached end of variation', () => {
      const res = isEndOfVariationReached(mainLine, { current: [0, 0, 2], history: [[0], [0, 0, 1]] });
      expect(res).toEqual({ isEndReached: true, line: mainLine[0].variations[0] });
    });

    it('should be false when in variation', () => {
      let res = isEndOfVariationReached(mainLine, { current: [0, 0, 0], history: [[0]] });
      expect(res).toEqual({ isEndReached: false, line: mainLine[0].variations[0] });

      res = isEndOfVariationReached(mainLine, { current: [0, 0, 1], history: [[0], [0, 0, 0]] });
      expect(res).toEqual({ isEndReached: false, line: mainLine[0].variations[0] });
    });

    it('should handle x', () => {
      const mLine = [M('e4', [[M('d4')]]), M('c5')];

      const res = isEndOfVariationReached(mLine, {
        current: [0, 0, 1],
        history: [[0]],
      });
      expect(res).toEqual({
        isEndReached: true,
        line: mLine[0].variations[0],
      });
    });
  });

  describe('toMoveHistoryLine()', () => {
    const mainLine = [M('e4'), M('c5', [[M('e6'), M('d4')]]), M('Nf3')];

    const variationTestCases = [
      ['when straight line', mainLine, [[0], [1], [2]], ['e4', 'c5', 'Nf3']],
      ['when variations', mainLine, [[0], [1], [1, 0, 1]], ['e4', 'e6', 'd4']],
    ];

    it.each(variationTestCases)('should map to moves %s', (_msg, mLine, historyCords, expectedResult) => {
      const historyMoves = toMoveHistoryLine(mLine as ChessMove[], historyCords as number[][]);

      expect(historyMoves.map((m) => m.raw)).toEqual(expectedResult);
    });
  });
});
