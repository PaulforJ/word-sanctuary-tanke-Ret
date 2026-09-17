# New Member Care

A simple dashboard for tracking new church members from their first
visit through their first month, so nobody gets forgotten.

## What it does

- **Members** — one record per new person: contact details, first
  visit date, prayer request, interests, and a "stage" (new,
  contacted, engaged, at risk, dropped off).
- **Welcome journey** — every new member automatically gets three
  steps: Day 0 (welcome), Day 7 (check-in), Day 30 (invite to get
  involved). Each has a "Send on WhatsApp" button that opens
  WhatsApp with a pre-written message ready to send.
- **Follow-up tasks** — a simple to-do list per member ("Call to
  invite to class"), and one combined list of everything outstanding
  across all members.
- **Dashboard** — new members in the last 30 days, who hasn't been
  welcomed yet, and who looks at risk of dropping off.

Only **coordinators** can add new members or change someone's stage.
Everyone with a login can view records, tick off journey steps, and
manage tasks.

---

## 1. Set up Supabase (the database)

1. Create a free project at supabase.com.
2. In your project, go to **SQL Editor → New query**, paste the
   entire contents of `supabase/schema.sql` from this project, and
   click **Run**. This creates all the tables and rules in one go.
3. Go to **Project Settings → API**. You'll need two values for the
   next step:
   - **Project URL**
   - **anon public** key

## 2. Create logins for your volunteers

1. In Supabase, go to **Authentication → Users → Add user**.
2. Add each person who needs access, with an email and a password
   you choose (you can share this with them directly, or they can
   reset it later). Every new user starts as a **volunteer**
   automatically.
3. To make someone a **coordinator** (able to add new members and
   change stages), go to **Table Editor → profiles**, find their
   row, and change `role` from `volunteer` to `coordinator`.

Since you're starting with one shared login for now: create a single
user (e.g. `team@yourchurch.org`), share the password with your
10–17 volunteers, and promote it to `coordinator` if you want that
shared login to also be able to add members. You can always split
into individual logins later — no data needs to change, just add
more users in step 2.

## 3. Run it locally (optional, to preview before deploying)

```bash
npm install
cp .env.example .env
# edit .env and paste your Supabase Project URL and anon key
npm run dev
```

Open the printed local address in your browser.

## 4. Put the code on GitHub

```bash
git init
git add .
git commit -m "New member care app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

(Create the empty repository on GitHub first, then run the commands
above from inside this project folder.)

## 5. Deploy on Vercel

1. Go to vercel.com → **Add New → Project**
   → import the GitHub repository you just pushed.
2. Vercel will detect it's a Vite project automatically — no build
   settings to change.
3. Before deploying, add your environment variables under
   **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. You'll get a live URL you can share with your
   team.

Every time you push new changes to GitHub, Vercel redeploys
automatically.

---

## What's intentionally left out of this first version

To keep this usable quickly, it does **not** yet include: automatic
(no-tap) WhatsApp sending, small group matching, event
registration, or reports. The "Send on WhatsApp" button opens a
pre-filled message that a volunteer taps send on — this needs no
approval process and costs nothing, unlike the WhatsApp Business
API. Once this is running and proven, ask to add any of the above.

## Editing the WhatsApp message templates

Open `src/lib/helpers.js` and edit the `defaultMessage` function —
each journey step (`day0`, `day7`, `day30`) has its own message
text you can rewrite in your own words.
