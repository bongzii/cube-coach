interface F2LSlotIndicatorProps {
  slot: 'fr' | 'fl' | 'br' | 'bl';
  edgeOriented: boolean;
  className?: string;
}

const SLOT_LABELS: Record<'fr' | 'fl' | 'br' | 'bl', string> = {
  fr: 'FR',
  fl: 'FL',
  br: 'BR',
  bl: 'BL'
};

const SLOT_COLORS: Record<'fr' | 'fl' | 'br' | 'bl', string> = {
  fr: '#3b82f6',
  fl: '#8b5cf6',
  br: '#f59e0b',
  bl: '#10b981'
};

export default function F2LSlotIndicator({ slot, edgeOriented, className = '' }: F2LSlotIndicatorProps) {
  const slotColor = SLOT_COLORS[slot];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${className}`}>
      <span
        className="w-5 h-5 flex items-center justify-center rounded-md text-white text-[9px] font-black"
        style={{ backgroundColor: slotColor }}
        title={`Slot: ${SLOT_LABELS[slot]} (Front-Right / Front-Left / Back-Right / Back-Left)`}
      >
        {SLOT_LABELS[slot]}
      </span>
    </span>
  );
}