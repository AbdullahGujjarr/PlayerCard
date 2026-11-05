# DropCard

A mobile-first installable web app where PUBG Mobile players log matches with a
screenshot, track progress, and share a player card. Built with Next.js, MongoDB
Atlas and Cloudinary.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Install and start:

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use `npm test` for the screenshot parser tests.

## Atlas connection

`MONGODB_URI` can be the `mongodb+srv://` string from Atlas. If that fails with
`queryTxt ETIMEOUT`, the network is blocking the DNS TXT lookup; use the standard
`mongodb://host1,host2,host3/?tls=true&authSource=admin` form instead.

Atlas must also allow the server's IP under Network Access.

## Deploy

Deploy to any Node host, such as Vercel. Add every variable from `.env.example`
to the host and set `NEXT_PUBLIC_SITE_URL` to the real domain so share previews
work. Installing to the home screen needs HTTPS.

## Rename the app

The name and tagline live in `src/lib/brand.ts`. Also update the icons in
`public/icons`.
