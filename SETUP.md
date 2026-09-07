# 懷玉教育 — Deployment Guide

## One-time setup (~30 minutes)

### Step 1: Supabase (free)
1. Go to supabase.com → New Project
2. Dashboard → SQL Editor → New Query
3. Paste the contents of `supabase-schema.sql` → Run
4. Settings → API → copy:
   - Project URL  → SUPABASE_URL
   - anon/public key → SUPABASE_ANON_KEY
   - service_role key → SUPABASE_SERVICE_KEY

### Step 2: Netlify (free)
1. Push this folder to a GitHub repo
2. netlify.com → New site → Import from GitHub
3. Site Settings → Environment Variables → Add:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_KEY` = your service key
4. Redeploy

### Step 3: Wire the keys into login.html + app.html
Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in both files with your actual values.
(These are the public anon key — safe to put in HTML.)

### Step 4: Test
- Visit your Netlify URL
- Register as a student → confirm email → log in
- Register as a teacher → see class roster
- Try demo mode (no account needed)

## Access control
| User type       | Access level | How |
|----------------|-------------|-----|
| Demo visitor   | Week 1 only  | Click "Try Demo" |
| Free student   | Week 1 only  | Register, no code |
| School student | All 12 weeks | Register + school code |
| Teacher/School | All 12 weeks | Register as teacher |

## Adding school codes
Supabase Dashboard → Table Editor → access_codes → Insert row:
- code: SCHOOLNAME2025
- school_name: Your School
- active: true
- uses_limit: 50 (or leave null for unlimited)

## Files
```
index.html          ← login page (root)
login.html          ← login page (alias)
app.html            ← main application
netlify.toml        ← Netlify config
supabase-schema.sql ← run once in Supabase
netlify/functions/
  validate-code.js  ← checks school access codes
  save-progress.js  ← saves student progress to DB
  get-roster.js     ← returns student list to teachers
```
