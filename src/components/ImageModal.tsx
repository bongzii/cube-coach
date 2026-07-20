import { X, Copy } from "lucide-react";
import CaseImage from "./CaseImage";
import { CaseItem } from "../App";
import { ollAlgs } from "../data/ollAlgs";
import { pllAlgs } from "../data/pllAlgs";
import { f2lAlgs } from "../data/f2lAlgs";
import { moveCount, f2lMoveCount } from "../utils/moveCount";

interface ImageModalProps {
  enlargedImageId: number | null;
  onClose: () => void;
  cases: CaseItem[];
  caseType: "oll" | "pll" | "f2l";
  labelPrefix: string;
  f2lView?: "fr" | "fl" | "br" | "bl";
}

export default function ImageModal({ enlargedImageId, onClose, cases, caseType, labelPrefix, f2lView }: ImageModalProps) {
  if (enlargedImageId === null) return null;

  const enlargedCase = cases.find(c => c.id === enlargedImageId);
  if (!enlargedCase) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${labelPrefix} #${String(enlargedImageId).padStart(2, '0')} enlarged view`}
    >
      <div
        className="theme-card rounded-3xl border-2 theme-border-main theme-shadow-main p-8 max-w-lg w-full relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 bg-red-500 text-white border-2 theme-border-main rounded-lg hover:bg-red-400 transition-all theme-shadow-tiny active:scale-95"
          aria-label="Close enlarged image"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="text-center">
          <span className="text-xs font-black font-mono theme-pill-accent px-3 py-1 rounded border theme-border-main theme-shadow-tiny">
            {labelPrefix} #{String(enlargedImageId).padStart(2, '0')}
          </span>
        </div>

        <div className="my-6 flex items-center justify-center theme-accent-bg rounded-2xl border-2 theme-border-main p-6">
          <CaseImage
            id={enlargedCase.id}
            name={enlargedCase.name}
            type={caseType}
            f2lView={caseType === "f2l" ? f2lView : undefined}
            className="w-56 h-56 object-contain select-none"
          />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-display font-black uppercase tracking-tight">{enlargedCase.name}</h3>
          <span className="text-xs font-mono theme-muted-text font-bold uppercase tracking-wider block mt-1">
            {enlargedCase.group} · {enlargedCase.category}
          </span>
          <div className="mt-4 theme-accent-bg p-3 rounded-xl border theme-border-main inline-block theme-shadow-small">
            <span className="text-[9px] font-black theme-muted-text uppercase block mb-0.5">Setup Scramble</span>
            <span className="text-sm font-black font-mono whitespace-normal break-words">{enlargedCase.setup}</span>
          </div>
          {caseType === "oll" && enlargedCase.id && ollAlgs[enlargedCase.id] && (
            <div className="mt-3">
              <span className="text-[9px] font-black text-blue-600 uppercase block mb-1">Solution:</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-black font-mono text-blue-600 break-words">
                  {ollAlgs[enlargedCase.id][0]}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ollAlgs[enlargedCase.id][0]);
                  }}
                  className="shrink-0 p-1.5 theme-control-surface rounded-lg border-2 theme-border-main transition-all active:scale-95"
                  title="Copy Solution"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          {caseType === "oll" && enlargedCase.id && ollAlgs[enlargedCase.id]?.length > 1 && (
            <div className="mt-3 pt-3 border-t-2 theme-border-main">
              <span className="text-[9px] font-black theme-muted-text uppercase block mb-1.5">Alternate Algs:</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {ollAlgs[enlargedCase.id].slice(1).map((alg, i) => (
                  <button key={i}
                    onClick={() => navigator.clipboard.writeText(alg)}
                    className="text-[10px] font-mono font-bold theme-control-surface rounded-lg px-2 py-1 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[250px]">{alg}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {caseType === "pll" && enlargedCase.name && pllAlgs[enlargedCase.name] && (
            <div className="mt-3">
              <span className="text-[9px] font-black text-blue-600 uppercase block mb-1">Solution:</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-black font-mono text-blue-600 break-words">
                  {pllAlgs[enlargedCase.name][0]}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(pllAlgs[enlargedCase.name][0])}
                  className="shrink-0 p-1.5 theme-control-surface rounded-lg border-2 theme-border-main transition-all active:scale-95"
                  title="Copy Solution"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          {caseType === "pll" && enlargedCase.name && pllAlgs[enlargedCase.name]?.length > 1 && (
            <div className="mt-3 pt-3 border-t-2 theme-border-main">
              <span className="text-[9px] font-black theme-muted-text uppercase block mb-1.5">Alternate Algs:</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {pllAlgs[enlargedCase.name].slice(1).map((alg, i) => (
                  <button key={i}
                    onClick={() => navigator.clipboard.writeText(alg)}
                    className="text-[10px] font-mono font-bold theme-control-surface rounded-lg px-2 py-1 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[250px]">{alg}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {caseType === "f2l" && enlargedCase.id && f2lAlgs[enlargedCase.id] && (
            <div className="mt-3">
              <span className="text-[9px] font-black text-green-600 uppercase block mb-1">Solution:</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-black font-mono text-green-600 break-words">
                  {f2lAlgs[enlargedCase.id][0]}
                </span>
                <span className="text-[9px] font-black text-green-600 uppercase block mt-1">
                  Moves: {f2lMoveCount(f2lAlgs[enlargedCase.id][0])}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(f2lAlgs[enlargedCase.id][0])}
                  className="shrink-0 p-1.5 theme-control-surface rounded-lg border-2 theme-border-main transition-all active:scale-95"
                  title="Copy Solution"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          {caseType === "f2l" && enlargedCase.id && f2lAlgs[enlargedCase.id]?.length > 1 && (
            <div className="mt-3 pt-3 border-t-2 theme-border-main">
              <span className="text-[9px] font-black theme-muted-text uppercase block mb-1.5">Alternate Algs:</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {f2lAlgs[enlargedCase.id].slice(1).map((alg, i) => (
                  <button key={i}
                    onClick={() => navigator.clipboard.writeText(alg)}
                    className="text-[10px] font-mono font-bold theme-control-surface rounded-lg px-2 py-1 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[250px]">{alg}</span>
                    <span className="text-[9px] font-black theme-muted-text uppercase ml-0.5">Moves: {f2lMoveCount(alg)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
