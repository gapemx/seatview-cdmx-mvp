'use client';
import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function VenuePage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : (params?.slug as string);
  const [venue, setVenue] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ section: '', row: '', seat: '', stars: 0, caption: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from('venues').select('*').eq('slug', slug).single();
      setVenue(v);
      if (v) {
        const { data: u } = await supabase.from('uploads').select('*').eq('venue_id', v.id).order('created_at', { ascending: false });
        setUploads(u || []);
      }
    })();
  }, [slug]);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!venue || !file) return;
    setBusy(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const key = `${venue.slug}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('seat-photos').upload(key, file, {
        cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg'
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('seat-photos').getPublicUrl(key);

      const { error: insErr } = await supabase.from('uploads').insert({
        venue_id: venue.id,
        section: form.section || null,
        row: form.row || null,
        seat: form.seat || null,
        stars: form.stars || null,
        caption: form.caption || null,
        photo_path: pub.publicUrl
      });
      if (insErr) throw insErr;

      const { data: u } = await supabase.from('uploads').select('*').eq('venue_id', venue.id).order('created_at', { ascending: false });
      setUploads(u || []);
      setForm({ section: '', row: '', seat: '', stars: 0, caption: '' });
      setFile(null);
      alert('¡Gracias! Tu foto quedó guardada.');
    } catch (err: any) {
      alert('Error subiendo: ' + (err?.message || 'desconocido'));
    } finally {
      setBusy(false);
    }
  }

  if (!venue) return <main className="p-6">Cargando…</main>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <a href="/" className="text-sm underline">← Volver</a>
      <h1 className="text-2xl font-bold mt-2">{venue.name}</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Sube tu vista</h2>
        <form onSubmit={handleUpload} className="grid gap-2 max-w-xl">
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Sección" value={form.section} onChange={e=>setForm({...form, section:e.target.value})} className="border rounded p-2" />
            <input placeholder="Fila" value={form.row} onChange={e=>setForm({...form, row:e.target.value})} className="border rounded p-2" />
            <input placeholder="Asiento" value={form.seat} onChange={e=>setForm({...form, seat:e.target.value})} className="border rounded p-2" />
          </div>
          <div className="grid grid-cols-6 items-center gap-2">
            <label className="col-span-2">Estrellas (0–5)</label>
            <input type="number" min={0} max={5} step={0.5} value={form.stars}
              onChange={e=>setForm({...form, stars:Number(e.target.value)})}
              className="border rounded p-2 col-span-4" />
          </div>
          <textarea placeholder="Comentario (opcional)" value={form.caption} onChange={e=>setForm({...form, caption:e.target.value})} className="border rounded p-2" />
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} className="border rounded p-2" />
          <button disabled={busy || !file} className="bg-black text-white rounded p-2 disabled:opacity-50">{busy ? 'Subiendo…' : 'Subir'}</button>
          <p className="text-xs opacity-70">Privacidad: borraremos metadatos EXIF al mostrar la imagen en el futuro; por ahora se guardan tal cual (MVP).</p>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Galería de vistas ({uploads.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {uploads.map(u => (
            <figure key={u.id} className="border rounded overflow-hidden">
              <img src={u.photo_path} alt={u.caption || 'Vista del asiento'} className="w-full object-cover" />
              <figcaption className="p-2 text-sm">
                <div className="font-medium">{u.stars ? `${Number(u.stars).toFixed(1)} ⭐` : 'Sin calificación'}</div>
                <div className="opacity-80">{[u.section && `Sección ${u.section}`, u.row && `Fila ${u.row}`, u.seat && `Asiento ${u.seat}`].filter(Boolean).join(' · ')}</div>
                {u.caption && <div className="mt-1">{u.caption}</div>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
