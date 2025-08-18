'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Venue = { id: number; name: string; slug: string; type: string | null; capacity: number | null };
type Summary = { venue_id: number; rating_count: number; avg_stars: string };

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
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">SeatView — Ciudad de México (MVP)</h1>
      <p className="mb-6">Explora recintos y sube la vista desde tu asiento.</p>
      <ul className="grid gap-3">
        {venues.map(v => (
          <li key={v.id} className="border rounded p-4">
            <a href={`/venue/${v.slug}`} className="text-lg font-semibold hover:underline">{v.name}</a>
            <div className="text-sm opacity-80">{v.type || 'recinto'} · {v.capacity ? `${v.capacity.toLocaleString()} lugares` : 'capacidad n/d'}</div>
            {summary[v.id] && (
              <div className="text-sm mt-1">{Number(summary[v.id].avg_stars).toFixed(1)} ⭐ ({summary[v.id].rating_count})</div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
