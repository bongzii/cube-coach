import { Copy, Check } from "lucide-react";
import { ollAlgs } from "../data/ollAlgs";
import { pllAlgs } from "../data/pllAlgs";
import { f2lAlgs } from "../data/f2lAlgs";
import type { CaseItem } from "../App";

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
  const variantKeys = ["primary", "alt1", "alt2", "alt3", "alt4", "alt5"] as const;
  const variantLabels: Record<string, string> = { primary: "Pri", alt1: "Alt 1", alt2: "Alt 2", alt3: "Alt 3", alt4: "Alt 4", alt5: "Alt 5" };
  const variant = activeVariant || "primary";
  let currentAlg = solverAlgs?.[0] || llCase.setup.replace(/^D /, '').replace(/ D'$/, '');
  if (variant !== "primary") {
    const idx = parseInt(variant.replace("alt", ""));
    if (idx < algCount) {
      currentAlg = solverAlgs![idx];
    }
  }
  const visibleVariants = variantKeys.filter(k => k === "primary" || (parseInt(k.replace("alt", "")) < algCount));

  return (
    <div className="mt-2 pt-2 border-t theme-border-main px-4">
      {visibleVariants.length > 1 && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-black theme-muted-text uppercase">Algs:</span>
          <select
            value={variant}
            onChange={(e) => onSelectVariant(llCase.id, e.target.value)}
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xl border-2 theme-border-main theme-control-surface cursor-pointer"
          >
            {visibleVariants.map(k => (
              <option key={k} value={k}>{variantLabels[k]}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-start gap-2">
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
