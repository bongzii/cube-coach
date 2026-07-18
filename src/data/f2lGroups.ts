export interface F2LGroupDefinition {
  id: 'basic' | 'basicBack' | 'advanced' | 'expert';
  name: string;
  editName: string;
  numberCases: number;
  categories: readonly { name: string; cases: readonly number[] }[];
  ignoreAUF?: readonly number[];
  caseNumberMapping?: Record<number, string>;
  piecesToHide?: Record<number, string>;
  edgeState: Record<number, { slot: 'fr' | 'fl' | 'br' | 'bl'; oriented: boolean }>;
}

export const F2L_GROUPS: Record<'basic' | 'basicBack' | 'advanced' | 'expert', F2LGroupDefinition> = {
  basic: {
    id: 'basic',
    name: 'Basic F2L',
    editName: 'Basic',
    numberCases: 41,
    categories: [
      { name: 'Basic Inserts', cases: [4, 3, 1, 2] },
      { name: 'Pieces on Top / White facing Front / Edge oriented', cases: [5, 7, 15] },
      { name: 'Pieces on Top / White facing Front / Edge unoriented', cases: [9, 11, 13] },
      { name: 'Pieces on Top / White facing Side / Edge oriented', cases: [10, 12, 14] },
      { name: 'Pieces on Top / White facing Side / Edge unoriented', cases: [6, 8, 16] },
      { name: 'Pieces on Top / White facing Up / Edge oriented', cases: [17, 19, 21, 23] },
      { name: 'Pieces on Top / White facing Up / Edge unoriented', cases: [18, 20, 22, 24] },
      { name: 'Edge solved', cases: [32, 33, 34, 38, 39] },
      { name: 'Edge flipped', cases: [31, 35, 36, 40, 41, 37] },
      { name: 'Corner on Bottom / Edge on Top / Edge oriented', cases: [27, 30, 25] },
      { name: 'Corner on Bottom / Edge on Top / Edge unoriented', cases: [29, 28, 26] }
    ],
    ignoreAUF: [37, 38, 39, 40, 41],
    edgeState: {
      1: { slot: 'fr', oriented: true },
      2: { slot: 'fr', oriented: false },
      3: { slot: 'fr', oriented: false },
      4: { slot: 'fr', oriented: true },
      5: { slot: 'fr', oriented: true },
      6: { slot: 'fr', oriented: false },
      7: { slot: 'fr', oriented: true },
      8: { slot: 'fr', oriented: false },
      9: { slot: 'fr', oriented: false },
      10: { slot: 'fr', oriented: true },
      11: { slot: 'fr', oriented: false },
      12: { slot: 'fr', oriented: true },
      13: { slot: 'fr', oriented: false },
      14: { slot: 'fr', oriented: true },
      15: { slot: 'fr', oriented: true },
      16: { slot: 'fr', oriented: false },
      17: { slot: 'fr', oriented: true },
      18: { slot: 'fr', oriented: false },
      19: { slot: 'fr', oriented: true },
      20: { slot: 'fr', oriented: false },
      21: { slot: 'fr', oriented: true },
      22: { slot: 'fr', oriented: false },
      23: { slot: 'fr', oriented: true },
      24: { slot: 'fr', oriented: false },
      25: { slot: 'fr', oriented: true },
      26: { slot: 'fr', oriented: false },
      27: { slot: 'fr', oriented: true },
      28: { slot: 'fr', oriented: false },
      29: { slot: 'fr', oriented: false },
      30: { slot: 'fr', oriented: true },
      31: { slot: 'fr', oriented: false },
      32: { slot: 'fr', oriented: true },
      33: { slot: 'fr', oriented: true },
      34: { slot: 'fr', oriented: true },
      35: { slot: 'fr', oriented: false },
      36: { slot: 'fr', oriented: false },
      37: { slot: 'fr', oriented: false },
      38: { slot: 'fr', oriented: true },
      39: { slot: 'fr', oriented: true },
      40: { slot: 'fr', oriented: false },
      41: { slot: 'fr', oriented: false }
    }
  },
  basicBack: {
    id: 'basicBack',
    name: 'Basic Backslot',
    editName: 'Basic Back',
    numberCases: 41,
    categories: [
      { name: 'Basic Inserts', cases: [4, 3, 1, 2] },
      { name: 'Pieces on Top / White facing Back / Edge oriented', cases: [6, 8, 16] },
      { name: 'Pieces on Top / White facing Back / Edge unoriented', cases: [10, 12, 14] },
      { name: 'Pieces on Top / White facing Side / Edge oriented', cases: [9, 11, 13] },
      { name: 'Pieces on Top / White facing Side / Edge unoriented', cases: [5, 7, 15] },
      { name: 'Pieces on Top / White facing Up / Edge oriented', cases: [18, 20, 22, 24] },
      { name: 'Pieces on Top / White facing Up / Edge unoriented', cases: [17, 19, 21, 23] },
      { name: 'Edge solved', cases: [32, 34, 33, 39, 38] },
      { name: 'Edge flipped', cases: [31, 36, 35, 41, 40, 37] },
      { name: 'Corner on Bottom / Edge on Top / Edge oriented', cases: [28, 29, 26] },
      { name: 'Corner on Bottom / Edge on Top / Edge unoriented', cases: [30, 27, 25] }
    ],
    ignoreAUF: [37, 38, 39, 40, 41],
    edgeState: {
      1: { slot: 'br', oriented: false },
      2: { slot: 'br', oriented: true },
      3: { slot: 'br', oriented: true },
      4: { slot: 'br', oriented: false },
      5: { slot: 'br', oriented: false },
      6: { slot: 'br', oriented: true },
      7: { slot: 'br', oriented: false },
      8: { slot: 'br', oriented: true },
      9: { slot: 'br', oriented: true },
      10: { slot: 'br', oriented: false },
      11: { slot: 'br', oriented: true },
      12: { slot: 'br', oriented: false },
      13: { slot: 'br', oriented: true },
      14: { slot: 'br', oriented: false },
      15: { slot: 'br', oriented: false },
      16: { slot: 'br', oriented: true },
      17: { slot: 'br', oriented: false },
      18: { slot: 'br', oriented: true },
      19: { slot: 'br', oriented: false },
      20: { slot: 'br', oriented: true },
      21: { slot: 'br', oriented: false },
      22: { slot: 'br', oriented: true },
      23: { slot: 'br', oriented: false },
      24: { slot: 'br', oriented: true },
      25: { slot: 'br', oriented: false },
      26: { slot: 'br', oriented: true },
      27: { slot: 'br', oriented: false },
      28: { slot: 'br', oriented: true },
      29: { slot: 'br', oriented: true },
      30: { slot: 'br', oriented: false },
      31: { slot: 'br', oriented: false },
      32: { slot: 'br', oriented: true },
      33: { slot: 'br', oriented: true },
      34: { slot: 'br', oriented: true },
      35: { slot: 'br', oriented: false },
      36: { slot: 'br', oriented: false },
      37: { slot: 'br', oriented: false },
      38: { slot: 'br', oriented: true },
      39: { slot: 'br', oriented: true },
      40: { slot: 'br', oriented: false },
      41: { slot: 'br', oriented: false }
    }
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced F2L',
    editName: 'Advanced',
    numberCases: 60,
    categories: [
      { name: 'Slot in Front / White facing Up', cases: [1, 2, 3, 4] },
      { name: 'Slot in Front / White facing Front', cases: [9, 10, 13, 14] },
      { name: 'Slot in Front / White facing Side', cases: [7, 8, 11, 12] },
      { name: 'Slot in Front / Corner in Adjacent Slot', cases: [19, 20, 21, 22, 23, 24] },
      { name: 'Slot in Back / Edge in Adjacent Front Slot', cases: [37, 38, 39, 40, 41, 42] },
      { name: 'Slot in Back / Corner in Adjacent Front Slot', cases: [25, 26, 27, 28, 29, 30] },
      { name: 'Edge in Opposite Slot', cases: [5, 6, 17, 18, 15, 16] },
      { name: 'Corner in Opposite Slot', cases: [31, 32, 33, 34, 35, 36] },
      {
        name: 'Basic Cases / Free Slot',
        cases: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
      }
    ],
    caseNumberMapping: {
      43: '10B', 44: '12B', 45: '15B', 46: '23B', 47: '25B',
      48: '25F', 49: '26B', 50: '26F', 51: '33B', 52: '33F',
      53: '34B', 54: '34F', 55: '37B', 56: '37F', 57: '38B',
      58: '38F', 59: '39B', 60: '39F'
    },
    piecesToHide: {
      1: 'br', 2: 'br', 3: 'fl', 4: 'fl',
      5: 'fr', 6: 'fr', 7: 'br', 8: 'br',
      9: 'fl', 10: 'fl', 11: 'fl', 12: 'fl',
      13: 'br', 14: 'br', 15: 'fr', 16: 'fr',
      17: 'fr', 18: 'fr', 19: 'fr', 20: 'fr',
      21: 'fr', 22: 'fr', 23: 'fr', 24: 'fr',
      25: 'fr', 26: 'fr', 27: 'fr', 28: 'fr',
      29: 'fr', 30: 'fr', 31: 'fr', 32: 'fr',
      33: 'fr', 34: 'fr', 35: 'fr', 36: 'fr',
      37: 'fr', 38: 'fr', 39: 'fr', 40: 'fr',
      41: 'fr', 42: 'fr', 43: 'br', 44: 'br',
      45: 'br', 46: 'fl', 47: 'br', 48: 'fl',
      49: 'br', 50: 'fl', 51: 'br', 52: 'fl',
      53: 'br', 54: 'fl', 55: 'br', 56: 'fl',
      57: 'br', 58: 'fl', 59: 'br', 60: 'fl'
    },
    ignoreAUF: [55, 56, 57, 58, 59, 60],
    edgeState: {
      1: { slot: 'fr', oriented: true }, 2: { slot: 'fr', oriented: false },
      3: { slot: 'fr', oriented: true }, 4: { slot: 'fr', oriented: false },
      5: { slot: 'bl', oriented: true }, 6: { slot: 'bl', oriented: false },
      7: { slot: 'fr', oriented: true }, 8: { slot: 'fr', oriented: false },
      9: { slot: 'fr', oriented: true }, 10: { slot: 'fr', oriented: false },
      11: { slot: 'fr', oriented: true }, 12: { slot: 'fr', oriented: false },
      13: { slot: 'fr', oriented: true }, 14: { slot: 'fr', oriented: false },
      15: { slot: 'bl', oriented: true }, 16: { slot: 'bl', oriented: false },
      17: { slot: 'bl', oriented: true }, 18: { slot: 'bl', oriented: false },
      19: { slot: 'fl', oriented: true }, 20: { slot: 'fl', oriented: false },
      21: { slot: 'fl', oriented: true }, 22: { slot: 'fl', oriented: false },
      23: { slot: 'fl', oriented: true }, 24: { slot: 'fl', oriented: false },
      25: { slot: 'br', oriented: false }, 26: { slot: 'br', oriented: true },
      27: { slot: 'br', oriented: false }, 28: { slot: 'br', oriented: true },
      29: { slot: 'br', oriented: false }, 30: { slot: 'br', oriented: true },
      31: { slot: 'bl', oriented: true }, 32: { slot: 'bl', oriented: false },
      33: { slot: 'bl', oriented: true }, 34: { slot: 'bl', oriented: false },
      35: { slot: 'bl', oriented: true }, 36: { slot: 'bl', oriented: false },
      37: { slot: 'br', oriented: true }, 38: { slot: 'br', oriented: true },
      39: { slot: 'br', oriented: true }, 40: { slot: 'br', oriented: false },
      41: { slot: 'br', oriented: false }, 42: { slot: 'br', oriented: false },
      43: { slot: 'fr', oriented: true }, 44: { slot: 'fr', oriented: true },
      45: { slot: 'fr', oriented: true }, 46: { slot: 'fr', oriented: true },
      47: { slot: 'fr', oriented: true }, 48: { slot: 'fr', oriented: true },
      49: { slot: 'fr', oriented: false }, 50: { slot: 'fr', oriented: false },
      51: { slot: 'fr', oriented: true }, 52: { slot: 'fr', oriented: true },
      53: { slot: 'fr', oriented: true }, 54: { slot: 'fr', oriented: true },
      55: { slot: 'fr', oriented: false }, 56: { slot: 'fr', oriented: false },
      57: { slot: 'fr', oriented: false }, 58: { slot: 'fr', oriented: false },
      59: { slot: 'fr', oriented: true }, 60: { slot: 'fr', oriented: true }
    }
  },
  expert: {
    id: 'expert',
    name: 'Expert F2L',
    editName: 'Expert',
    numberCases: 17,
    categories: [
      { name: 'Corner is solved', cases: [1, 2, 3, 4, 5, 6] },
      { name: 'Pair in wrong slot', cases: [7, 8, 9] },
      { name: 'Flipped edge & corner in adjacent slot', cases: [10, 11, 12, 13, 14, 15] },
      { name: 'Other easy cases', cases: [16, 17] }
    ],
    piecesToHide: {
      1: 'br', 2: 'br', 3: 'fl', 4: 'fl',
      5: 'fl', 6: 'fl', 7: 'fl', 8: 'br',
      9: 'fr', 10: 'fl', 11: 'br', 12: 'fl',
      13: 'br', 14: 'fl', 15: 'br', 16: 'fl',
      17: 'br'
    },
    ignoreAUF: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    edgeState: {
      1: { slot: 'fr', oriented: true }, 2: { slot: 'fr', oriented: false },
      3: { slot: 'fr', oriented: true }, 4: { slot: 'fr', oriented: false },
      5: { slot: 'br', oriented: true }, 6: { slot: 'br', oriented: false },
      7: { slot: 'fr', oriented: false }, 8: { slot: 'fr', oriented: false },
      9: { slot: 'bl', oriented: true }, 10: { slot: 'fr', oriented: false },
      11: { slot: 'fr', oriented: false }, 12: { slot: 'fr', oriented: false },
      13: { slot: 'fr', oriented: false }, 14: { slot: 'fr', oriented: false },
      15: { slot: 'fr', oriented: false }, 16: { slot: 'fr', oriented: false },
      17: { slot: 'fr', oriented: false }
    }
  }
} as const;

