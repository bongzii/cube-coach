import { X } from "lucide-react";

interface NotationLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const notationGroups = [
  {
    title: "Face Turns (clockwise)",
    items: [
      { symbol: "R", desc: "Right face" },
      { symbol: "L", desc: "Left face" },
      { symbol: "U", desc: "Upper face" },
      { symbol: "D", desc: "Down face" },
      { symbol: "F", desc: "Front face" },
      { symbol: "B", desc: "Back face" },
    ],
  },
  {
    title: "Modifiers",
    items: [
      { symbol: "R'", desc: "Counter-clockwise (prime)" },
      { symbol: "R2", desc: "180° turn (half)" },
      { symbol: "( )", desc: "Triggers / fingertrick groups" },
    ],
  },
  {
    title: "Wide Moves (two layers)",
    items: [
      { symbol: "r", desc: "R + middle (wide R)" },
      { symbol: "l", desc: "L + middle (wide L)" },
      { symbol: "u", desc: "U + middle (wide U)" },
      { symbol: "d", desc: "D + middle (wide D)" },
      { symbol: "f", desc: "F + middle (wide F)" },
      { symbol: "b", desc: "B + middle (wide B)" },
    ],
  },
  {
    title: "Slice Moves (middle layer)",
    items: [
      { symbol: "M", desc: "Between R & L (R direction)" },
      { symbol: "E", desc: "Between U & D (D direction)" },
      { symbol: "S", desc: "Between F & B (F direction)" },
    ],
  },
  {
    title: "Cube Rotations",
    items: [
      { symbol: "x", desc: "Rotate whole cube (R direction)" },
      { symbol: "y", desc: "Rotate whole cube (U direction)" },
      { symbol: "z", desc: "Rotate whole cube (F direction)" },
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
      aria-label="Cube notation legend"
    >
      <div
        className="theme-card rounded-3xl border-2 theme-border-main theme-shadow-main p-6 max-w-xl w-full relative animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 bg-red-500 text-white border-2 theme-border-main rounded-lg hover:bg-red-400 transition-all theme-shadow-tiny active:scale-95"
          aria-label="Close notation legend"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <h2 className="text-xl font-display font-black uppercase tracking-tight mb-6">
          Notation Legend
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
                    className="flex items-center gap-2 theme-muted-bg rounded-lg border-2 theme-border-main px-3 py-2 theme-shadow-tiny"
                  >
                    <code className="text-sm font-black font-mono theme-pill-accent px-1.5 py-0.5 rounded border theme-border-main">
                      {item.symbol}
                    </code>
                    <span className="text-xs font-bold">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t-2 theme-border-main">
          <p className="text-xs theme-muted-text font-bold leading-relaxed">
            All algorithms are written in <strong>standard WCA notation</strong>.
            Moves are applied as if you are looking directly at that face.
            A <code className="text-xs font-mono font-black theme-pill-accent px-1 rounded">'</code> after a move
            means turn that face counter-clockwise.
          </p>
        </div>
      </div>
    </div>
  );
}
