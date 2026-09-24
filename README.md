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

Sign-in is email and password. A normal login does not send email. In Supabase, open Authentication → Sign In / Providers → Email and turn off **Confirm email**, so creating an account does not send mail either. Password reset still uses Supabase email, which is rate-limited on the built-in sender.

Apply the SQL files in `supabase/migrations/` in filename order, including `20260924153000_otp_auth.sql` and `20260925001000_job_category_tree.sql`.

In the Supabase dashboard, set Auth → URL configuration:

- Site URL: `https://outsideir35.vercel.app`
- Redirect URLs: `https://outsideir35.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

Set `NEXT_PUBLIC_SITE_URL` to `https://outsideir35.vercel.app` on Vercel.

```bash
npm run build
npm run start
```
