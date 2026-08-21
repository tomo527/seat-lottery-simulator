# Deployment

## Production path

The established production path is:

```text
authorized commit on main
        ▼
push to GitHub
        ▼
Cloudflare Workers Builds integration
        ▼
https://seat-lottery-simulator.studiotomo.workers.dev/
```

Cloudflare is configured with production branch `main`, build command `npm run build`, and deploy command `npx wrangler deploy`. There is no repository-owned GitHub Actions workflow for deployment; the Workers Builds integration is configured outside the repository.

## Release checklist

1. Confirm the final branch, `HEAD`, `origin/main`, and working tree. Preserve unrelated changes.
2. Run the profile from [`VALIDATION.md`](VALIDATION.md): normally `verify:full`, or `verify:venues` for production venue-data changes.
3. Review source and generated diffs. Confirm disclosures, legal behavior, production fingerprints, counts, and lazy-loaded runtime paths remain consistent.
4. Commit and push only with explicit authorization. Never force-push.
5. Confirm the final pushed `HEAD` receives a successful `Workers Builds: seat-lottery-simulator` result when that status is accessible.
6. Smoke-test the public URL: HTTP/load success, expected venue/configuration visibility, lazy detail loading, one real draw, and no browser console errors. Venue additions should be checked individually.
7. Record the deployed commit, build/public verification, and any control-plane visibility limitation in [`HANDOFF.md`](HANDOFF.md).

## Local deploy command

`npm run deploy` runs a fresh production build and then `wrangler deploy`. It is a manual, production-impacting fallback and must not be used without explicit deployment authorization and valid Cloudflare credentials. Do not store account IDs, API tokens, or other secrets in the repository.