export type F2LGroupId = 'basic' | 'basicBack' | 'advanced' | 'expert';
export type F2LCategoryName = typeof F2L_GROUPS.basic.categories[number]['name'];

export const F2L_CATEGORY_ORDER = {
  basic: F2L_GROUPS.basic.categories.map(c => c.name),
  basicBack: F2L_GROUPS.basicBack.categories.map(c => c.name),
  advanced: F2L_GROUPS.advanced.categories.map(c => c.name),
  expert: F2L_GROUPS.expert.categories.map(c => c.name),
};

export function getF2LCaseCategory(groupId: F2LGroupId, caseId: number): string | undefined {
  for (const cat of F2L_GROUPS[groupId].categories) {
    if (cat.cases.includes(caseId)) return cat.name;
  }
  return undefined;
}

export function getF2LCaseSlot(groupId: F2LGroupId, caseId: number): 'fr' | 'fl' | 'br' | 'bl' {
  return F2L_GROUPS[groupId].edgeState[caseId]?.slot ?? 'fr';
}

export function getF2LCaseEdgeOriented(groupId: F2LGroupId, caseId: number): boolean {
  return F2L_GROUPS[groupId].edgeState[caseId]?.oriented ?? true;
}

export function getF2LCaseGroup(caseId: number): F2LGroupId {
  if (caseId >= 1 && caseId <= 41) return 'basic';
  if (caseId >= 42 && caseId <= 82) return 'basicBack';
  if (caseId >= 83 && caseId <= 142) return 'advanced';
  return 'expert';
}

export function getGlobalCaseId(groupId: F2LGroupId, localCaseId: number): number {
  switch (groupId) {
    case 'basic': return localCaseId;
    case 'basicBack': return localCaseId + 41;
    case 'advanced': return localCaseId + 82;
    case 'expert': return localCaseId + 142;
  }
}

export function getLocalCaseId(globalCaseId: number): { groupId: F2LGroupId; localId: number } {
  if (globalCaseId <= 41) return { groupId: 'basic', localId: globalCaseId };
  if (globalCaseId <= 82) return { groupId: 'basicBack', localId: globalCaseId - 41 };
  if (globalCaseId <= 142) return { groupId: 'advanced', localId: globalCaseId - 82 };
  return { groupId: 'expert', localId: globalCaseId - 142 };
}