'use client';
import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams } from 'next/navigation';

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1 text-2xl text-amber-600">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="leading-none"
          aria-label={`${n} estrellas`}
        >
          {n <= value ? '★' : '☆'}
        </button>
      ))}
      <span className="ml-2 text-sm text-slate-600">{value} / 5</span>
    </div>
  );
}

export default function VenuePage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : (params?.slug as string);
  const [venue, setVenue] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ section: '', row: '', seat: '', stars: 0, caption: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from('venues').select('*').eq('slug', slug).single();
      setVenue(v);
      if (v) {
        const { data: u } = await supabase
          .from('uploads')
          .select('*')
          .eq('venue_id', v.id)
          .order('created_at', { ascending: false });
        setUploads(u || []);
      }
    })();
  }, [slug]);

  function onPick(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!venue || !file) return;
    setBusy(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const key = `${venue.slug}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('seat-photos').upload(key, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
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
        photo_path: pub.publicUrl,
      });
      if (insErr) throw insErr;

      const { data: u } = await supabase
        .from('uploads')
        .select('*')
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false });
      setUploads(u || []);
      setForm({ section: '', row: '', seat: '', stars: 0, caption: '' });
      setFile(null);
      setPreview(null);
      alert('¡Gracias! Tu foto quedó guardada.');
    } catch (err: any) {
      alert('Error subiendo: ' + (err?.message || 'desconocido'));
    } finally {
      setBusy(false);
    }
  }

  if (!venue) return <main>Cargando…</main>;

  return (
    <main>
      <a href="/" className="text-sm underline">← Volver</a>
      <h1 className="mt-2 text-2xl font-bold">{venue.name}</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <section className="card p-4 md:col-span-1">
          <h2 className="text-lg font-semibold">Sube tu vista</h2>
          <form onSubmit={handleUpload} className="mt-3 grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Sección" value={form.section} onChange={e=>setForm({...form, section:e.target.value})} className="input" />
              <input placeholder="Fila" value={form.row} onChange={e=>setForm({...form, row:e.target.value})} className="input" />
              <input placeholder="Asiento" value={form.seat} onChange={e=>setForm({...form, seat:e.target.value})} className="input" />
            </div>

            <div>
              <div className="label mb-1">Calificación</div>
              <StarInput value={form.stars} onChange={(n)=>setForm({...form, stars:n})} />
            </div>

            <textarea placeholder="Comentario (opcional)" value={form.caption} onChange={e=>setForm({...form, caption:e.target.value})} className="input h-24" />

            <div className="grid gap-2">
              <input type="file" accept="image/*" onChange={e=>onPick(e.target.files?.[0] || null)} className="input py-1" />
              {preview && <img src={preview} alt="Preview" className="rounded-xl border object-cover aspect-video" />}
            </div>

            <button disabled={busy || !file} className="btn btn-primary">{busy ? 'Subiendo…' : 'Subir'}</button>
            <p className="text-xs text-slate-5
