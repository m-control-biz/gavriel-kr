import { asset } from "@/lib/paths";

type AvatarProps = {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-12 w-12 text-sm",
  md: "h-16 w-16 text-base",
  lg: "h-24 w-24 text-xl",
  xl: "h-[7.5rem] w-[7.5rem] text-2xl",
};

export function initialsOf(name: string) {
  const skip = new Set(["ד״ר", 'ד"ר', "מר", "גב׳", "גב'", "פרופ׳", "פרופ'"]);
  const parts = name.split(/\s+/).filter((p) => p && !skip.has(p));
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] p-[2px] shadow-glow-sm ${sizes[size]} ${className}`}
    >
      <div className="h-full w-full overflow-hidden rounded-full bg-slate-800">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(src)}
            alt={name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 font-bold text-cyan-200">
            {initialsOf(name)}
          </div>
        )}
      </div>
    </div>
  );
}
