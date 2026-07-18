#!/usr/bin/env python3
import re
import sys
import os
import json
import random
import csv
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"


# ── Notation helpers ────────────────────────────────────────────────

VALID_MOVES = {
    "R", "R'", "R2", "L", "L'", "L2",
    "U", "U'", "U2", "D", "D'", "D2",
    "F", "F'", "F2", "B", "B'", "B2",
    "r", "r'", "r2", "l", "l'", "l2",
    "u", "u'", "u2", "d", "d'", "d2",
    "f", "f'", "f2", "b", "b'", "b2",
    "M", "M'", "M2", "E", "E'", "E2", "S", "S'", "S2",
    "x", "x'", "x2", "y", "y'", "y2", "z", "z'", "z2",
}

FACE_MOVES = {"R", "L", "U", "D", "F", "B"}
WIDE_MOVES = {"r", "l", "u", "d", "f", "b"}
SLICE_MOVES = {"M", "E", "S"}
ROTATION_MOVES = {"x", "y", "z"}


def parse_moves(alg: str) -> list[str]:
    tokens = re.findall(r"[2-9]?[BRUFLDbrufldMESxyz][w]?[2']?", alg)
    result = []
    for t in tokens:
        t = t.strip()
        if not t:
            continue
        if t.endswith("w"):
            t = t[0].lower() + ("2" if len(t) > 2 and t[-2] == "2" else "'" if len(t) > 2 and t[-2] == "'" else "")
        result.append(t)
    return result


def moves_from_setup(setup: str) -> list[str]:
    setup = re.sub(r"[()]", "", setup).strip()
    return parse_moves(setup)


def strip_d_wrapper(moves: list[str]) -> list[str]:
    if moves and moves[0] in ("D", "D'", "D2"):
        moves = moves[1:]
    if moves and moves[-1] in ("D", "D'", "D2"):
        moves = moves[:-1]
    return moves


def count_moves(moves: list[str]) -> int:
    return len(moves)


def count_moves_htm(alg: str) -> int:
    tokens = re.findall(r"[2-9]?[BRUFLDbrufldMESxyz][w]?[2']?", alg)
    return len(tokens)


def classify_moves(moves: list[str]) -> dict:
    faces, wide, slices, rotations = 0, 0, 0, 0
    for m in moves:
        base = m[0]
        if base in "RLUDFB":
            faces += 1
        elif base in "rldfub":
            wide += 1
        elif base in "MES":
            slices += 1
        elif base in "xyz":
            rotations += 1
    return {"faces": faces, "wide": wide, "slices": slices, "rotations": rotations}


def invert_alg(alg: str) -> str:
    moves = moves_from_setup(alg)
    inverted = []
    for m in reversed(moves):
        if m.endswith("'"):
            inverted.append(m[:-1])
        elif m.endswith("2"):
            inverted.append(m)
        else:
            inverted.append(m + "'")
    return " ".join(inverted)


# ── Data loading ────────────────────────────────────────────────────

def load_ts_array(path: Path) -> list[dict]:
    text = path.read_text()
    start = text.index("= [") + 2
    end = text.rindex("];") + 1
    raw = text[start:end]
    raw = re.sub(r",\s*(\n\s*\])", r"\1", raw)
    return json.loads(raw)


def load_oll() -> list[dict]:
    return load_ts_array(DATA_DIR / "ollCases.ts")


def load_pll() -> list[dict]:
    return load_ts_array(DATA_DIR / "pllCases.ts")


def load_original_setups(kind: str) -> dict[int, str]:
    text = (ROOT / "src" / "data" / "originalSetups.ts").read_text()
    if kind == "oll":
        m = re.search(r"ollSetups:\s*Record<number,\s*string>\s*=\s*(\{.*?\n\});", text, re.DOTALL)
    else:
        m = re.search(r"pllSetups:\s*Record<number,\*string>\s*=\s*(\{.*?\n\});", text, re.DOTALL)
    if not m:
        return {}
    return {int(k): v for k, v in re.findall(r'(\d+):"([^"]+)"', m.group(1))}


