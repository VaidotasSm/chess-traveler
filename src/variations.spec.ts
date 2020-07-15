import { ChessMove, CurrentMoveCoordinates, Move as M } from './chess-traveler.types';
import { addVariation, removeVariation, promoteVariation } from './variations';

describe('chess-traveler#variations', () => {
  describe('addVariation()', () => {
    function generateMainLine(): ChessMove[] {
      return [
        M('d4', [
          [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
          [M('c4'), M('e5')],
        ]),
        M('d5'),
        M('c4'),
        M('e6'),
      ];
    }

    let defaultMainLine: ChessMove[];
    beforeEach(() => {
      // will be mutated after each test
      defaultMainLine = generateMainLine();
    });

    it('should not modify existing mainLine', () => {
      const mainLine: ChessMove[] = [];
      addVariation(mainLine, { current: [0], history: [] }, 'Nf3');

      expect(mainLine).toEqual([]);
    });

    it('should add new move to main line when empty game', () => {
      const mainLine: ChessMove[] = [];
      const res = addVariation(mainLine, { current: [0], history: [] }, 'Nf3');

      expect(res).toEqual({
        move: M('Nf3'),
        modifiedMainLine: [M('Nf3')],
      });
    });

    it('should add new move to main line when last move', () => {
      const cords: CurrentMoveCoordinates = { current: [4], history: [[0], [1], [2], [3]] };
      const res = addVariation(defaultMainLine, cords, 'Nc3');

      expect(res).toEqual({
        move: M('Nc3'),
        modifiedMainLine: [
          M('d4', [
            [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
            [M('c4'), M('e5')],
          ]),
          M('d5'),
          M('c4'),
          M('e6'),
          M('Nc3'),
        ],
      });
    });

    it('should add new variation to the bottom', () => {
      const res = addVariation(defaultMainLine, { current: [0], history: [] }, 'Nf3');
      expect(res).toEqual({
        move: M('Nf3'),
        modifiedMainLine: [
          M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('c4'), M('e5')], [M('Nf3')]]),
          M('d5'),
          M('c4'),
          M('e6'),
        ],
      });
    });

    it('should add new variation to empty variations', () => {
      const res = addVariation(defaultMainLine, { current: [1], history: [[0]] }, 'Nf6');

      expect(res).toEqual({
        move: M('Nf6'),
        modifiedMainLine: [
          M('d4', [
            [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
            [M('c4'), M('e5')],
          ]),
          M('d5', [[M('Nf6')]]),
          M('c4'),
          M('e6'),
        ],
      });
    });
  });

  describe('removeVariation()', () => {
    const generateMainLine = (): ChessMove[] => [
      M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('c4'), M('e5')], [M('Nf3')]]),
      M('d5', [[M('Nf6'), M('c4')]]),
      M('c4'),
      M('e6'),
    ];

    describe('remove variation', () => {
      it('should remove variation on 1st move', () => {
        const mainLine = generateMainLine();
        const modifiedMainLine = removeVariation(mainLine, { current: [0], history: [] }, M('Nf3'));

        expect(modifiedMainLine).toEqual([
          M('d4', [
            [M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])],
            [M('c4'), M('e5')],
          ]),
          M('d5', [[M('Nf6'), M('c4')]]),
          M('c4'),
          M('e6'),
        ]);
      });

      it('should remove variation on 2nd move', () => {
        const mainLine = generateMainLine();
        const modifiedMainLine = removeVariation(mainLine, { current: [1], history: [] }, M('Nf6'));

        expect(modifiedMainLine).toEqual([
          M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('c4'), M('e5')], [M('Nf3')]]),
          M('d5'),
          M('c4'),
          M('e6'),
        ]);
      });

      it('should remove nested variation', () => {
        const mainLine = generateMainLine();
        const modifiedMainLine = removeVariation(mainLine, { current: [0, 0, 1], history: [] }, M('e6'));

        expect(modifiedMainLine).toEqual([
          M('d4', [[M('e4'), M('e5', [])], [M('c4'), M('e5')], [M('Nf3')]]),
          M('d5', [[M('Nf6'), M('c4')]]),
          M('c4'),
          M('e6'),
        ]);
      });
    });

    describe('remove main move', () => {
      it('should not modify existing mainLine', () => {
        const mainLine = generateMainLine();
        removeVariation(mainLine, { current: [0], history: [] }, M('d4'));

        expect(mainLine).toEqual(generateMainLine());
      });

      it('should remove main move when is 1st', () => {
        const mainLine = generateMainLine();
        const modifiedMainLine = removeVariation(mainLine, { current: [0], history: [] }, M('d4'));

        expect(modifiedMainLine).toEqual([
          M('e4', [[M('c4'), M('e5')], [M('Nf3')]]),
          M('e5', [[M('e6'), M('d4'), M('d5')]]),
        ]);
      });

      it('should remove main move when is 2nd', () => {
        const mainLine = generateMainLine();
        const modifiedMainLine = removeVariation(mainLine, { current: [1], history: [] }, M('d5'));

        expect(modifiedMainLine).toEqual([
          M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('c4'), M('e5')], [M('Nf3')]]),
          M('Nf6'),
          M('c4'),
        ]);
      });

      it('should remove main move when no variations', () => {
        const mainLine = generateMainLine();
        const modifiedMainLine = removeVariation(mainLine, { current: [2], history: [] }, M('c4'));

        expect(modifiedMainLine).toEqual([
          M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('c4'), M('e5')], [M('Nf3')]]),
          M('d5', [[M('Nf6'), M('c4')]]),
        ]);
      });
    });
  });

  describe('promoteVariation()', () => {
    const simpleLine = (): ChessMove[] => [
      M('d4', [
        [M('e4'), M('e5')],
        [M('c4'), M('e5')],
      ]),
      M('d5'),
    ];

    const generateMainLine = () => [
      M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('c4'), M('e5')], [M('Nf3')]]),
      M('d5', [[M('Nf6'), M('c4')]]),
      M('c4'),
      M('e6', [
        [M('c6'), M('Nf3')],
        [M('dxc4'), M('e3')],
      ]),
    ];

    it('should not modify existing mainLine', () => {
      const mainLine = simpleLine();
      promoteVariation(mainLine, [0], M('e4'));
      expect(mainLine).toEqual(simpleLine());
    });

    const swapTwoVariationsTestCases = [
      [
        simpleLine(),
        [0],
        M('c4'),
        [
          M('d4', [
            [M('c4'), M('e5')],
            [M('e4'), M('e5')],
          ]),
          M('d5'),
        ],
      ],
      [
        generateMainLine(),
        [0],
        M('Nf3'),
        [
          M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('Nf3')], [M('c4'), M('e5')]]),
          M('d5', [[M('Nf6'), M('c4')]]),
          M('c4'),
          M('e6', [
            [M('c6'), M('Nf3')],
            [M('dxc4'), M('e3')],
          ]),
        ],
      ],
      [
        generateMainLine(),
        [3],
        M('dxc4'),
        [
          M('d4', [[M('e4'), M('e5', [[M('e6'), M('d4'), M('d5')]])], [M('c4'), M('e5')], [M('Nf3')]]),
          M('d5', [[M('Nf6'), M('c4')]]),
          M('c4'),
          M('e6', [
            [M('dxc4'), M('e3')],
            [M('c6'), M('Nf3')],
          ]),
        ],
      ],
    ];
    test.each(swapTwoVariationsTestCases)(
      'should swap two variations',
      (mainLine, cords, second, expectedMainLine) => {
        expect(
          promoteVariation(mainLine as ChessMove[], cords as number[], second as ChessMove)
        ).toEqual(expectedMainLine);
      }
    );

    const swapMainLineWithVariationTestCases = [
      [
        simpleLine(),
        [0],
        M('e4'),
        [
          M('e4', [
            [M('d4'), M('d5')],
            [M('c4'), M('e5')],
          ]),
          M('e5'),
        ],
      ],
      [
        generateMainLine(),
        [0, 0, 1],
        M('e6'),
        [
          M('d4', [[M('e4'), M('e6', [[M('e5')]]), M('d4'), M('d5')], [M('c4'), M('e5')], [M('Nf3')]]),
          M('d5', [[M('Nf6'), M('c4')]]),
          M('c4'),
          M('e6', [
            [M('c6'), M('Nf3')],
            [M('dxc4'), M('e3')],
          ]),
        ],
      ],
    ];
    test.each(swapMainLineWithVariationTestCases)(
      'should swap main with variation',
      (mainLine, cords, second, expectedMainLine) => {
        expect(
          promoteVariation(mainLine as ChessMove[], cords as number[], second as ChessMove)
        ).toEqual(expectedMainLine);
      }
    );

    it('should swap main with variation', () => {
      const mainLine = [
        M('d4', [
          [M('e4'), M('e5')],
          [M('c4'), M('e5')],
        ]),
        M('d5'),
      ];

      const modifiedMainLine = promoteVariation(mainLine, [0], M('e4'));

      expect(modifiedMainLine).toEqual([
        M('e4', [
          [M('d4'), M('d5')],
          [M('c4'), M('e5')],
        ]),
        M('e5'),
      ]);
    });
  });
});
