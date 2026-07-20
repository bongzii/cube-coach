import { Copy, Check } from "lucide-react";
import { ollAlgs } from "../data/ollAlgs";
import { pllAlgs } from "../data/pllAlgs";
import { f2lAlgs } from "../data/f2lAlgs";
import type { CaseItem } from "../App";
import { moveCount, f2lMoveCount } from "../utils/moveCount";

interface AlgorithmSelectorProps {
  llCase: CaseItem;
  caseType: "oll" | "pll" | "f2l";
  activeVariant: string;
  copiedId: number | null;
  onSelectVariant: (id: number, variant: string) => void;
  onCopy: (alg: string, id: number) => void;
}

export default function AlgorithmSelector({
  llCase,
  caseType,
  activeVariant,
  copiedId,
  onSelectVariant,
  onCopy,
}: AlgorithmSelectorProps) {
  const solverAlgs = caseType === "oll"
    ? ollAlgs[llCase.id]
    : caseType === "pll"
      ? pllAlgs[llCase.name]
      : f2lAlgs[llCase.id];
  const algCount = solverAlgs?.length ?? 0;
  const isF2L = caseType === "f2l";

  // F2L uses numeric labels (1, 2, 3, ...) in move-count order; the rest keep
  // the Pri / Alt N convention.
  const variantKeys = isF2L
    ? Array.from({ length: algCount }, (_, i) => String(i + 1))
    : ["primary", "alt1", "alt2", "alt3", "alt4", "alt5"];
  const variantLabels: Record<string, string> = { primary: "Pri", alt1: "Alt 1", alt2: "Alt 2", alt3: "Alt 3", alt4: "Alt 4", alt5: "Alt 5" };
  const variant = activeVariant || (isF2L ? "1" : "primary");

  let currentAlg: string;
  if (isF2L) {
    currentAlg = solverAlgs?.[parseInt(variant, 10) - 1] ?? solverAlgs?.[0] ?? "";
  } else if (variant === "primary") {
    currentAlg = solverAlgs?.[0] ?? llCase.setup.replace(/^D /, '').replace(/ D'$/, '');
  } else {
    const idx = parseInt(variant.replace("alt", ""), 10);
    currentAlg = idx < algCount ? solverAlgs![idx] : (solverAlgs?.[0] ?? llCase.setup.replace(/^D /, '').replace(/ D'$/, ''));
  }
  if (!currentAlg) currentAlg = llCase.setup.replace(/^D /, '').replace(/ D'$/, '');

  const visibleVariants = isF2L
    ? variantKeys
    : (variantKeys as string[]).filter(k => k === "primary" || parseInt(k.replace("alt", ""), 10) < algCount);

  return (
    <div className="mt-2 pt-2 border-t theme-border-main px-4">
      {visibleVariants.length > 1 && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-black theme-muted-text uppercase">Algs:</span>
          <div className="flex gap-1">
            {visibleVariants.map(k => (
              <button
                key={k}
                onClick={() => onSelectVariant(llCase.id, k)}
                className={`px-2 py-0.5 rounded-lg font-black text-[10px] uppercase transition-all active:scale-95 ${
                  variant === k ? "theme-btn-primary" : "theme-btn-ghost"
                }`}
              >
                 {isF2L ? k : variantLabels[k]}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-start gap-2">
        <span className="text-[9px] font-black theme-muted-text uppercase shrink-0 mt-0.5">
          Moves: {isF2L ? f2lMoveCount(currentAlg) : moveCount(currentAlg)}
        </span>
        <span className="text-xs font-black font-mono break-words flex-1">
          {currentAlg}
        </span>
        <button
          onClick={() => onCopy(currentAlg, llCase.id)}
          className="theme-control-surface shrink-0 p-1 rounded-lg border-2 theme-border-main transition-all theme-shadow-tiny hover:shadow-none active:scale-95"
          title="Copy Algorithm"
        >
          {copiedId === llCase.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
