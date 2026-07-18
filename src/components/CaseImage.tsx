interface CaseImageProps {
  id: number;
  type: "oll" | "pll" | "f2l";
  name?: string;
  className?: string;
  f2lView?: "fr" | "fl" | "br" | "bl";
}

export default function CaseImage({ id, type, name, className = "", f2lView }: CaseImageProps) {
  let filename: string;
  let dir: string;
  if (type === "f2l") {
    // F2L cases are pre-rendered from each slot orientation (4 views).
    filename = f2lView ? `${id}-${f2lView}` : String(id);
    dir = "f2l";
  } else if (type === "pll" && name) {
    filename = name;
    dir = "plls lettered";
  } else {
    filename = String(id);
    dir = "olls  numbered";
  }
  return (
    <img
      src={`./${dir}/${filename}.svg`}
      alt={`${type.toUpperCase()} Case ${id}`}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}
