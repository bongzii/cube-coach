import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '..', 'src', 'data');

// ========= OLL DATA =========

// Setup algs (apply to solved to reach the case)
const ollSetups = {
1:"R U2 R2 F R F' U2 R' F R F'",
2:"r U r' U2 r U2 R' U2 R U' r'",
3:"r' R2 U R' U r U2 r' U M'",
4:"M U' r U2 r' U' R U' R' M'",
5:"l' U2 L U L' U l",
6:"r U2 R' U' R U' r'",
7:"r U R' U R U2 r'",
8:"l' U' L U' L' U2 l",
9:"R U R' U' R' F R2 U R' U' F'",
10:"R U R' U R' F R F' R U2 R'",
11:"r U R' U R' F R F' R U2 r'",
12:"M' R' U' R U' R' U2 R U' R r'",
13:"F U R U' R2 F' R U R U' R'",
14:"R' F R U R' F' R F U' F'",
15:"l' U' l L' U' L U l' U l",
16:"r U r' R U R' U' r U' r'",
17:"F R' F' R2 r' U R U' R' U' M'",
18:"r U R' U R U2 r2 U' R U' R' U2 r",
19:"r' R U R U R' U' M' R' F R F'",
20:"r U R' U' M2 U R U' R' U' M'",
21:"R U2 R' U' R U R' U' R U' R'",
22:"R U2 R2 U' R2 U' R2 U2 R",
23:"R2 D' R U2 R' D R U2 R",
24:"r U R' U' r' F R F'",
25:"F' r U R' U' r' F R",
26:"R U2 R' U' R U' R'",
27:"R U R' U R U2 R'",
28:"r U R' U' r' R U R U' R'",
29:"R U R' U' R U' R' F' U' F R U R'",
30:"F R' F R2 U' R' U' R U R' F2",
31:"R' U' F U R U' R' F' R",
32:"L U F' U' L' U L F L'",
33:"R U R' U' R' F R F'",
34:"R U R2 U' R' F R U R U' F'",
35:"R U2 R2 F R F' R U2 R'",
36:"L' U' L U' L' U L U L F' L' F",
37:"F R' F' R U R U' R'",
38:"R U R' U R U' R' U' R' F R F'",
39:"L F' L' U' L U F U' L'",
40:"R' F R U R' U' F' U R",
41:"R U R' U R U2 R' F R U R' U' F'",
42:"R' U' R U' R' U2 R F R U R' U' F'",
43:"F' U' L' U L F",
44:"F U R U' R' F'",
45:"F R U R' U' F'",
46:"R' U' R' F R F' U R",
47:"R' U' R' F R F' R' F R F' U R",
48:"F R U R' U' R U R' U' F'",
49:"r U' r2 U r2 U r2 U' r",
50:"r' U r2 U' r2 U' r2 U r'",
51:"F U R U' R' U R U' R' F'",
52:"R U R' U R U' B U' B' R'",
53:"l' U2 L U L' U' L U L' U l",
54:"r U2 R' U' R U R' U' R U' r'",
55:"R' F R U R U' R2 F' R2 U' R' U R U R'",
56:"r' U' r U' R' U R U' R' U R r' U r",
57:"R U R' U' M' U R U' r'"
};

const ollNames = {
1:"Runway",2:"Zamboni",3:"Anti-Pinwheel",4:"Pinwheel",
5:"Lefty Square",6:"Righty Square",
7:"Lightning",8:"Reverse Lightning",
9:"Kite",10:"Anti-Kite",
11:"Downstairs",12:"Upstairs",
13:"Gun",14:"Anti-Gun",
15:"Squeegee",16:"Anti-Squeegee",
17:"Slash",18:"Crown",
19:"Bunny",20:"Checkers",
21:"H Double Sune",22:"Pi Bruno",
23:"Headlights",24:"Chameleon",
25:"Bowtie",26:"Antisune",
27:"Sune",28:"Double Sune",
29:"P Shape",30:"Anti-P Shape",
31:"Couch",32:"Anti-Couch",
33:"Key",34:"City",
35:"Fish Salad",36:"Wario",
37:"Mounted Fish",38:"Mario",
39:"Fung",40:"Anti-Fung",
41:"Cross P",42:"Cross Anti-P",
43:"Anti-P",44:"P",
45:"Suit Up",46:"Seein' Headlights",
47:"Anti-Breakneck",48:"Breakneck",
49:"Right Back Squeezy",50:"Right Front Squeezy",
51:"Bottlecap",52:"Rice Cooker",
53:"Frying Pan",54:"Anti-Frying Pan",
55:"Highway",56:"Streetlights",
57:"H OLL"
};

