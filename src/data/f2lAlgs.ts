import { basicAlgorithms } from './f2lAlgsBasic';
import { basicBackAlgorithms } from './f2lAlgsBasicBack';
import { f2lAlgsAdvanced } from './f2lAlgsAdvanced';
import { f2lAlgsExpert } from './f2lAlgsExpert';
import { f2lMoveCount } from '../utils/moveCount';

// Combine all algorithms into a single record for global case IDs (1-159)
export const f2lAlgs: Record<number, string[]> = {};

// Sort each case's algorithms from fewest to most moves (stable sort keeps
// original order among ties). Repeated groups (inner)N count as innerMoves * N.
const sorted = (algs: string[]) => [...algs].sort((a, b) => f2lMoveCount(a) - f2lMoveCount(b));

// Basic (1-41)
Object.entries(basicAlgorithms as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key)] = sorted(value);
});

// Basic Back (42-82) -> global IDs 42-82
Object.entries(basicBackAlgorithms as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key) + 41] = sorted(value);
});

// Advanced (83-142) -> global IDs 83-142
Object.entries(f2lAlgsAdvanced as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key) + 82] = sorted(value);
});

// Expert (143-159) -> global IDs 143-159
Object.entries(f2lAlgsExpert as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key) + 142] = sorted(value);
});
