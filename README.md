# Ahmed Hamid Architecture — Website

## Setup (one-time)

1. **Supabase** — open your project's SQL Editor and run `supabase-schema.sql`. This creates every table the site needs (`site_content`, `services`, `projects`, `blog_posts`, `blog_comments`, `page_views`).
2. **Logo** — `assets/logo.png` is already in place from your uploaded file.
3. **Deploy** — push to GitHub, import into Vercel (already connected per your setup). No build step needed — it's static HTML/CSS/JS.
4. All credentials (Supabase URL/key, Formspree endpoint, Google Drive Apps Script URL, GA ID) are centralized in `script.js` under `CONFIG` — edit them there if anything changes.

## How the admin panel works

- Sign in at `/admin.html` with **ahmedhamidarchitecture@gmail.com** and password **123456** (change it after your first login — it's stored as a hash in the browser's `localStorage`).
- "Forgot password" generates a 6-digit code and sends it through your existing Formspree endpoint, so it lands wherever Formspree currently delivers your form submissions.
- From the dashboard you can edit the About page, add Home page announcements/job posts, manage Services, and create/edit/delete Projects and Blog posts. Project and blog images upload to your Google Drive folder through the Apps Script URL you provided.
- The Overview tab charts visits recorded in the `page_views` table (daily/weekly/monthly). Your real Google Analytics numbers live at analytics.google.com under property `G-S8XNQKS8F3` — the GA tracking snippet is already installed sitewide.

## ⚠️ Please read — security tradeoffs of this admin setup

You asked for a simple email + password login with a "forgot password" email-code flow, with no separate backend server. Here's what that means in practice:

- **The login check happens in the visitor's own browser**, not on a server. Your password is stored as a SHA-256 hash in `localStorage`, and the check itself is visible to anyone who reads the page's JavaScript. It will stop casual visitors, but it will not stop someone who specifically wants to bypass it.
- **The same Supabase "anon" key that the public site uses to *read* content is also used by the admin panel to *write* it.** That key is visible in `script.js`. The database policies (in `supabase-schema.sql`) currently allow anyone with that key to write directly to your tables via the Supabase API — not just through your admin panel.
- **The practical fix**, when you're ready, is to switch to **Supabase Auth**: give yourself a real account with a real password, and change the database policies so writes require `auth.uid()` to match your admin account instead of being open to anyone with the anon key. That's a half-day of work for a developer and it closes both gaps above — the login becomes a real server-verified session, and the database refuses writes from anyone who isn't you.

I built it the way you described because that's what you asked for, but I'd be doing you a disservice not to flag this clearly — it's fine for a low-stakes single-admin site, but don't store anything you'd be upset to see altered by a stranger.

## File map

```
index.html        Home
about.html        About Us (admin-editable)
services.html     Services (admin-editable)
projects.html     Project listing
project.html      Project detail (?id=)
blog.html         Blog + comments
contact.html      Contact / project request form (Formspree)
admin.html        Admin login + dashboard shell
admin.js          All admin logic (login, reset, CRUD)
script.js         Shared header/footer, CONFIG, Supabase helpers, GA
style.css         Design system
supabase-schema.sql  Run once in Supabase SQL editor
```
