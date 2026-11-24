# APEX RN Prep

The public website is a static React application. Page content is stored in
`client/src/data/`, and uploaded images used by the pages are served from
`client/public/uploads/`. The public client does not require the API server or
an admin dashboard.

## Requirements

- Node.js 20+
- npm 10+

## Run the website

```bash
npm install --prefix client
npm run dev --prefix client
```

The development server prints the local URL when it starts.

## Build and preview

```bash
npm run build --prefix client
npm run preview --prefix client
```

The production-ready static site is generated in `client/dist/` and can be
deployed to any static hosting provider. Configure the host to serve
`index.html` for client-side routes.

## Content and forms

Update the JSON files in `client/src/data/` and rebuild to change page content.
The contact and Q&A forms open a prefilled message in the visitor's email
application; they do not submit data to an admin inbox. Booking, video embeds,
WhatsApp, and some external images still depend on their respective third-party
services being available.

The `server/` directory remains in the repository but is not needed to build,
run, or deploy the public React website.
