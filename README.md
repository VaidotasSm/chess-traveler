# Chess Traveler
Library to:
* Travel via chess move tree - forward, back...
* Manage Move tree Variations - create, delete, promote.

**IMPORTANT!**

It's pre 1.0 version, breaking changes might happen, would try to make them sem-ver compatible.

## Noteworthy features

**One level deep Variation Tree**

Each move might have variations, in other libs it is usually represented as multi-level recursion (`main->variation1->variation2`) which is problematic to represent in actual applications.

```JavaScript
// chess-traveler move tree structure
[
  {
    raw: 'e4',
    variations: [
      [
        {raw: 'd4', variations: [], ...},
        {raw: 'c4', variations: [], ...},
      ]
    ],
    ...
  },
  ...
]
```

## Example


**Create instance**

It provides immutable API, so can put it under state management e.g. `Redux`. Can pass CurrentMoveCoordinates as starting coordinates (uses `INITIAL_COORDINATES` by default).

```JavaScript
const traveler: IChessTraveler = Traveler();
const traveler: IChessTraveler = Traveler(INITIAL_COORDINATES);
const traveler: IChessTraveler = Traveler({ current: [2], history: [[0], [1]] });
```

**Making Moves (modify coordinates immutably)**

First, need Move tree to operate on - constructed manually or using `Move(raw, variations, comments)` utility function.
```JavaScript
const mainLine: ChessMove[] = [
  Move('d4', [
    [Move('e4'), Move('e5')],
    [Move('c4'), Move('e5')],
  ]),
  Move('d5'),
  Move('c4'),
  Move('e6'),
];
```

`moveForward` and `moveBack` - returns new instance of `IChessTraveler` with coordinates pointing to new move.
```JavaScript
traveler = traveler.moveForward(mainLine, Move('d4'));
traveler = traveler.moveBack();
```

**Manage Variations (modify variation tree immutably)**

Add new Variation to move tree (must not exist already)
```JavaScript
const result: AddVariationResult = Traveler(coords).addVariation(mainLine, 'Nf3');
result.modifiedMainLine; // new instance of ChessMove[] with variation added in
result.move;  // made move
```

Remove existing variation from move tree
```JavaScript
const modifiedMainLine: ChessMove[] | null = Traveler().removeVariation(mainLine, Move('d4'));
```

Promote variation. Variations are ordered - "main line" contains variations which are second, third and so on... Pass Move to promote and returned tree will contain it as one level above it was before.
```JavaScript
const modifiedMainLine: ChessMove[] | null = Traveler().promoteVariation(mainLine, Move('e4'));
```

** Get Move Info **


Get current move info
```JavaScript
const currentMove: CurrentMove = traveler.getMove(mainLine);
currentMove;              // empty of move does not exist on main line
currentMove.move?;        // move instance, e.g. { raw: 'd4', variations: [], comments: [] }
currentMove.line?;        // line this move is on - could be main line (entire tree) or some specific variation
currentMove.indexOnLine?; // move order in line
```

Get previous move (from history)
```JavaScript
const currentMove: CurrentMove = traveler.getPreviousMadeMove(mainLine);
currentMove;              // empty of move does not exist on main line
currentMove.move?;        // move instance, e.g. { raw: 'd4', variations: [], comments: [] }
currentMove.line?;        // line this move is on - could be main line (entire tree) or some specific variation
currentMove.indexOnLine?; // move order in line
```

Find next Move by `raw` string - next move in main line or any of variations.
```JavaScript
const matching: MatchingMoveResult = traveler.getNextMove(mainLine, 'd4');
matching.matchingMove?;   // Move instance if exists
matching.isMain;          // is on main line?
```

Get previous move history, converted to actual `Move` instances
```JavaScript
const moves: ChessMove[] = traveler.toMoveHistoryLine(mainLine);
```
