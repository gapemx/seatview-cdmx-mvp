'use client';

import React from 'react';

/** Geometry for one clickable block on the map */
export type SeatMapRect = {
  id: string;            // e.g. "301"
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;        // optional text inside the block
};

/** Geometry for a whole venue map */
export type SeatMapGeometry = {
  viewBox: string;       // e.g. "0 0 1000 700"
  rects: SeatMapRect[];
};

type Props = {
  geometry: SeatMapGeometry;
  selected?: string | null;
  onSelect?: (id: string) => void;
};

/**
 * Simple interactive SVG map:
 *  - renders rectangles defined in geometry.rects
 *  - highlights the selected block
 *  - calls onSelect(id) when a block is clicked
 */
export default function SeatMap({ geometry, selected, onSelect }: Props) {
  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold mb-2">Mapa de secciones (MVP)</h2>

      <div className="rounded-xl border bg-white overflow-hidden">
        <svg
          viewBox={geometry.viewBox}
          className="w-full h-auto"
          role="img"
          aria-label="Mapa de secciones"
        >
          {/* background */}
          <rect x={0} y={0} width="100%" height="100%" fill="#f8fafc" />

          {geometry.rects.map((r) => {
            const isSelected = selected === r.id;
            return (
              <g
                key={r.id}
                onClick={() => onSelect?.(r.id)}
                cursor="pointer"
                role="button"
                aria-label={`Sección ${r.id}`}
              >
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  rx={8}
                  ry={8}
                  fill={isSelected ? '#0ea5e9' : '#94a3b8'}
                  opacity={isSelected ? 0.9 : 0.85}
                  stroke={isSelected ? '#0369a1' : '#475569'}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.max(12, Math.min(r.w, r.h) / 4)}
                  fill={isSelected ? 'white' : 'black'}
                  style={{ userSelect: 'none' }}
                >
                  {r.label ?? r.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected ? (
        <p className="mt-2 text-sm">
          Seleccionado: <span className="font-medium">{selected}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">Haz clic en una sección para seleccionarla.</p>
      )}
    </section>
  );
}