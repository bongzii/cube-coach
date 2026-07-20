import { useEffect, useRef } from "react";
import { TwistyPlayer } from "cubing/twisty";

interface Props {
  scramble: string;
}

export default function ScrambleNet({ scramble }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<TwistyPlayer | null>(null);

  useEffect(() => {
    const p = new TwistyPlayer({
      puzzle: "3x3x3",
      visualization: "2D",
      background: "none",
      controlPanel: "none",
      experimentalSetupAlg: scramble,
      alg: "",
    });
    p.style.width = "100%";
    p.style.height = "220px";
    host.current!.appendChild(p);
    player.current = p;
    return () => {
      host.current!.removeChild(p);
      player.current = null;
    };
    // ponytail: mount once, update via scramble effect below
  }, []);

  useEffect(() => {
    if (player.current) player.current.experimentalSetupAlg = scramble;
  }, [scramble]);

  return (
    <div
      ref={host}
      className="theme-card rounded-2xl border-2 theme-border-main p-3 mb-4 theme-shadow-small flex items-center justify-center overflow-hidden"
    />
  );
}
