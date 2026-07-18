interface CaseImageProps {
  id: number;
  type: "oll" | "pll";
  name?: string;
  className?: string;
}

export default function CaseImage({ id, type, name, className = "" }: CaseImageProps) {
  const filename = type === "pll" && name ? name : String(id);
  const dir = type === "oll" ? "olls  numbered" : "plls lettered";
  return (
    <img
      src={`./${dir}/${filename}.svg`}
      alt={`${type.toUpperCase()} Case ${id}`}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}
