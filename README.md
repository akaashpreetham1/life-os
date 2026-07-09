# Life OS

A private synced web app for capture, focus, habits, and notes.

## Backend setup

Create a Supabase project and run `supabase-schema.sql` in the SQL editor.

Then configure these production environment variables on the deployed site:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` with either a legacy `service_role` key or the newer Supabase `sb_secret_...` secret key
- `LIFE_OS_STATE_KEY` optional, defaults to `primary`

The browser never receives the service role key. It talks only to `/api/state`,
and the server writes one private Life OS state document.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
