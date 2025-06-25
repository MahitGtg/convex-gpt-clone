# Convex GPT Clone

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), using [Convex](https://convex.dev) as the backend for real-time data and serverless functions.

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

---

## Backend: Convex

This project uses [Convex](https://convex.dev) for the backend. All serverless functions and database logic live in the [`convex/`](./convex) directory.

To run Convex locally for development:

```bash
npx convex dev
```

See the [Convex documentation](https://docs.convex.dev/) for more details on writing queries, mutations, and deploying your backend.

---

## Deployment

This project is deployed and accessible at:

**(https://convex-gpt-clone.vercel.app/chat)**

---

