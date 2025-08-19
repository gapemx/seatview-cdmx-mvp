'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

import SeatMap from '../../../components/SeatMap';
import arenaCiudadSample from '../../../maps/arena-ciudad-sample';

type UploadRow = {
  id: number;
  venue_id: number;
  section: string | null;
  row: string | null;
  seat: string | null;
  stars: number | null;
  caption: string | null;
  photo_path: string;
  created_at: string;
};

type VenueRow = {
  id: number;
  name: string;
  slug: string;
};

export default function VenuePage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : (params?.slug as string);

  const [venue, setVenue] = useState<VenueRow | null>(null);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // section selected via the SVG map
  const [selectedSection, setSelectedSection] = useState<string>('');

  // form values (Sección / Fila / Asiento / Estrellas / Comentario)
  const [form, setForm] = useState({
    section: '',
    row: '',
    seat: '',
    stars: 0,
    caption: '',
  });

  // Load venue + uploads
  useEffect(() => {
    (async () => {
      const { data: v } = await supabase
        .from('venues')
        .select('*')
        .eq('slug', slug)
        .single<VenueRow>();
      setVenue(v || null);

      if (v) {
        const { data: u } = await supabase
          .from('uploads')
          .select('*')
          .eq('venue_id', v.id)
          .order('created_at', { ascending: false })
          .returns<UploadRow[]>();
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

      // 1) Upload file to storage
      const { error: upErr } = await supabase.storage
        .from('seat-photos')
        .upload(key, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });
      if (upErr) throw upErr;

      // 2) Public URL
      const { data: pub } = supabase.storage.from('seat-photos').getPublicUrl(key);

      // Prefer the SVG selection, fall back to manual Section input
      const sectionToSave = selectedSection || form.section || null;

      // 3) Insert DB row
      const { error: insErr } = await supabase.from('uploads').insert({
        venue_id: venue.id,
        section: sectionToSave,
        row: form.row || null,
        seat: form.seat || null,
        stars: form.stars || null,
        caption: form.caption || null,
        photo_path: pub.publicUrl,
      });
      if (insErr) throw insErr;

      // 4) Refresh gallery
      const { data: u } = await supabase
        .from('uploads')
        .select('*')
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false })
        .returns<UploadRow[]>();
      setUploads(u || []);

      // Reset form state
      setForm({ section: '', row: '', seat: '', stars: 0, caption: '' });
      setSelectedSection('');
      setFile(null);
      setPreview(null);

      alert('¡Gracias! Tu foto quedó guardada.');
    } catch (err: any) {
      alert('Error subiendo: ' + (err?.message || 'desconocido'));
    } finally {
      setBusy(false);
    }
  }

  if (!venue) return <div className="p-4">Cargando…</div>;

  // Attach sample geometry only for Arena Ciudad de México (placeholder)
  const mapGeometry = slug === 'arena-ciudad-de-mexico' ? arenaCiudadSample : null;

  return (
    <div className="pt-2">
      <a href="/" className="text-sm underline">← Volver</a>
      <h1 className="mt-2 text-2xl font-bold">{venue.name}</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          {mapGeometry && (
            <SeatMap
              geometry={mapGeometry}
              selected={selectedSection}
              onSelect={(id) => {
                setSelectedSection(id);
                setForm((f) => ({ ...f, section: id }));
              }}
            />
          )}

          <section className="card p-4">
            <h2 className="text-lg font-semibold">Sube tu vista</h2>

            <form onSubmit={handleUpload} className="mt-3 grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="input"
                  placeholder="Sección"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Fila"
                  value={form.row}
                  onChange={(e) => setForm({ ...form, row: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Asiento"
                  value={form.seat}
                  onChange={(e) => setForm({ ...form, seat: e.target.value })}
                />
              </div>

              <div>
                <div className="label mb-1">Calificación</div>
                <div className="flex gap-1 text-2xl text-amber-600">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, stars: n })}
                    >
                      {n <= form.stars ? '★' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-slate-600">{form.stars} / 5</span>
                </div>
              </div>

              <textarea
                className="input h-24"
                placeholder="Comentario (opcional)"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />

              <div className="grid gap-2">
                <label className="btn w-fit">
                  Elegir foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPick(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </label>
                <div className="text-xs text-slate-500">
                  {file ? file.name : 'Ningún archivo seleccionado'}
                </div>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-xl border object-cover aspect-video"
                  />
                )}
              </div>

              <button disabled={busy || !file} className="btn btn-primary">
                {busy ? 'Subiendo…' : 'Subir'}
              </button>
              <p className="text-xs text-slate-500">
                Privacidad: en una versión posterior borraremos metadatos EXIF y aplicaremos
                difuminado de rostros automáticamente.
              </p>
            </form>
          </section>
        </div>

        <section className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">
            Galería de vistas ({uploads.length})
          </h2>

          {uploads.length === 0 ? (
            <div className="card p-6 text-slate-600">
              Aún no hay fotos. ¡Sé el primero en subir una!
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uploads.map((u) => (
                <figure key={u.id} className="card overflow-hidden">
                  <img
                    src={u.photo_path}
                    alt={u.caption || 'Vista del asiento'}
                    className="w-full aspect-video object-cover"
                  />
                  <figcaption className="p-3 text-sm">
                    <div className="font-medium">
                      {u.stars ? '★'.repeat(Number(u.stars)) : 'Sin calificación'}
                    </div>
                    <div className="text-slate-600">
                      {[
                        u.section && `Sección ${u.section}`,
                        u.row && `Fila ${u.row}`,
                        u.seat && `Asiento ${u.seat}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                    {u.caption && <div className="mt-1">{u.caption}</div>}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}