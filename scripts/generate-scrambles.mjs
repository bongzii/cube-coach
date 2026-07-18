import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const D_MODS = ["", "'", "2"];
const CANCEL = [
  ["R", "R'"], ["R'", "R"], ["F", "F'"], ["F'", "F"],
  ["B", "B'"], ["B'", "B"], ["L", "L'"], ["L'", "L"],
];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function inv(s) {
  return s.trim().split(/\s+/).reverse().map(m => {
    if (m.endsWith("'")) return m.slice(0, -1);
    if (m.endsWith("2")) return m;
    return m + "'";
  }).join(" ");
}

function tryDConj(setup, cubeCtor, refTop) {
  for (const mod of D_MODS) {
    const d = "D" + mod;
    const conj = d + " " + setup + " " + inv(d);
    const test = run(new cubeCtor(), conj);
    if (test.asString().slice(0, 9) === refTop) return conj.trim();
  }
  return null;
}

function genCancel(setup) {
  const [a, b] = rnd(CANCEL);
  return setup + " " + a + " " + b;
}

function run(cube, seq) {
  for (const m of seq.replace(/[()]/g, "").trim().split(/\s+/)) if (m) cube.move(m);
  return cube;
}

function readCases(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const start = content.indexOf("= [");
  const end = content.lastIndexOf("];");
  return JSON.parse(content.slice(start + 2, end + 1));
}

const ollHeader = `export interface OLLCase {
  id: number;
  name: string;
  category: string;
  setup: string;
  group: string;
}

export const ollCases: OLLCase[] = [`;

const pllHeader = `export interface PLLCase {
  id: number;
  name: string;
  category: string;
  setup: string;
  group: string;
}

export const pllCases: PLLCase[] = [`;

function main() {
  const genData = fs.readFileSync(path.join(root, "scripts/gen-data.mjs"), "utf-8");
  const ollM = genData.match(/const ollSetups = ({[\s\S]*?});/);
  const pllM = genData.match(/const pllSetups = ({[\s\S]*?});/);
  const ollOrig = eval("(" + ollM[1] + ")");
  const pllOrig = eval("(" + pllM[1] + ")");
  const Cube = require("cubejs");
  const ollCases = readCases(path.join(root, "src/data/ollCases.ts"));
  const pllCases = readCases(path.join(root, "src/data/pllCases.ts"));

  console.log("Generating and verifying scrambles...\n");
  let ok = 0, fail = 0, dUsed = 0, fbUsed = 0;

  for (const c of ollCases) {
    const setup = (ollOrig[c.id] || "").replace(/[()]/g, "").trim();
    const ref = run(new Cube(), setup);
    const refTop = ref.asString().slice(0, 9);

    let scramble = tryDConj(setup, Cube, refTop);
    let method = "D";
    if (!scramble) {
      scramble = genCancel(setup);
      method = "C";
    }
    const test = run(new Cube(), scramble);
    if (test.asString().slice(0, 9) === refTop) {
      c.setup = scramble;
      ok++;
      if (method === "D") dUsed++; else fbUsed++;
      console.log(`  OK  OLL #${c.id} (${c.name}) [${method}]`);
    } else {
      fail++;
      console.log(`  FAIL OLL #${c.id} (${c.name})`);
    }
  }

  for (const c of pllCases) {
    const setup = (pllOrig[c.id] || "").replace(/[()]/g, "").trim();
    const ref = run(new Cube(), setup);
    const refTop = ref.asString().slice(0, 9);

    let scramble = tryDConj(setup, Cube, refTop);
    let method = "D";
    if (!scramble) {
      scramble = genCancel(setup);
      method = "C";
    }
    const test = run(new Cube(), scramble);
    if (test.asString().slice(0, 9) === refTop) {
      c.setup = scramble;
      ok++;
      if (method === "D") dUsed++; else fbUsed++;
      console.log(`  OK  PLL #${c.id} (${c.name}) [${method}]`);
    } else {
      fail++;
      console.log(`  FAIL PLL #${c.id} (${c.name})`);
    }
  }

  console.log(`\nPass: ${ok} | Fail: ${fail} | D-conj: ${dUsed} | Cancel-pair: ${fbUsed}`);

  const w = (cases) => cases.map(c => `  ${JSON.stringify(c)}`).join(",\n");
  fs.writeFileSync(path.join(root, "src/data/ollCases.ts"), ollHeader + "\n" + w(ollCases) + "\n];\n");
  fs.writeFileSync(path.join(root, "src/data/pllCases.ts"), pllHeader + "\n" + w(pllCases) + "\n];\n");

  console.log("\nDone.");
}

main();
