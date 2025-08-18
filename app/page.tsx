cat > app/page.tsx <<'EOF'
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Venue = { id: number; name: string; slug: string; type: string | null; capacity: number | null };
type Summary = { venue_id: number; rating_count: number; avg_stars: string };

function Stars({ value = 0 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const empties = 5 - full;
  return (
    <span className="font-medium text-amber-600" aria-label={`${v.toFixed(1)} estrellas`}>
      {'★'.repeat(full)}
      {'☆'.repeat(empties)}
      <span className="ml-1 text-slate-600">{v.toFixed(1)}</span>
    </span>
  );
}

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [summary, setSummary] = useState<Record<number, Summary>>({});

  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from('venues').select('*').order('name');
      setVenues(v || []);
      const { data: s } = await supabase.from('venue_rating_summary').select('*');
      const map: Record<number, Summary> = {};
      (s || []).forEach((row: any) => (map[row.venue_id] = row));
      setSummary(map);
    })();
  }, []);

  return (
    <main>
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">SeatView — Ciudad de México</h1>
        <p className="mt-2 text-slate-600">
          Explora recintos y mira fotos reales desde cada sección. Súbela tu también.
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {venues.map((v) => (
          <li key={v.id} className="card p-4">
            <a href={`/venue/${v.slug}`} className="block">
              <h3 className="font-semibold leading-snug">{v.name}</h3>
              <div className="mt-1 text-xs text-slate-600">
                {v.type || 'recinto'} · {v.capacity ? `${v.capacity.toLocaleString()} lugares` : 'capacidad n/d'}
              </div>
              {summary[v.id] ? (
                <div className="mt-3 text-sm">
                  <Stars value={Number(summary[v.id].avg_stars)} />{' '}
                  <span className="text-slate-500">({summary[v.id].rating_count})</span>
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-500">Sin calificaciones aún</div>
              )}
              <div className="mt-4 text-indigo-700 text-sm underline">Ver galería →</div>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
EOF
