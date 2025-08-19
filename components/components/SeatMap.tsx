'use client';

type Rect = {
  id: string;           // e.g. "301"
  x: number; y: number; // top-left
  w: number; h: number; // width/height
  label?: string;
};

export type SeatMapGeometry = {
  viewBox: string;      // e.g. "0 0 1000 700"
  rects: Rect[];
};

export default function SeatMap({
  geometry,
  selected,
  onSelect,
}: {
  geometry: SeatMapGeometry;
  selected?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="card p-3">
      <div className="text-sm text-slate-600 mb-2">
        Selecciona una sección y luego sube tu foto.
      </div>

      <svg viewBox={geometry.viewBox} className="w-full h-auto" role="img" aria-label="Mapa de secciones">
        <rect x="0" y="0" width="100%" height="100%" fill="#f8fafc" />
        {geometry.rects.map((s) => {
          const isSel = selected === s.id;
          return (
            <g
              key={s.id}
              tabIndex={0}
              onClick={() => onSelect(s.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(s.id)}
              role="button"
              aria-label={`Sección ${s.id}`}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={s.x}
                y={s.y}
                width={s.w}
                height={s.h}
                rx={8}
                ry={8}
                fill={isSel ? '#4f46e5' : '#e2e8f0'}
                stroke={isSel ? '#4338ca' : '#94a3b8'}
                strokeWidth={isSel ? 3 : 2}
              />
              <text
                x={s.x + s.w / 2}
                y={s.y + s.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(10, Math.min(s.w, s.h) / 3)}
                fill={isSel ? 'white' : '#0f172a'}
              >
                {s.label ?? s.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