# ── Subcommand: validate ────────────────────────────────────────────

def cmd_validate(args: list[str]) -> None:
    for kind, cases in [("OLL", load_oll()), ("PLL", load_pll())]:
        print(f"\n{'='*60}")
        print(f"  {kind} Validation ({len(cases)} cases)")
        print(f"{'='*60}")
        total_moves = 0
        issues = []
        for c in cases:
            moves = moves_from_setup(c["setup"])
            alg_moves = strip_d_wrapper(moves)
            htm = len(alg_moves)
            total_moves += htm
            cls = classify_moves(alg_moves)
            c["_htm"] = htm
            c["_class"] = cls
            for m in moves:
                if m not in VALID_MOVES:
                    if m.lower() not in {x.lower() for x in VALID_MOVES}:
                        issues.append(f"  #{c['id']} ({c['name']}): unknown move '{m}'")


        group_stats: dict[str, dict] = {}
        for c in cases:
            g = c.get("group", "Unknown")
            if g not in group_stats:
                group_stats[g] = {"count": 0, "total_htm": 0, "cases": []}
            group_stats[g]["count"] += 1
            group_stats[g]["total_htm"] += c["_htm"]
            group_stats[g]["cases"].append(c)

        print(f"\n  Total cases: {len(cases)}")
        print(f"  Avg HTM (excl. D-wrapper): {total_moves / len(cases):.1f}")
        print(f"  Issues found: {len(issues)}")
        if issues:
            for i in issues:
                print(f"    {i}")

        print(f"\n  Group breakdown:")
        for g, s in sorted(group_stats.items(), key=lambda x: -x[1]["count"]):
            avg = s["total_htm"] / s["count"]
            print(f"    {g:25s}  {s['count']:2d} cases  avg {avg:.1f} HTM")

        print(f"\n  Top 5 shortest:")
        for c in sorted(cases, key=lambda x: x["_htm"])[:5]:
            cls = c["_class"]
            print(f"    #{c['id']:2d} {c['name']:20s}  {c['_htm']:2d} HTM  "
                  f"(faces={cls['faces']} wide={cls['wide']} slice={cls['slices']} rot={cls['rotations']})")

        print(f"\n  Top 5 longest:")
        for c in sorted(cases, key=lambda x: -x["_htm"])[:5]:
            cls = c["_class"]
            print(f"    #{c['id']:2d} {c['name']:20s}  {c['_htm']:2d} HTM  "
                  f"(faces={cls['faces']} wide={cls['wide']} slice={cls['slices']} rot={cls['rotations']})")


# ── Subcommand: analyze ─────────────────────────────────────────────

def cmd_analyze(args: list[str]) -> None:
    if not args:
        print("Usage: cli.py analyze <algorithm>", file=sys.stderr)
        sys.exit(1)
    alg = " ".join(args)
    moves = parse_moves(alg)
    print(f"Algorithm: {alg}")
    print(f"Moves:     {' '.join(moves)}")
    print(f"Count:     {len(moves)} moves")
    cls = classify_moves(moves)
    print(f"Breakdown: {cls['faces']} face, {cls['wide']} wide, {cls['slices']} slice, {cls['rotations']} rotation(s)")
    print(f"Inverse:   {invert_alg(alg)}")

    face_count: dict[str, int] = {}
    for m in moves:
        base = m[0].upper()
        if base in "RLUDFB":
            face_count[base] = face_count.get(base, 0) + 1
    if face_count:
        print(f"Face usage: {', '.join(f'{k}={v}' for k, v in sorted(face_count.items()))}")


# ── Subcommand: scramble ────────────────────────────────────────────

