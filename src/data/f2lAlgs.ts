import { basicAlgorithms } from './f2lAlgsBasic';
import { basicBackAlgorithms } from './f2lAlgsBasicBack';
import { f2lAlgsAdvanced } from './f2lAlgsAdvanced';
import { f2lAlgsExpert } from './f2lAlgsExpert';

// Combine all algorithms into a single record for global case IDs (1-159)
export const f2lAlgs: Record<number, string[]> = {};

// Basic (1-41)
Object.entries(basicAlgorithms as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key)] = value;
});

// Basic Back (42-82) -> global IDs 42-82
Object.entries(basicBackAlgorithms as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key) + 41] = value;
});

// Advanced (83-142) -> global IDs 83-142
Object.entries(f2lAlgsAdvanced as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key) + 82] = value;
});

// Expert (143-159) -> global IDs 143-159
Object.entries(f2lAlgsExpert as Record<string, string[]>).forEach(([key, value]) => {
  f2lAlgs[parseInt(key) + 142] = value;
});