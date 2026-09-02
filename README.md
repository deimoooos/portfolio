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

## Deploying

### Vercel

1. Commit everything and push to a Git remote (GitHub, GitLab or Bitbucket).
2. At [vercel.com/new](https://vercel.com/new), import the repository.
3. Leave the defaults: Vercel detects Next.js, and `yarn build` / `.next` are
   already correct. There are no environment variables to set.
4. Check **Settings → General → Node.js Version** is 22.x or newer. Vercel takes
   the version from that setting, not from `.nvmrc` — that file is only for
   `nvm use` locally.
5. Deploy. Every later push to the default branch redeploys; pushes to other
   branches get preview URLs.

**Do not add `output: "standalone"` back unconditionally.** That makes
`next build` assemble `.next/standalone` from the server's file-tracing
manifest, and on Vercel the build fails inside `next build` with:

```
Error: ENOENT: no such file or directory, open '/vercel/path0/.next/next-server.js.nft.json'
```

Vercel traces and packages the output itself and has no use for that directory.
`next.config.ts` now switches it on only when `BUILD_STANDALONE=1`, which is set
in the Dockerfile and nowhere else.

Note that `/`, `/experience` and `/tech-stack` build as ISR with a one-day
revalidate rather than fully static, because a current role's duration is
computed at render time.

### Docker

```bash
docker build -t portfolio .          # sets BUILD_STANDALONE=1 internally
docker run --rm -p 3000:3000 portfolio
```

The runner stage copies `.next/standalone`, so the image only works if the
builder stage set `BUILD_STANDALONE=1`. If you ever move the build out of the
Dockerfile, that variable has to move with it.
