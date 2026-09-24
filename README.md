This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

The app needs a Node.js host (Vercel, or `npm run build` then `npm run start`). Copy `.env.example` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` — the public https origin, used for the sitemap
- `APIFY_TOKEN` — only if admins run live scrapes from the dashboard

Sign-in is an email code. There is no password. In Supabase → Authentication → Email Templates, replace the Magic Link template body with the code only:

```html
<h2>Your OutsideIR35 code</h2>
<p>Enter this code to sign in: {{ .Token }}</p>
```

Apply the SQL files in `supabase/migrations/` in filename order, including `20260924153000_otp_auth.sql`.

In the Supabase dashboard, set Auth → URL configuration:

- Site URL: the same value as `NEXT_PUBLIC_SITE_URL`
- Redirect URLs: `https://YOUR_DOMAIN/auth/callback` and `http://localhost:3000/auth/callback`

```bash
npm run build
npm run start
```
