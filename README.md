# SeatView CDMX — MVP

A minimal Next.js + Supabase app to list Mexico City venues, upload seat photos, and rate them.

## 1) Supabase setup
- Create a project at https://app.supabase.com
- In **SQL Editor**, paste the contents of `supabase/setup.sql` and run.
- In **Storage**, create a bucket called `seat-photos` and set it to **public**.

Copy **Project URL** and **anon public key** from Settings → API.

## 2) Configure env
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3) Run locally
```
npm install
npm run dev
```

Visit http://localhost:3000

## 4) Deploy on Vercel
- Push to GitHub and import on Vercel.
- Add the two env vars in Project Settings → Environment Variables.
- Redeploy.

---

This is an MVP with open uploads. Add auth/moderation before public launch.
# seatview-cdmx-mvp
# seatview-cdmx-mvp
# seatview-cdmx-mvp
