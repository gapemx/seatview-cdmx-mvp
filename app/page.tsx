'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

type Venue = {
  id: number;
  name: string;
  slug: string;
  type: string | null;
  capacity: number | null;
  city: string | null;
};

export default function HomePage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('venues')
        .select('id, name, slug, type, capacity, city')
        .order('name', { ascending: true });

      setVenues(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">SeatView — Ciudad de México (MVP)</h1>

      {loading ? (
        <p className="text-slate-600">Cargando…</p>
      ) : (
        <ul className="space-y-3">
          {venues.map((v) => (
            <li key={v.id} className="card p-4 hover:bg-slate-50 transition">
              <Link href={`/venue/${v.slug}`} className="block">
                <div className="font-medium">{v.name}</div>
                <div className="text-sm text-slate-600">
                  {v.type ?? 'venue'} ·{' '}
                  {v.capacity
                    ? `${v.capacity.toLocaleString('es-MX')} lugares`
                    : 'capacidad desconocida'}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
