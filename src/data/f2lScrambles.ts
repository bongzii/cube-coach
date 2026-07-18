import { f2lScramblesBasic } from './f2lScramblesBasic';
import { f2lScramblesBasicBack } from './f2lScramblesBasicBack';
import { f2lScramblesAdvanced } from './f2lScramblesAdvanced';
import { f2lScramblesExpert } from './f2lScramblesExpert';

// Combine all scrambles into a single record for global case IDs (1-159)
export const f2lScrambles: Record<number, string[]> = {};

// Basic (1-41)
Object.entries(f2lScramblesBasic).forEach(([key, value]) => {
  f2lScrambles[parseInt(key)] = value;
});

// Basic Back (42-82) -> global IDs 42-82
Object.entries(f2lScramblesBasicBack).forEach(([key, value]) => {
  f2lScrambles[parseInt(key) + 41] = value;
});

// Advanced (83-142) -> global IDs 83-142
Object.entries(f2lScramblesAdvanced).forEach(([key, value]) => {
  f2lScrambles[parseInt(key) + 82] = value;
});

// Expert (143-159) -> global IDs 143-159
Object.entries(f2lScramblesExpert).forEach(([key, value]) => {
  f2lScrambles[parseInt(key) + 142] = value;
});