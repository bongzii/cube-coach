interface Props {
  scramble: string;
}

export default function ScrambleNet({ scramble }: Props) {
  const url = `https://puzzle-generator.robiningelbrecht.be/cube?view=net&size=256&cube[algorithm]=${encodeURIComponent(scramble)}`;
  return (
    <div className="theme-card rounded-2xl border-2 theme-border-main p-3 mb-4 theme-shadow-small flex items-center justify-center overflow-hidden">
      <img src={url} alt="Scramble net" className="w-full max-w-[280px] h-auto select-none" />
    </div>
  );
}
