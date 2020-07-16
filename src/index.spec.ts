import {
  ChessMove,
  CurrentMove,
  MatchingMoveResult,
  Move,
  Traveler,
  AddVariationResult,
} from './index';

describe('chess traveler DEMO - lib usage', () => {
  const mainLine: ChessMove[] = [
    Move('d4', [
      [Move('e4'), Move('e5')],
      [Move('c4'), Move('e5')],
    ]),
    Move('d5'),
    Move('c4'),
    Move('e6'),
  ];

  describe('Moving forward/backward', () => {
    it('should navigate forward via variations', () => {
      const traveler = Traveler().moveForward(mainLine, Move('d4')).moveForward(mainLine, Move('d5')).moveBack();

      expect(traveler.coordinates).toEqual({ current: [1], history: [[0]] });
    });
  });

  describe('Current Move Info', () => {
    it('getMove - get any move by its coordinates', () => {
      const currentMove: CurrentMove = Traveler({ current: [2], history: [[0], [1]] }).getMove(mainLine);

      expect(currentMove).toEqual({
        move: { raw: 'c4', variations: [], comments: [] },
        line: mainLine,
        indexOnLine: 2,
      });
    });

    it('getPreviousMadeMove - get previously made move', () => {
      const currentMove: CurrentMove = Traveler({ current: [2], history: [[0], [1]] }).getPreviousMadeMove(mainLine);

      expect(currentMove).toEqual({
        move: { raw: 'd5', variations: [], comments: [] },
        line: mainLine,
        indexOnLine: 1,
      });
    });

    it('getNextMove - get move by raw from all variations if exists', () => {
      let matching: MatchingMoveResult;
      const traveler = Traveler();
      matching = traveler.getNextMove(mainLine, 'd4');
      expect(matching).toEqual({ matchingMove: mainLine[0], isMain: true });

      matching = traveler.getNextMove(mainLine, 'e4');
      expect(matching).toEqual({ matchingMove: mainLine[0].variations[0][0], isMain: false });

      matching = traveler.getNextMove(mainLine, 'c4');
      expect(matching).toEqual({ matchingMove: mainLine[0].variations[1][0], isMain: false });

      matching = traveler.getNextMove(mainLine, 'f4');
      expect(matching).toEqual({ isMain: false });

      matching = traveler.getNextMove(mainLine, undefined);
      expect(matching).toEqual({ isMain: false });
    });

    it('toMoveHistoryLine - map move history to ChessMove array', () => {
      const coords = { current: [2], history: [[0], [1]] };
      const moves: ChessMove[] = Traveler(coords).toMoveHistoryLine(mainLine);
      expect(moves).toEqual([mainLine[0], mainLine[1]]);
    });
  });

  describe('Variation Management', () => {
    const coords = { current: [2], history: [[0], [1]] };

    it('addVariation - add alternative variation to next move', () => {
      const result: AddVariationResult = Traveler(coords).addVariation(mainLine, 'Nf3');
      expect(result).toEqual({
        move: Move('Nf3'),
        modifiedMainLine: [
          Move('d4', [
            [Move('e4'), Move('e5')],
            [Move('c4'), Move('e5')],
          ]),
          Move('d5'),
          Move('c4', [[Move('Nf3')]]), // new variation Nf3
          Move('e6'),
        ],
      });
    });

    it('promoteVariation - promote variation to main line', () => {
      const modifiedMainLine: ChessMove[] | null = Traveler().promoteVariation(mainLine, Move('e4'));
      expect(modifiedMainLine).toEqual([
        Move('e4', [
          [Move('d4'), Move('d5'), Move('c4'), Move('e6')],
          [Move('c4'), Move('e5')],
        ]),
        Move('e5'),
      ]);
    });

    it('removeVariation - remove variation', () => {
      const modifiedMainLine: ChessMove[] | null = Traveler().removeVariation(mainLine, Move('d4'));
      expect(modifiedMainLine).toEqual([Move('e4', [[Move('c4'), Move('e5')]]), Move('e5')]);
    });
  });
});
