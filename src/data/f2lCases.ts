import { f2lScrambles } from './f2lScrambles';
import { getF2LCaseCategory, getF2LCaseSlot, getF2LCaseEdgeOriented, getLocalCaseId } from './f2lGroups';

export interface F2LCase {
  id: number;
  name: string;
  category: string;
  group: 'basic' | 'basicBack' | 'advanced' | 'expert';
  setup: string;
  setups: string[];
  slot: 'fr' | 'fl' | 'br' | 'bl';
  edgeOriented: boolean;
}

function createCase(globalId: number): F2LCase {
  const { groupId, localId } = getLocalCaseId(globalId);
  const category = getF2LCaseCategory(groupId, localId) ?? 'Unknown';
  const slot = getF2LCaseSlot(groupId, localId);
  const edgeOriented = getF2LCaseEdgeOriented(groupId, localId);
  const scrambles = f2lScrambles[globalId] ?? [];

  return {
    id: globalId,
    name: `Case ${globalId}`,
    category,
    group: groupId,
    setup: scrambles[0] ?? '',
    setups: scrambles,
    slot,
    edgeOriented
  };
}

export const f2lCases: F2LCase[] = Array.from({ length: 159 }, (_, i) => createCase(i + 1));