const ollGroups = {
1:"Dot",2:"Dot",3:"Dot",4:"Dot",
5:"Square Shape",6:"Square Shape",
7:"Small Lightning Bolt",8:"Small Lightning Bolt",
9:"Fish Shape",10:"Fish Shape",
11:"Small Lightning Bolt",12:"Small Lightning Bolt",
13:"Knight Move Shape",14:"Knight Move Shape",
15:"Knight Move Shape",16:"Knight Move Shape",
17:"Awkward Shape",18:"Awkward Shape",
19:"Awkward Shape",20:"Awkward Shape",
21:"Corners Oriented",22:"Corners Oriented",23:"Corners Oriented",24:"Corners Oriented",
25:"Corners Oriented",26:"Corners Oriented",27:"Corners Oriented",28:"Corners Oriented",
29:"Cross",30:"Cross",
31:"P Shape",32:"P Shape",
33:"T Shape",
34:"C Shape",
35:"Fish Shape",
36:"W Shape",
37:"Fish Shape",
38:"W Shape",
39:"Big Lightning Bolt",40:"Big Lightning Bolt",
41:"P Shape",42:"P Shape",43:"P Shape",44:"P Shape",
45:"T Shape",
46:"C Shape",
47:"Small L Shape",48:"Big Lightning Bolt",
49:"Big Lightning Bolt",50:"Big Lightning Bolt",
51:"I Shape",52:"I Shape",
53:"Small L Shape",54:"Small L Shape",
55:"I Shape",56:"I Shape",57:"I Shape"
};

const ollCategories = {
1:"Dot",2:"Dot",3:"Dot",4:"Dot",
5:"Square",6:"Square",
7:"Small Lightning",8:"Small Lightning",
9:"Fish",10:"Fish",
11:"Small Lightning",12:"Small Lightning",
13:"Knight Move",14:"Knight Move",15:"Knight Move",16:"Knight Move",
17:"Awkward",18:"Awkward",19:"Awkward",20:"Awkward",
21:"OCLL",22:"OCLL",23:"OCLL",24:"OCLL",
25:"OCLL",26:"OCLL",27:"OCLL",28:"OCLL",
29:"Cross",30:"Cross",
31:"P",32:"P",
33:"T",
34:"C",
35:"Fish",
36:"W",
37:"Fish",
38:"W",
39:"Big Lightning",40:"Big Lightning",
41:"P",42:"P",43:"P",44:"P",
45:"T",
46:"C",
47:"Small L",48:"Big Lightning",
49:"Big Lightning",50:"Big Lightning",
51:"I",52:"I",
53:"Small L",54:"Small L",
55:"I",56:"I",57:"I"
};