def cmd_scramble(args: list[str]) -> None:
    kind = "oll"
    count = 1
    for i, a in enumerate(args):
        if a in ("oll", "pll"):
            kind = a
        elif a.isdigit():
            count = int(a)
    cases = load_oll() if kind == "oll" else load_pll()
    prefix = kind.upper()

    for _ in range(count):
        c = random.choice(cases)
        moves = moves_from_setup(c["setup"])
        alg = " ".join(strip_d_wrapper(moves))
        print(f"{prefix} #{c['id']:2d} {c['name']:20s}  {c.get('group', ''):20s}  |  {c['setup']}")
        if count > 1:
            print()


# ── Subcommand: flashcard ───────────────────────────────────────────

def cmd_flashcard(args: list[str]) -> None:
    fmt = "csv"
    output = None
    for i, a in enumerate(args):
        if a == "--format" and i + 1 < len(args):
            fmt = args[i + 1]
        elif not a.startswith("--"):
            output = a

    if output is None:
        output = str(ROOT / "ll_flashcards.csv")

    oll = [(c, "OLL") for c in load_oll()]
    pll = [(c, "PLL") for c in load_pll()]
    cases = oll + pll

    if fmt == "csv":
        with open(output, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["ID", "Type", "Name", "Group", "Algorithm", "HTM"])
            for c, kind in cases:
                alg = invert_alg(c["setup"])
                htm = count_moves_htm(alg)
                w.writerow([c["id"], kind, c["name"], c.get("group", ""), alg, htm])
        print(f"Wrote {len(cases)} flashcards to {output}")
    else:
        print(f"Unknown format: {fmt}", file=sys.stderr)
        sys.exit(1)


# ── Subcommand: export ──────────────────────────────────────────────

def cmd_export(args: list[str]) -> None:
    if not args:
        print("Usage: cli.py export <progress.json>", file=sys.stderr)
        sys.exit(1)
    path = Path(args[0])
    if not path.exists():
        print(f"File not found: {path}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(path.read_text())

    print(f"Progress report from: {path}")
    print(f"{'='*50}")

    if "masteryData" in data:
        md = data["masteryData"]
        counts = {"Mastered": 0, "Learning": 0, "Not Started": 0}
        for v in md.values():
            counts.get(v, counts.setdefault(v, 0))
            if v in counts:
                counts[v] += 1
        total = sum(counts.values())
        if total:
            print(f"  Mastered:    {counts.get('Mastered', 0)} ({counts.get('Mastered', 0)/total*100:.0f}%)")
            print(f"  Learning:    {counts.get('Learning', 0)} ({counts.get('Learning', 0)/total*100:.0f}%)")
            print(f"  Not Started: {counts.get('Not Started', 0)} ({counts.get('Not Started', 0)/total*100:.0f}%)")

    if "solveHistory" in data:
        sh = data["solveHistory"]
        all_times = []
        for case_id, records in sh.items():
            for r in records:
                all_times.append(r["time"])
        if all_times:
            print(f"\n  Total solves:  {len(all_times)}")
            print(f"  Best time:     {min(all_times):.2f}s")
            print(f"  Average time:  {sum(all_times)/len(all_times):.2f}s")
            print(f"  Worst time:    {max(all_times):.2f}s")
            cases_with_solves = len(sh)
            print(f"  Cases solved:  {cases_with_solves}")

    if not data:
        print("  (empty export)")


# ── Main ────────────────────────────────────────────────────────────

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: cli.py <command> [args...]")
        print()
        print("Commands:")
        print("  validate              Parse all algorithms, report stats and issues")
        print("  analyze <alg>         Analyze a single algorithm string")
        print("  scramble [oll|pll]    Generate random scramble(s)")
        print("  flashcard [file]      Generate Anki-compatible CSV flashcards")
        print("  export <file.json>    Read exported progress JSON and print summary")
        sys.exit(0)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    dispatch = {
        "validate": cmd_validate,
        "analyze": cmd_analyze,
        "scramble": cmd_scramble,
        "flashcard": cmd_flashcard,
        "export": cmd_export,
    }
    fn = dispatch.get(cmd)
    if fn:
        fn(args)
    else:
        print(f"Unknown command: {cmd}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
