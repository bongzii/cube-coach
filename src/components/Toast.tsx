import { Check } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div className="bg-black text-white px-5 py-2.5 rounded-xl border-2 theme-border-main font-bold text-xs font-mono flex items-center gap-2 shadow-lg">
        <Check className="w-3.5 h-3.5 text-green-400" />
        {message}
      </div>
    </div>
  );
}