// Compute solution algs (inverse of setup)
function invert(a) {
  a = a.replace(/[()]/g,'').trim();
  const m = a.match(/[2-9]?[BRUFLDbrufldMESxyz][w]?[2']?/g) || [];
  return [...m].reverse().map(m => {
    if (m.endsWith("'")) return m.slice(0,-1);
    if (m.endsWith("2")) return m;
    return m + "'";
  }).join(' ');
}

// Generate OLL cases and algorithms
const ollCases = [];
const ollAlgs = {};
for (let id = 1; id <= 57; id++) {
  const setup = ollSetups[id];
  ollCases.push({
    id,
    name: ollNames[id],
    category: ollCategories[id],
    setup,
    group: ollGroups[id]
  });
  ollAlgs[id] = [invert(setup)];
}

// ========= PLL DATA =========

const pllSetups = {
  1: "M2 U M U2 M' U M2",
  2: "M2 U' M U2 M' U' M2",
  3: "M2 U M2 U2 M2 U M2",
  4: "M' U M2 U M2 U M' U2 M2",
  5: "x L2 D2 L' U' L D2 L' U L'",
  6: "x' L2 D2 L U L' D2 L U' L",
  7: "x' L' U L D' L' U' L D L' U' L D' L' U L D",
  8: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
  9: "R2 U R' U R' U' R U' R2 (U' D) R' U R D'",
  10: "R' U' R (U D') R2 U R' U R U' R U' R2 D",
  11: "R2 U' R U' R U R' U R2 (U D') R U' R' D",
  12: "R U R' (U' D) R2 U' R U' R' U R' U R2 D'",
  13: "x R2 F R F' R U2 r' U r U2",
  14: "R U R' F' R U R' U' R' F R2 U' R'",
  15: "R U' R' U' R U R D R' U' R D' R' U2 R'",
  16: "R2 F R U R U' R' F' R U2 R' U2 R",
  17: "R U R' U' R' F R2 U' R' U' (R U R') F'",
  18: "R' U R' U' y R' F' R2 U' R' U R' F R F",
  19: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
  20: "R' (U R U' R') F' U' F R U R' F R' F' R U' R",
  21: "F R U' R' U' R U R' F' R U R' U' R' F R F'"
};

const pllNames = {
  1: "Ua", 2: "Ub", 3: "H", 4: "Z",
  5: "Aa", 6: "Ab", 7: "E", 8: "F",
  9: "Ga", 10: "Gb", 11: "Gc", 12: "Gd",
  13: "Ja", 14: "Jb", 15: "Ra", 16: "Rb",
  17: "T", 18: "V", 19: "Na", 20: "Nb", 21: "Y"
};

const pllGroups = {
  1: "Edge Only", 2: "Edge Only", 3: "Edge Only", 4: "Edge Only",
  5: "Adjacent Swap", 6: "Adjacent Swap",
  7: "Diagonal Swap",
  8: "Adjacent Swap",
  9: "Adjacent Swap", 10: "Adjacent Swap", 11: "Adjacent Swap", 12: "Adjacent Swap",
  13: "Adjacent Swap", 14: "Adjacent Swap",
  15: "Adjacent Swap", 16: "Adjacent Swap",
  17: "Adjacent Swap",
  18: "Diagonal Swap",
  19: "Diagonal Swap", 20: "Diagonal Swap",
  21: "Diagonal Swap"
};

const pllCategories = {
  1: "Edge Only", 2: "Edge Only", 3: "Edge Only", 4: "Edge Only",
  5: "Corner", 6: "Corner",
  7: "Diagonal", 8: "Adjacent",
  9: "G", 10: "G", 11: "G", 12: "G",
  13: "Adjacent", 14: "Adjacent", 15: "Adjacent", 16: "Adjacent",
  17: "Adjacent", 18: "Diagonal",
  19: "Diagonal", 20: "Diagonal", 21: "Diagonal"
};

const pllCases = [];
const pllAlgs = {};
for (let id = 1; id <= 21; id++) {
  pllCases.push({
    id,
    name: pllNames[id],
    category: pllCategories[id],
    setup: pllSetups[id],
    group: pllGroups[id]
  });
  pllAlgs[id] = [invert(pllSetups[id])];
}

// ========= WRITE FILES =========

// ollCases.ts
let content = `export interface OLLCase {
  id: number;
  name: string;
  category: string;
  setup: string;
  group: string;
}

export const ollCases: OLLCase[] = ${JSON.stringify(ollCases, null, 2)};
`;
fs.writeFileSync(path.join(out, 'ollCases.ts'), content);

// pllCases.ts
content = `export interface PLLCase {
  id: number;
  name: string;
  category: string;
  setup: string;
  group: string;
}

export const pllCases: PLLCase[] = ${JSON.stringify(pllCases, null, 2)};
`;
fs.writeFileSync(path.join(out, 'pllCases.ts'), content);

// ollAlgs.ts
content = `export const ollAlgs: Record<number, string[]> = ${JSON.stringify(ollAlgs, null, 2)};
`;
fs.writeFileSync(path.join(out, 'ollAlgs.ts'), content);

// pllAlgs.ts
const pllAlgsByName: Record<string, string[]> = {};
Object.keys(pllAlgs).forEach(key => {
  const id = parseInt(key);
  pllAlgsByName[pllNames[id]] = pllAlgs[id];
});
content = `export const pllAlgs: Record<string, string[]> = ${JSON.stringify(pllAlgsByName, null, 2)};
`;
fs.writeFileSync(path.join(out, 'pllAlgs.ts'), content);

console.log('Done generating data files');
