import { moveBack, moveForward } from './chess-traveler';
import { ChessMove, CurrentMoveCoordinates, Move as M, INITIAL_COORDINATES } from './chess-traveler.types';

const defaultMainLine: ChessMove[] = [
  M('d4', [
    [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
    [M('c4'), M('e5')],
  ]),
  M('d5'),
  M('c4'),
  M('e6'),
  M('Nc3'),
  M('Nf6'),
];

describe('chess traveler', () => {
  describe('Move navigation - moveForward, moveBack', () => {
    let cords: CurrentMoveCoordinates;

    it('should navigate forward via variations', () => {
      cords = moveForward(defaultMainLine, INITIAL_COORDINATES, M('e4'));
      expect(cords).toEqual({
        current: [0, 0, 1],
        history: [[0]],
      });

      cords = moveForward(defaultMainLine, cords, M('e6'));
      expect(cords).toEqual({
        current: [0, 0, 1, 0, 1],
        history: [[0], [0, 0, 1]],
      });

      cords = moveForward(defaultMainLine, cords, M('d4'));
      expect(cords).toEqual({
        current: [0, 0, 1, 0, 2],
        history: [[0], [0, 0, 1], [0, 0, 1, 0, 1]],
      });

      cords = moveForward(defaultMainLine, cords, M('d5'));
      expect(cords).toEqual({
        current: [0, 0, 1, 0, 3],
        history: [[0], [0, 0, 1], [0, 0, 1, 0, 1], [0, 0, 1, 0, 2]],
      });
    });

    it('should navigate backward via variations', () => {
      cords = {
        current: [0, 0, 1, 0, 3],
        history: [[0], [0, 0, 1], [0, 0, 1, 0, 1], [0, 0, 1, 0, 2]],
      };

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [0, 0, 1, 0, 2],
        history: [[0], [0, 0, 1], [0, 0, 1, 0, 1]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [0, 0, 1, 0, 1],
        history: [[0], [0, 0, 1]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [0, 0, 1],
        history: [[0]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [0],
        history: [],
      });

      expect(() => moveBack(cords)).toThrowError('Incorrect coordinate history');
    });

    it('should navigate forward via main line', () => {
      cords = moveForward(defaultMainLine);
      expect(cords).toEqual({
        current: [1],
        history: [[0]],
      });

      cords = moveForward(defaultMainLine, cords, M('d5'));
      expect(cords).toEqual({
        current: [2],
        history: [[0], [1]],
      });

      cords = moveForward(defaultMainLine, cords, M('c4'));
      expect(cords).toEqual({
        current: [3],
        history: [[0], [1], [2]],
      });

      cords = moveForward(defaultMainLine, cords, M('e6'));
      expect(cords).toEqual({
        current: [4],
        history: [[0], [1], [2], [3]],
      });

      cords = moveForward(defaultMainLine, cords, M('Nc3'));
      expect(cords).toEqual({
        current: [5],
        history: [[0], [1], [2], [3], [4]],
      });

      cords = moveForward(defaultMainLine, cords, M('Nf6'));
      expect(cords).toEqual({
        current: [6],
        history: [[0], [1], [2], [3], [4], [5]],
      });
    });

    it('should navigate backward via main line', () => {
      cords = {
        current: [6],
        history: [[0], [1], [2], [3], [4], [5]],
      };

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [5],
        history: [[0], [1], [2], [3], [4]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [4],
        history: [[0], [1], [2], [3]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [3],
        history: [[0], [1], [2]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [2],
        history: [[0], [1]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [1],
        history: [[0]],
      });

      cords = moveBack(cords);
      expect(cords).toEqual({
        current: [0],
        history: [],
      });

      expect(() => moveBack(cords)).toThrowError('Incorrect coordinate history');
    });

    it('should handle navigation of second move', () => {
      const mainLine: ChessMove[] = [M('d4'), M('d5', [[M('Nf6')]])];

      cords = moveForward(mainLine, INITIAL_COORDINATES, M('d4'));
      expect(cords).toEqual({
        current: [1],
        history: [[0]],
      });

      cords = moveForward(mainLine, cords, M('Nf6'));
      expect(cords).toEqual({
        current: [1, 0, 1],
        history: [[0], [1]],
      });
    });

    it('should handle case x', () => {
      const mainLine = [M('e4', [[M('d4')]]), M('c5')];

      expect(moveForward(mainLine, INITIAL_COORDINATES, M('d4'))).toEqual({
        current: [0, 0, 1],
        history: [[0]],
      });
    });
  });
});
