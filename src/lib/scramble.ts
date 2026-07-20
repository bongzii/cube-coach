const MOVES = ["R", "L", "U", "D", "F", "B"] as const;
const MODIFIERS = ["", "'", "2"] as const;

function randInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function generateScramble(length = 25): string {
  const moves: string[] = [];
  let prev1 = -1;
  let prev2 = -1;

  for (let i = 0; i < length; i++) {
    let axis = randInt(6);
    // same face as previous → reroll (no R R)
    while (axis === prev1) axis = randInt(6);
    // opposite face pair would be redundant (R L is fine, but L R L same as L R)
    if (Math.abs(axis - prev1) === 1 && Math.abs(axis - prev2) === 1 && axis === prev2) {
      axis = (axis + 2) % 6;
    }
    moves.push(MOVES[axis] + MODIFIERS[randInt(3)]);
    prev2 = prev1;
    prev1 = axis;
  }
  return moves.join(" ");
}
