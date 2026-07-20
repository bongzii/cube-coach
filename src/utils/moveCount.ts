const isDouble = (token: string): boolean =>
  /2'?$/.test(token) && !/\)2'?$/.test(token);

const countTokens = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean)
    .reduce((t, tok) => t + (isDouble(tok.replace(/[()]/g, "")) ? 2 : 1), 0);

export function moveCount(alg: string): number {
  return countTokens(alg);
}

// F2L-only: expands repeated groups (inner)N as innerMoves * N.
export function f2lMoveCount(alg: string): number {
  let total = 0;
  const rest = alg.replace(/\(([^)]*)\)(\d+)/g, (_m, inner: string, nStr: string) => {
    total += countTokens(inner) * parseInt(nStr, 10);
    return "";
  });
  return total + countTokens(rest);
}
