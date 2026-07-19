import { X } from "lucide-react";

interface NotationLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const notationGroups: {
  title: string;
  items: { symbol: string; desc: string; vc?: string }[];
}[] = [
  {
    title: "Single Layer Turns",
    items: [
      { symbol: "U", desc: "Up", vc: "./notations/U.svg" },
      { symbol: "D", desc: "Down", vc: "./notations/D.svg" },
      { symbol: "R", desc: "Right", vc: "./notations/R.svg" },
      { symbol: "L", desc: "Left", vc: "./notations/L.svg" },
      { symbol: "F", desc: "Front", vc: "./notations/F.svg" },
      { symbol: "B", desc: "Back", vc: "./notations/B.svg" },
    ],
  },
  {
    title: "Wide Layer Turns",
    items: [
      { symbol: "Uw / u", desc: "Wide Up", vc: "./notations/Uw.svg" },
      { symbol: "Dw / d", desc: "Wide Down", vc: "./notations/Dw.svg" },
      { symbol: "Rw / r", desc: "Wide Right", vc: "./notations/Rw.svg" },
      { symbol: "Lw / l", desc: "Wide Left", vc: "./notations/Lw.svg" },
      { symbol: "Fw / f", desc: "Wide Front", vc: "./notations/Fw.svg" },
      { symbol: "Bw / b", desc: "Wide Back", vc: "./notations/Bw.svg" },
    ],
  },
  {
    title: "Cube Rotations & Slice Moves",
    items: [
      { symbol: "x", desc: "Axis rotation", vc: "./notations/x.svg" },
      { symbol: "y", desc: "Axis rotation", vc: "./notations/y.svg" },
      { symbol: "z", desc: "Axis rotation", vc: "./notations/z.svg" },
      { symbol: "M", desc: "Middle slice", vc: "./notations/M.svg" },
      { symbol: "E", desc: "Equator slice", vc: "./notations/E.svg" },
      { symbol: "S", desc: "Standing slice", vc: "./notations/S.svg" },
    ],
  },
];

export default function NotationLegend({ isOpen, onClose }: NotationLegendProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cube move notation guide"
    >
      <div
        className="theme-card rounded-3xl border-2 theme-border-main theme-shadow-main p-6 max-w-2xl w-full relative animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 bg-red-500 text-white border-2 theme-border-main rounded-lg hover:bg-red-400 transition-all theme-shadow-tiny active:scale-95"
          aria-label="Close move notation guide"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <h2 className="text-xl font-display font-black uppercase tracking-tight mb-6">
          Move Notation
        </h2>

        <div className="space-y-6">
          {notationGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-black uppercase tracking-wider theme-muted-text mb-2 font-sans">
                {group.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex items-center gap-2 theme-muted-bg rounded-lg border-2 theme-border-main p-2 theme-shadow-tiny"
                  >
                    {item.vc && (
                      <img
                        src={item.vc}
                        alt={`${item.symbol} move`}
                        className="w-[70px] h-[70px] shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className={item.vc ? "flex flex-col gap-0.5" : "flex items-center gap-2"}>
                      <code className="text-sm font-black font-mono theme-pill-accent px-1.5 py-0.5 rounded border theme-border-main">
                        {item.symbol}
                      </code>
                      <span className="text-xs font-bold leading-tight">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t-2 theme-border-main">
          <p className="text-xs theme-muted-text font-bold leading-relaxed">
            All moves follow standard WCA notation.
          </p>
        </div>
      </div>
    </div>
  );
}
