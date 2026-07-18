# Admin (added)

One admin account, with its own login page — not the regular signup flow.

## Setup (one-time)

Add these 3 lines to your existing `.env` file:

```
ADMIN_EMAIL=youremail@example.com
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_USERNAME=admin
```

(`ADMIN_USERNAME` is optional, defaults to "admin".)

That's it — start the server as usual (`node app.js`). On startup it
automatically creates this account in the database with `role: "admin"`
if it doesn't exist yet (or keeps it in sync if you change the password
in `.env` later). There is no public sign-up for this account.

## Using it

- Log in at **`/admin/login`** (separate from `/auth/login`) with the
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set above.
- You'll land on **`/admin/dashboard`** — every resource on the platform,
  with a Delete button on each one.
- An "Admin" link also shows up in the navbar once you're logged in as
  admin.
- The admin can now also delete from a resource's own page
  (`/resource/view/:id`) — previously only the uploader could.

## What changed

- `middleware.js` — added `isAdmin` and `isOwnerOrAdmin` (new exports,
  nothing existing removed).
- `routes/resourceRoute.js` — delete route now uses `isOwnerOrAdmin`
  instead of `isOwner`, so the admin can delete anyone's post; normal
  users still can't delete each other's.
- `utils/ensureAdmin.js` (new) — creates/syncs the one admin account from
  `.env` at startup.
- `controllers/admin.js`, `routes/adminRoute.js` (new) — admin login +
  dashboard.
- `views/admin/login.ejs`, `views/admin/dashboard.ejs` (new).
- `views/view.ejs` — delete button also shows for the admin.
- `views/layouts/boilerplate.ejs` — "Admin" nav link, shown only when
  logged in as admin.

Nothing else in the app was touched — no load balancer, no other route
or controller changes.

## One thing to be aware of

I left `controllers/user.js` / `schemaValidation.js` untouched as
requested. That means the regular `/auth/signup` route still technically
accepts a `role` field in the request body (the Joi schema allows it),
so someone crafting a raw POST request (e.g. via Postman) could still
set `role: "admin"` on a normal signup. It doesn't affect your dedicated
admin account, but if you want that closed off too, say the word and
I'll fix just that one line.
