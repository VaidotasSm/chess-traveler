# Chess Traveler
Library to:
* Travel via chess move tree - forward, back...
* Manage Move tree Variations - create, delete, promote.

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

TODO
