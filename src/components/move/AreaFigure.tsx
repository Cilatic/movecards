import type { Area } from "@/lib/data/exercises";

/* One flat, chunky older-adult pose per area. Colours via design tokens. */
function Head({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" className="fill-skin" />
      <path d={`M${x - 13} ${y - 1}a13 13 0 0 1 26 0c-6-5-20-5-26 0z`} className="fill-hair" />
    </g>
  );
}

export function AreaFigure({ pose, className = "h-28 w-28" }: { pose: Area["pose"]; className?: string }) {
  const limb = { strokeWidth: 11, strokeLinecap: "round" as const, fill: "none" };
  return (
    <svg viewBox="0 0 100 110" className={className} aria-hidden="true">
      {pose === "chair-stand" && (
        <g>
          <path d="M20 40v66M20 72h28M48 72v34" className="stroke-blush" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="44" y="34" width="20" height="36" rx="10" className="fill-mustard" />
          <path d="M60 44l16 8" className="stroke-mustard" {...limb} />
          <path d="M50 68l20 4v30" className="stroke-night" {...limb} />
          <Head x={54} y={22} />
        </g>
      )}
      {pose === "arms-up" && (
        <g>
          <rect x="40" y="40" width="20" height="38" rx="10" className="fill-balance" />
          <path d="M44 46L30 14M56 46l14-32" className="stroke-balance" {...limb} />
          <path d="M45 76v26M55 76v26" className="stroke-night" {...limb} />
          <Head x={50} y={28} />
        </g>
      )}
      {pose === "marching" && (
        <g>
          <rect x="40" y="36" width="20" height="38" rx="10" className="fill-mustard" />
          <path d="M44 44l-12 18M56 44l12-14" className="stroke-mustard" {...limb} />
          <path d="M45 72v30M55 72l14 6v-2" className="stroke-night" {...limb} />
          <Head x={50} y={24} />
        </g>
      )}
      {pose === "one-leg" && (
        <g>
          <rect x="40" y="36" width="20" height="38" rx="10" className="fill-mustard" />
          <path d="M44 44L22 50M56 44l22 6" className="stroke-mustard" {...limb} />
          <path d="M47 72v30M55 72l12 10-6 6" className="stroke-night" {...limb} />
          <Head x={50} y={24} />
        </g>
      )}
      {pose === "seated-calm" && (
        <g>
          <rect x="38" y="46" width="24" height="34" rx="12" className="fill-mustard" />
          <path d="M42 56l-6 18 14 4M58 56l6 18-14 4" className="stroke-mustard" {...limb} />
          <path d="M28 92h44" className="stroke-night" strokeWidth="13" strokeLinecap="round" />
          <Head x={50} y={34} />
        </g>
      )}
    </svg>
  );
}
